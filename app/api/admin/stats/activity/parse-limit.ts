/**
 * Parses and silently clamps the activity feed's `limit` query param.
 *
 * Kept as a pure, dependency-free function so it is unit-testable without
 * hitting the DB or mocking modules. The route delegates here; the DB layer
 * (`getRecentActivity`) also clamps defensively, so this is one of two layers
 * that guarantee a bounded LIMIT.
 *
 * @param raw - The raw query-string value (or null when absent).
 * @returns An integer in [1, 200], defaulting to 50 for missing/invalid input.
 */
export function parseActivityLimit(raw: string | null): number {
  const DEFAULT = 50;
  const MIN = 1;
  const MAX = 200;

  if (raw === null) return DEFAULT;
  const n = Number(raw);
  if (!Number.isFinite(n)) return DEFAULT;
  return Math.min(MAX, Math.max(MIN, Math.floor(n)));
}
