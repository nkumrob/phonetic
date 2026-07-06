import {
  ACTIVITY_DEFAULT_LIMIT,
  ACTIVITY_MIN_LIMIT,
  ACTIVITY_MAX_LIMIT,
} from '@/lib/db/analytics/activity';

/**
 * Parses and silently clamps the activity feed's `limit` query param.
 *
 * Kept as a pure function so it is unit-testable without hitting the DB or
 * mocking modules. The route delegates here; the DB layer (`getRecentActivity`)
 * also clamps defensively, so this is one of two layers that guarantee a
 * bounded LIMIT.
 *
 * Bounds are imported from the DB module so they cannot drift apart.
 *
 * @param raw - The raw query-string value (or null when absent).
 * @returns An integer in [ACTIVITY_MIN_LIMIT, ACTIVITY_MAX_LIMIT],
 *          defaulting to ACTIVITY_DEFAULT_LIMIT for missing/invalid input
 *          (including empty string).
 */
export function parseActivityLimit(raw: string | null): number {
  // Treat null and empty string both as "param absent → default".
  if (raw === null || raw === '') return ACTIVITY_DEFAULT_LIMIT;
  const n = Number(raw);
  if (!Number.isFinite(n)) return ACTIVITY_DEFAULT_LIMIT;
  return Math.min(ACTIVITY_MAX_LIMIT, Math.max(ACTIVITY_MIN_LIMIT, Math.floor(n)));
}
