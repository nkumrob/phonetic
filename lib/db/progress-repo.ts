/**
 * Server-synced user progress, keyed by the np_anon cookie. The data
 * column is an opaque JSON string — the server validates size/shape at
 * the API boundary and never interprets the contents.
 */

export interface DbLike {
  execute(stmt: { sql: string; args?: unknown[] }): Promise<{ rows: unknown[]; rowsAffected: number }>;
}

async function resolveDb(deps?: { db?: DbLike }): Promise<DbLike> {
  if (deps?.db) return deps.db;
  const { getDb } = await import('./client');
  return getDb() as unknown as DbLike;
}

export async function getProgress(anonId: string, deps?: { db?: DbLike }): Promise<string | null> {
  const db = await resolveDb(deps);
  const result = await db.execute({
    sql: 'select data from user_progress where anon_id = ?',
    args: [anonId],
  });
  const row = result.rows[0] as { data?: string } | undefined;
  return row?.data ?? null;
}

export async function upsertProgress(anonId: string, data: string, deps?: { db?: DbLike }): Promise<void> {
  const db = await resolveDb(deps);
  await db.execute({
    sql: `insert into user_progress (anon_id, data) values (?, ?)
          on conflict (anon_id) do update set data = excluded.data, updated_at = datetime('now')`,
    args: [anonId, data],
  });
}
