/**
 * Read-side aggregates for the admin dashboard and (Phase 3) the public
 * impact page. All queries are range-bound; `days` is validated by the
 * API layer (7|30|90). Time-saved midpoints mirror lib/client/time-saved.ts.
 */

export interface DbLike {
  execute(stmt: { sql: string; args?: unknown[] }): Promise<{ rows: unknown[]; rowsAffected: number }>;
}

export interface DailyPoint {
  date: string; // YYYY-MM-DD
  ai: number;
  other: number;
}

export interface OverviewStats {
  uniqueVisitors: number;
  interactions: number;
  aiConversations: number;
  tokens: number;
  timeSavedMinutes: number;
  dailySeries: DailyPoint[];
  toolLeaderboard: Array<{ tool: string; uses: number }>;
  timeSavedDistribution: Array<{ bucket: string; votes: number }>;
}

export interface ToolStatsRow {
  tool: string;
  uses: number;
  uniqueUsers: number;
  inputTokens: number | null;
  outputTokens: number | null;
  avgLatencyMs: number | null;
  timeSavedVotes: number | null;
}

const TIME_SAVED_MINUTES_SQL = `case time_saved_bucket
  when '<1' then 0.5 when '1-5' then 3 when '5-15' then 10 when '15+' then 20 else 0 end`;

// events whose `tool` value belongs on a tool leaderboard, with the display
// key it maps to. template_use is excluded (its tool is an AI tool id and
// would double-count that tool's runs); page_view's tool is a pathname.
const LEADERBOARD_EVENT_KEYS: Record<string, string> = {
  converter_use: 'phonetic-converter',
  practice_session: 'practice',
};

async function resolveDb(deps?: { db?: DbLike }): Promise<DbLike> {
  if (deps?.db) return deps.db;
  const { getDb } = await import('./client');
  return getDb() as unknown as DbLike;
}

/**
 * Calendar-day aligned with dailySeries: returns the offset for midnight of
 * the first series day (`date('now', since(days))` == start of day N-1 ago).
 */
function since(days: number): string {
  return `-${days - 1} days`;
}

function num(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : Number(value) || 0;
}

export async function getOverviewStats(days: number, deps?: { db?: DbLike }): Promise<OverviewStats> {
  const db = await resolveDb(deps);
  const s = since(days);

  const [kpis, visitors, eventsDaily, usageDaily, usageTools, eventTools, distribution] = await Promise.all([
    db.execute({
      sql: `select
        (select count(*) from tool_usage where created_at >= date('now', ?)) as ai_conversations,
        (select count(*) from events where name != 'page_view' and created_at >= date('now', ?)) as event_interactions,
        (select coalesce(sum(input_tokens + output_tokens), 0) from tool_usage where created_at >= date('now', ?)) as tokens,
        (select coalesce(sum(${TIME_SAVED_MINUTES_SQL}), 0) from tool_usage
           where time_saved_bucket is not null and created_at >= date('now', ?)) as time_saved`,
      args: [s, s, s, s],
    }),
    db.execute({
      sql: `select count(distinct anon_id) as visitors from (
        select anon_id from events where anon_id is not null and created_at >= date('now', ?)
        union
        select anon_id from tool_usage where anon_id is not null and created_at >= date('now', ?)
      )`,
      args: [s, s],
    }),
    db.execute({
      sql: `select date(created_at) as day, count(*) as n from events
        where name != 'page_view' and created_at >= date('now', ?) group by day`,
      args: [s],
    }),
    db.execute({
      sql: `select date(created_at) as day, count(*) as n from tool_usage
        where created_at >= date('now', ?) group by day`,
      args: [s],
    }),
    db.execute({
      sql: `select tool_name as tool, count(*) as uses from tool_usage
        where created_at >= date('now', ?) group by tool_name`,
      args: [s],
    }),
    db.execute({
      sql: `select name, count(*) as uses from events
        where name in ('converter_use','practice_session') and created_at >= date('now', ?) group by name`,
      args: [s],
    }),
    db.execute({
      sql: `select time_saved_bucket as bucket, count(*) as votes from tool_usage
        where time_saved_bucket is not null and created_at >= date('now', ?) group by bucket`,
      args: [s],
    }),
  ]);

  const k = kpis.rows[0] as Record<string, unknown>;
  const aiConversations = num(k.ai_conversations);

  const leaderboard = new Map<string, number>();
  for (const row of usageTools.rows as Array<{ tool: string; uses: unknown }>) {
    leaderboard.set(row.tool, num(row.uses));
  }
  for (const row of eventTools.rows as Array<{ name: string; uses: unknown }>) {
    const key = LEADERBOARD_EVENT_KEYS[row.name];
    if (key) leaderboard.set(key, (leaderboard.get(key) ?? 0) + num(row.uses));
  }

  return {
    uniqueVisitors: num((visitors.rows[0] as Record<string, unknown>).visitors),
    interactions: num(k.event_interactions) + aiConversations,
    aiConversations,
    tokens: num(k.tokens),
    timeSavedMinutes: num(k.time_saved),
    dailySeries: buildDailySeries(days, eventsDaily.rows, usageDaily.rows),
    toolLeaderboard: [...leaderboard.entries()]
      .map(([tool, uses]) => ({ tool, uses }))
      .sort((a, b) => b.uses - a.uses),
    timeSavedDistribution: (distribution.rows as Array<{ bucket: string; votes: unknown }>).map((r) => ({
      bucket: r.bucket,
      votes: num(r.votes),
    })),
  };
}

function buildDailySeries(days: number, eventRows: unknown[], usageRows: unknown[]): DailyPoint[] {
  const other = new Map((eventRows as Array<{ day: string; n: unknown }>).map((r) => [r.day, num(r.n)]));
  const ai = new Map((usageRows as Array<{ day: string; n: unknown }>).map((r) => [r.day, num(r.n)]));

  const series: DailyPoint[] = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() - i);
    const date = d.toISOString().slice(0, 10);
    series.push({ date, ai: ai.get(date) ?? 0, other: other.get(date) ?? 0 });
  }
  return series;
}

export async function getToolStats(days: number, deps?: { db?: DbLike }): Promise<ToolStatsRow[]> {
  const db = await resolveDb(deps);
  const s = since(days);

  const [usage, events] = await Promise.all([
    db.execute({
      sql: `select tool_name as tool, count(*) as uses, count(distinct anon_id) as unique_users,
              sum(input_tokens) as input_tokens, sum(output_tokens) as output_tokens,
              round(avg(latency_ms)) as avg_latency,
              sum(case when time_saved_bucket is not null then 1 else 0 end) as votes
            from tool_usage where created_at >= date('now', ?) group by tool_name`,
      args: [s],
    }),
    db.execute({
      sql: `select name, count(*) as uses, count(distinct anon_id) as unique_users from events
            where name in ('converter_use','practice_session') and created_at >= date('now', ?) group by name`,
      args: [s],
    }),
  ]);

  const rows: ToolStatsRow[] = (usage.rows as Array<Record<string, unknown>>).map((r) => ({
    tool: String(r.tool),
    uses: num(r.uses),
    uniqueUsers: num(r.unique_users),
    inputTokens: num(r.input_tokens),
    outputTokens: num(r.output_tokens),
    avgLatencyMs: num(r.avg_latency),
    timeSavedVotes: num(r.votes),
  }));

  for (const r of events.rows as Array<Record<string, unknown>>) {
    const key = LEADERBOARD_EVENT_KEYS[String(r.name)];
    if (!key) continue;
    rows.push({
      tool: key,
      uses: num(r.uses),
      uniqueUsers: num(r.unique_users),
      inputTokens: null,
      outputTokens: null,
      avgLatencyMs: null,
      timeSavedVotes: null,
    });
  }

  return rows.sort((a, b) => b.uses - a.uses);
}
