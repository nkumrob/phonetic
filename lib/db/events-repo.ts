import type { EventName } from '@/lib/constants/events';

/**
 * Turso-backed inserts for analytics events. Throws on failure — the
 * /api/events handler decides how failures surface (the client never sees them).
 */

export interface DbLike {
  execute(stmt: { sql: string; args?: unknown[] }): Promise<{ rows: unknown[]; rowsAffected: number }>;
}

export interface NewEvent {
  id: string;
  name: EventName;
  tool: string | null;
  anonId: string | null;
  metadata: string | null;
}

async function resolveDb(deps?: { db?: DbLike }): Promise<DbLike> {
  if (deps?.db) return deps.db;
  const { getDb } = await import('./client');
  return getDb() as unknown as DbLike;
}

export async function insertEvent(event: NewEvent, deps?: { db?: DbLike }): Promise<void> {
  const db = await resolveDb(deps);
  await db.execute({
    sql: 'insert into events (id, name, tool, anon_id, metadata) values (?, ?, ?, ?, ?)',
    args: [event.id, event.name, event.tool, event.anonId, event.metadata],
  });
}
