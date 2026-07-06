/**
 * The np_anon cookie is client-controlled; only UUID-format values (what
 * middleware issues) are trusted. Shared by every anon_id persistence path
 * so cross-table distinct counts stay comparable.
 */
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function parseAnonId(raw: string | undefined): string | null {
  return raw !== undefined && UUID_PATTERN.test(raw) ? raw : null;
}
