/**
 * @module analytics/shared
 * Injectable DB types and helper functions shared across all analytics
 * sub-modules. Keep this file free of business logic.
 */

/** Minimal interface for an injectable database client (libSQL or in-memory). */
export interface DbLike {
  execute(stmt: { sql: string; args?: unknown[] }): Promise<{ rows: unknown[]; rowsAffected: number }>;
}

/**
 * Resolves the injectable DB dep, falling back to the Turso singleton when
 * no dep is provided.
 */
export async function resolveDb(deps?: { db?: DbLike }): Promise<DbLike> {
  if (deps?.db) return deps.db;
  const { getDb } = await import('../client');
  return getDb() as unknown as DbLike;
}

/**
 * Returns the SQLite `date('now', ?)` offset string for a calendar-day window
 * that starts N-1 days ago and ends today (inclusive).
 *
 * Aligns with the daily series: `date('now', since(days))` == the first day
 * in the series.
 */
export function since(days: number): string {
  return `-${days - 1} days`;
}

/** Coerces an unknown DB column value to a finite number, defaulting to 0. */
export function num(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : Number(value) || 0;
}

/**
 * Maps event names whose `tool` column doubles as a leaderboard display key.
 * Shared by traffic.ts (toolLeaderboard) and tools.ts (per-tool rows) so the
 * mapping lives in exactly one place.
 */
export const LEADERBOARD_EVENT_KEYS: Record<string, string> = {
  converter_use: 'phonetic-converter',
  practice_session: 'practice',
};
