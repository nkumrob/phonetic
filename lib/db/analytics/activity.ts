/**
 * @module analytics/activity
 * Recent activity feed: a unified, time-ordered view of AI tool runs and
 * tracked analytics events.
 */

import { resolveDb, type DbLike } from './shared';

export interface ActivityItem {
  /** ISO datetime string (created_at value from the DB). */
  at: string;
  kind: 'ai' | 'event';
  name: string;
  tool: string | null;
  /** First 8 characters of anon_id, or null when anon_id is null. */
  anonShort: string | null;
  country: string | null;
}

/**
 * Returns the most recent activity items, newest first.
 *
 * @param limit - Maximum rows to return (default 50).
 * @param deps  - Optional injectable deps for testing.
 */
export async function getRecentActivity(
  limit = 50,
  deps?: { db?: DbLike },
): Promise<ActivityItem[]> {
  const db = await resolveDb(deps);

  const result = await db.execute({
    sql: `select at, kind, name, tool, anon_id, country from (
          select created_at as at,
                 'ai'       as kind,
                 tool_name  as name,
                 tool_name  as tool,
                 anon_id,
                 country
          from tool_usage
          union all
          select created_at as at,
                 'event'    as kind,
                 name,
                 tool,
                 anon_id,
                 country
          from events
        )
        order by at desc
        limit ?`,
    args: [limit],
  });

  return (result.rows as Array<Record<string, unknown>>).map((r) => ({
    at: String(r.at),
    kind: r.kind === 'ai' ? 'ai' : ('event' as 'ai' | 'event'),
    name: String(r.name ?? ''),
    tool: r.tool != null ? String(r.tool) : null,
    anonShort: r.anon_id != null ? String(r.anon_id).slice(0, 8) : null,
    country: r.country != null ? String(r.country) : null,
  }));
}
