import { createClient, type Client } from '@libsql/client';

/**
 * Turso (libSQL) client singleton — server-side only.
 * Local dev works without a Turso account: TURSO_DATABASE_URL=file:./local.db
 */
let db: Client | null = null;

export function getDb(): Client {
  if (db) return db;

  const url = process.env.TURSO_DATABASE_URL;
  if (!url) {
    throw new Error('TURSO_DATABASE_URL is not set');
  }

  db = createClient({
    url,
    authToken: process.env.TURSO_AUTH_TOKEN || undefined,
  });
  return db;
}

/** Test helper — clears the memoized client. */
export function resetDb(): void {
  db = null;
}
