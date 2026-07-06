/**
 * @module analytics/activity
 * Recent activity feed: a unified, time-ordered view of AI tool runs and
 * tracked analytics events.
 */

import { resolveDb, type DbLike } from './shared';

/** Bounds for the activity feed page size (exported so parse-limit.ts and tests can share them). */
export const ACTIVITY_MIN_LIMIT = 1;
export const ACTIVITY_MAX_LIMIT = 200;
export const ACTIVITY_DEFAULT_LIMIT = 50;

/**
 * Defensively coerces the caller-supplied limit to a safe integer in
 * [MIN_LIMIT, MAX_LIMIT], defaulting to DEFAULT_LIMIT for undefined or
 * non-finite input. Keeps the LIMIT clause bounded regardless of the caller.
 */
function clampLimit(limit: number | undefined): number {
  if (typeof limit !== 'number' || !Number.isFinite(limit)) return ACTIVITY_DEFAULT_LIMIT;
  return Math.min(ACTIVITY_MAX_LIMIT, Math.max(ACTIVITY_MIN_LIMIT, Math.floor(limit)));
}

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
 * @param limit - Maximum rows to return; clamped to an integer in [1, 200],
 *                defaulting to 50 for undefined or non-finite input.
 * @param deps  - Optional injectable deps for testing.
 */
export async function getRecentActivity(
  limit?: number,
  deps?: { db?: DbLike },
): Promise<ActivityItem[]> {
  const db = await resolveDb(deps);
  const safeLimit = clampLimit(limit);

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
    args: [safeLimit],
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
