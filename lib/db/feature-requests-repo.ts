/**
 * Turso-backed data access for feature requests.
 * All functions accept an injectable db (tests pass plain-object fakes);
 * production resolves the singleton.
 */

export interface DbLike {
  execute(stmt: { sql: string; args?: unknown[] }): Promise<{
    rows: unknown[];
    rowsAffected: number;
  }>;
}

interface FeatureRequestRow {
  id: string;
  name: string | null;
  email: string | null;
  request: string;
  created_at: string;
}

export interface FeatureRequest {
  id: string;
  name: string | null;
  email: string | null;
  request: string;
  createdAt: string; // ISO-Z
}

async function resolveDb(deps?: { db?: DbLike }): Promise<DbLike> {
  if (deps?.db) return deps.db;
  const { getDb } = await import('./client');
  return getDb() as unknown as DbLike;
}

/** Normalise SQLite created_at ('YYYY-MM-DD HH:MM:SS') to ISO-Z string. */
function toIsoZ(raw: string): string {
  return raw.includes('T') ? raw : raw.replace(' ', 'T') + 'Z';
}

function toFeatureRequest(row: FeatureRequestRow): FeatureRequest {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    request: row.request,
    createdAt: toIsoZ(row.created_at),
  };
}

const MIN_LIMIT = 1;
const MAX_LIMIT = 500;
const DEFAULT_LIMIT = 100;

function clampLimit(limit: number | undefined): number {
  if (typeof limit !== 'number' || !Number.isFinite(limit)) return DEFAULT_LIMIT;
  return Math.min(MAX_LIMIT, Math.max(MIN_LIMIT, Math.floor(limit)));
}

export async function insertFeatureRequest(
  data: { id: string; name: string | null; email: string | null; request: string },
  deps?: { db?: DbLike }
): Promise<void> {
  const db = await resolveDb(deps);
  await db.execute({
    sql: 'insert into feature_requests (id, name, email, request) values (?, ?, ?, ?)',
    args: [data.id, data.name, data.email, data.request],
  });
}

export async function listFeatureRequests(
  limit?: number,
  deps?: { db?: DbLike }
): Promise<FeatureRequest[]> {
  const db = await resolveDb(deps);
  const safeLimit = clampLimit(limit);

  const { rows } = await db.execute({
    sql: 'select * from feature_requests order by created_at desc limit ?',
    args: [safeLimit],
  });

  return (rows as FeatureRequestRow[]).map(toFeatureRequest);
}
