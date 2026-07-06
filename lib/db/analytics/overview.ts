/**
 * @module analytics/overview
 * KPI aggregates for the admin Overview page. All KPIs carry both the current
 * window value and the preceding window of the same length (KpiWithDelta).
 *
 * Previous-window filter:
 *   created_at >= date('now', '-(2N-1) days') AND created_at < date('now', '-(N-1) days')
 */

import { resolveDb, since, num, type DbLike } from './shared';

/** A metric paired with its immediately-preceding-window value for delta display. */
export interface KpiWithDelta {
  /** Value in the current window. */
  current: number;
  /** Value in the window immediately before, of the same length. */
  previous: number;
}

export interface OverviewStats {
  uniqueVisitors: KpiWithDelta;
  interactions: KpiWithDelta;
  aiConversations: KpiWithDelta;
  tokens: KpiWithDelta;
  timeSavedMinutes: KpiWithDelta;
  /** Count of events with name = 'page_view'. */
  pageViews: KpiWithDelta;
  /** One entry per calendar day in the window, oldest first.
   *  prevTotal = ai + other from the corresponding day one full window earlier. */
  dailySeries: Array<{ date: string; ai: number; other: number; prevTotal: number }>;
}

const TIME_SAVED_SQL = `case time_saved_bucket
  when '<1' then 0.5 when '1-5' then 3 when '5-15' then 10 when '15+' then 20 else 0 end`;

export async function getOverviewStats(
  days: number,
  deps?: { db?: DbLike },
): Promise<OverviewStats> {
  const db = await resolveDb(deps);
  const s = since(days); // '-(days-1) days'  e.g. '-6 days' for days=7
  // Previous window: the N-day block immediately before the current window.
  // prevSince = '-(2N-1) days', prevEnd = '-(N-1) days' (== s)
  const prevSince = `-${2 * days - 1} days`;
  const prevEnd = s;

  const [
    currentKpis,
    currentVisitors,
    prevKpis,
    prevVisitors,
    eventsDaily,
    usageDaily,
    prevEventsDaily,
    prevUsageDaily,
  ] = await Promise.all([
    // ── Current window KPIs ──────────────────────────────────────────────────
    db.execute({
      sql: `select
          (select count(*) from tool_usage where created_at >= date('now', ?)) as ai_conversations,
          (select count(*) from events
             where name != 'page_view' and created_at >= date('now', ?)) as event_interactions,
          (select coalesce(sum(input_tokens + output_tokens), 0)
             from tool_usage where created_at >= date('now', ?)) as tokens,
          (select coalesce(sum(${TIME_SAVED_SQL}), 0) from tool_usage
             where time_saved_bucket is not null and created_at >= date('now', ?)) as time_saved,
          (select count(*) from events
             where name = 'page_view' and created_at >= date('now', ?)) as page_views`,
      args: [s, s, s, s, s],
    }),
    db.execute({
      sql: `select count(distinct anon_id) as visitors from (
          select anon_id from events where anon_id is not null and created_at >= date('now', ?)
          union
          select anon_id from tool_usage where anon_id is not null and created_at >= date('now', ?)
        )`,
      args: [s, s],
    }),
    // ── Previous window KPIs ─────────────────────────────────────────────────
    db.execute({
      sql: `select
          (select count(*) from tool_usage
             where created_at >= date('now', ?) and created_at < date('now', ?)) as ai_conversations,
          (select count(*) from events
             where name != 'page_view'
               and created_at >= date('now', ?) and created_at < date('now', ?)) as event_interactions,
          (select coalesce(sum(input_tokens + output_tokens), 0) from tool_usage
             where created_at >= date('now', ?) and created_at < date('now', ?)) as tokens,
          (select coalesce(sum(${TIME_SAVED_SQL}), 0) from tool_usage
             where time_saved_bucket is not null
               and created_at >= date('now', ?) and created_at < date('now', ?)) as time_saved,
          (select count(*) from events
             where name = 'page_view'
               and created_at >= date('now', ?) and created_at < date('now', ?)) as page_views`,
      args: [prevSince, prevEnd, prevSince, prevEnd, prevSince, prevEnd, prevSince, prevEnd, prevSince, prevEnd],
    }),
    db.execute({
      sql: `select count(distinct anon_id) as visitors from (
          select anon_id from events
            where anon_id is not null and created_at >= date('now', ?) and created_at < date('now', ?)
          union
          select anon_id from tool_usage
            where anon_id is not null and created_at >= date('now', ?) and created_at < date('now', ?)
        )`,
      args: [prevSince, prevEnd, prevSince, prevEnd],
    }),
    // ── Current daily series ─────────────────────────────────────────────────
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
    // ── Previous daily series (for prevTotal) ─────────────────────────────────
    db.execute({
      sql: `select date(created_at) as day, count(*) as n from events
          where name != 'page_view'
            and created_at >= date('now', ?) and created_at < date('now', ?) group by day`,
      args: [prevSince, prevEnd],
    }),
    db.execute({
      sql: `select date(created_at) as day, count(*) as n from tool_usage
          where created_at >= date('now', ?) and created_at < date('now', ?) group by day`,
      args: [prevSince, prevEnd],
    }),
  ]);

  const ck = currentKpis.rows[0] as Record<string, unknown>;
  const pk = prevKpis.rows[0] as Record<string, unknown>;
  const currentAi = num(ck.ai_conversations);
  const prevAi = num(pk.ai_conversations);

  return {
    uniqueVisitors: {
      current: num((currentVisitors.rows[0] as Record<string, unknown>).visitors),
      previous: num((prevVisitors.rows[0] as Record<string, unknown>).visitors),
    },
    interactions: {
      current: num(ck.event_interactions) + currentAi,
      previous: num(pk.event_interactions) + prevAi,
    },
    aiConversations: { current: currentAi, previous: prevAi },
    tokens: { current: num(ck.tokens), previous: num(pk.tokens) },
    timeSavedMinutes: { current: num(ck.time_saved), previous: num(pk.time_saved) },
    pageViews: { current: num(ck.page_views), previous: num(pk.page_views) },
    dailySeries: buildDailySeries(
      days,
      eventsDaily.rows,
      usageDaily.rows,
      prevEventsDaily.rows,
      prevUsageDaily.rows,
    ),
  };
}

function buildDailySeries(
  days: number,
  eventRows: unknown[],
  usageRows: unknown[],
  prevEventRows: unknown[],
  prevUsageRows: unknown[],
): Array<{ date: string; ai: number; other: number; prevTotal: number }> {
  const other = new Map((eventRows as Array<{ day: string; n: unknown }>).map((r) => [r.day, num(r.n)]));
  const ai = new Map((usageRows as Array<{ day: string; n: unknown }>).map((r) => [r.day, num(r.n)]));
  const prevOther = new Map(
    (prevEventRows as Array<{ day: string; n: unknown }>).map((r) => [r.day, num(r.n)]),
  );
  const prevAi = new Map(
    (prevUsageRows as Array<{ day: string; n: unknown }>).map((r) => [r.day, num(r.n)]),
  );

  const series: Array<{ date: string; ai: number; other: number; prevTotal: number }> = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const cur = new Date(today);
    cur.setUTCDate(cur.getUTCDate() - i);
    const date = cur.toISOString().slice(0, 10);

    const prev = new Date(today);
    prev.setUTCDate(prev.getUTCDate() - i - days);
    const prevDate = prev.toISOString().slice(0, 10);

    series.push({
      date,
      ai: ai.get(date) ?? 0,
      other: other.get(date) ?? 0,
      prevTotal: (prevOther.get(prevDate) ?? 0) + (prevAi.get(prevDate) ?? 0),
    });
  }
  return series;
}
