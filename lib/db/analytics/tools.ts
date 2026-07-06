/**
 * @module analytics/tools
 * Per-tool aggregates for the admin Tools page.
 * Kept separate from traffic.ts so each page makes exactly one stats fetch.
 */

import { resolveDb, since, num, type DbLike } from './shared';

export interface ToolStatsRow {
  tool: string;
  uses: number;
  uniqueUsers: number;
  inputTokens: number | null;
  outputTokens: number | null;
  avgLatencyMs: number | null;
  timeSavedVotes: number | null;
}

// Event names whose `tool` column maps to a leaderboard display key.
const LEADERBOARD_EVENT_KEYS: Record<string, string> = {
  converter_use: 'phonetic-converter',
  practice_session: 'practice',
};

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
