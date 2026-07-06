/**
 * @module analytics/traffic
 * Traffic & engagement aggregates for the admin Traffic page:
 * top pages, geo, visitor segmentation (new vs returning),
 * learning funnel, and tool leaderboard (moved here from overview).
 */

import { resolveDb, since, num, type DbLike } from './shared';

export interface TrafficStats {
  /** Top 10 page paths by view count, sorted descending. */
  topPages: Array<{ path: string; views: number }>;
  /** Top 10 countries by distinct visitors (country=null rows excluded). */
  countries: Array<{ country: string; visitors: number; interactions: number }>;
  /** Visitors whose all-time first_seen falls within the current window. */
  newVisitors: number;
  /** Visitors active in the current window whose first_seen predates it. */
  returningVisitors: number;
  /** interactions / uniqueVisitors rounded to 1 decimal; 0 when no visitors. */
  avgInteractionsPerVisitor: number;
  /** Practice session start vs completion counts, grouped by mode (tool column). */
  funnel: Array<{ mode: string; started: number; completed: number }>;
  /** All tools sorted by usage count descending. */
  toolLeaderboard: Array<{ tool: string; uses: number }>;
}

// Event names whose `tool` column maps to a leaderboard display key.
const LEADERBOARD_EVENT_KEYS: Record<string, string> = {
  converter_use: 'phonetic-converter',
  practice_session: 'practice',
};

export async function getTrafficStats(
  days: number,
  deps?: { db?: DbLike },
): Promise<TrafficStats> {
  const db = await resolveDb(deps);
  const s = since(days);

  const [pages, countries, visitors, funnel, usageTools, eventTools, kpis] = await Promise.all([
    // Top pages: page_view events grouped by path (tool column)
    db.execute({
      sql: `select tool as path, count(*) as views from events
          where name = 'page_view' and created_at >= date('now', ?) and tool is not null
          group by tool order by views desc limit 10`,
      args: [s],
    }),
    // Top countries by distinct visitors, with interaction count
    db.execute({
      sql: `select country, count(distinct anon_id) as visitors, count(*) as interactions
          from (
            select country, anon_id from events
              where created_at >= date('now', ?) and country is not null and anon_id is not null
            union all
            select country, anon_id from tool_usage
              where created_at >= date('now', ?) and country is not null and anon_id is not null
          )
          group by country order by visitors desc limit 10`,
      args: [s, s],
    }),
    // New vs returning: first_seen = min(created_at) per anon across ALL time
    db.execute({
      sql: `with all_activity as (
            select anon_id, created_at from events where anon_id is not null
            union all
            select anon_id, created_at from tool_usage where anon_id is not null
          ),
          first_seen as (
            select anon_id, min(created_at) as fs from all_activity group by anon_id
          ),
          active_in_window as (
            select distinct anon_id from all_activity
            where created_at >= date('now', ?)
          )
          select
            sum(case when fs.fs >= date('now', ?) then 1 else 0 end) as new_visitors,
            sum(case when fs.fs < date('now', ?) then 1 else 0 end) as returning_visitors
          from active_in_window a
          left join first_seen fs on a.anon_id = fs.anon_id`,
      args: [s, s, s],
    }),
    // Learning funnel: practice_session (started) vs practice_complete (completed) per mode
    db.execute({
      sql: `select tool as mode,
            sum(case when name = 'practice_session' then 1 else 0 end) as started,
            sum(case when name = 'practice_complete' then 1 else 0 end) as completed
          from events
          where name in ('practice_session', 'practice_complete')
            and created_at >= date('now', ?) and tool is not null
          group by tool`,
      args: [s],
    }),
    // Tool leaderboard — AI tools
    db.execute({
      sql: `select tool_name as tool, count(*) as uses from tool_usage
          where created_at >= date('now', ?) group by tool_name`,
      args: [s],
    }),
    // Tool leaderboard — event-backed tools
    db.execute({
      sql: `select name, count(*) as uses from events
          where name in ('converter_use','practice_session') and created_at >= date('now', ?) group by name`,
      args: [s],
    }),
    // KPIs needed for avgInteractionsPerVisitor
    db.execute({
      sql: `select
            (select count(distinct anon_id) from (
              select anon_id from events where anon_id is not null and created_at >= date('now', ?)
              union
              select anon_id from tool_usage where anon_id is not null and created_at >= date('now', ?)
            )) as unique_visitors,
            (select count(*) from tool_usage where created_at >= date('now', ?)) +
            (select count(*) from events where name != 'page_view' and created_at >= date('now', ?))
              as interactions`,
      args: [s, s, s, s],
    }),
  ]);

  // Build tool leaderboard
  const leaderboard = new Map<string, number>();
  for (const row of usageTools.rows as Array<{ tool: string; uses: unknown }>) {
    leaderboard.set(row.tool, num(row.uses));
  }
  for (const row of eventTools.rows as Array<{ name: string; uses: unknown }>) {
    const key = LEADERBOARD_EVENT_KEYS[row.name];
    if (key) leaderboard.set(key, (leaderboard.get(key) ?? 0) + num(row.uses));
  }

  const k = kpis.rows[0] as Record<string, unknown>;
  const uniqueVisitors = num(k.unique_visitors);
  const interactions = num(k.interactions);
  const vr = visitors.rows[0] as Record<string, unknown>;

  return {
    topPages: (pages.rows as Array<Record<string, unknown>>).map((r) => ({
      path: String(r.path),
      views: num(r.views),
    })),
    countries: (countries.rows as Array<Record<string, unknown>>).map((r) => ({
      country: String(r.country),
      visitors: num(r.visitors),
      interactions: num(r.interactions),
    })),
    newVisitors: num(vr.new_visitors),
    returningVisitors: num(vr.returning_visitors),
    avgInteractionsPerVisitor:
      uniqueVisitors === 0 ? 0 : Math.round((interactions / uniqueVisitors) * 10) / 10,
    funnel: (funnel.rows as Array<Record<string, unknown>>).map((r) => ({
      mode: String(r.mode),
      started: num(r.started),
      completed: num(r.completed),
    })),
    toolLeaderboard: [...leaderboard.entries()]
      .map(([tool, uses]) => ({ tool, uses }))
      .sort((a, b) => b.uses - a.uses),
  };
}
