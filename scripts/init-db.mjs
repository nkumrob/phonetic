/**
 * Applies lib/db/schema.sql to the Turso database.
 * Usage: npm run db:init
 * Reads TURSO_DATABASE_URL / TURSO_AUTH_TOKEN from .env.local (or the environment).
 * Local dev without a Turso account: TURSO_DATABASE_URL=file:./local.db
 */
import { createClient } from '@libsql/client';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

function loadEnvLocal() {
  const envPath = resolve(process.cwd(), '.env.local');
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (match && process.env[match[1]] === undefined) {
      process.env[match[1]] = match[2].replace(/^["']|["']$/g, '');
    }
  }
}

loadEnvLocal();

const url = process.env.TURSO_DATABASE_URL;
if (!url) {
  console.error('TURSO_DATABASE_URL is not set. Add it to .env.local (e.g. file:./local.db for local dev).');
  process.exit(1);
}

const db = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN || undefined });
const schema = readFileSync(resolve(process.cwd(), 'lib/db/schema.sql'), 'utf8');

try {
  // Guarded legacy migrations must run BEFORE the schema: schema.sql now
  // references anon_id in an index, which aborts executeMultiple on a
  // legacy tool_usage that predates the column.
  // Fresh DB → pragma returns zero rows → skip ALTER; CREATE TABLE will include the column.
  const info = await db.execute("pragma table_info('tool_usage')");
  if (info.rows.length > 0 && !info.rows.some((row) => row.name === 'anon_id')) {
    await db.execute('alter table tool_usage add column anon_id text');
    console.log('Added tool_usage.anon_id column.');
  }

  await db.executeMultiple(schema);

  console.log(`Schema applied to ${url.startsWith('file:') ? url : 'Turso database'}.`);
} catch (error) {
  console.error('Failed to apply schema:', error.message);
  process.exit(1);
} finally {
  db.close();
}
