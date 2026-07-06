/**
 * @jest-environment node
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createClient, type Client } from '@libsql/client';
import { getRecentActivity } from '../analytics/activity';
import type { DbLike } from '../analytics/shared';

let client: Client;
let db: DbLike;

beforeEach(async () => {
  client = createClient({ url: ':memory:' });
  await client.executeMultiple(readFileSync(resolve(process.cwd(), 'lib/db/schema.sql'), 'utf8'));
  db = client as unknown as DbLike;
});

afterEach(() => client.close());

describe('getRecentActivity — ordering', () => {
  it('returns items newest first, mixing ai and event kinds', async () => {
    await client.execute({
      sql: `insert into tool_usage (id, tool_name, model, created_at) values
        ('u1','summarizer','m','2026-07-01 10:00:00'),
        ('u2','email-drafter','m','2026-07-03 12:00:00')`,
      args: [],
    });
    await client.execute({
      sql: `insert into events (id, name, tool, created_at) values
        ('e1','page_view','/','2026-07-02 08:00:00'),
        ('e2','converter_use','phonetic-converter','2026-07-04 09:00:00')`,
      args: [],
    });

    const items = await getRecentActivity(10, { db });

    expect(items).toHaveLength(4);
    expect(items[0].at).toBe('2026-07-04 09:00:00');
    expect(items[0].kind).toBe('event');
    expect(items[1].at).toBe('2026-07-03 12:00:00');
    expect(items[1].kind).toBe('ai');
    expect(items[2].at).toBe('2026-07-02 08:00:00');
    expect(items[2].kind).toBe('event');
    expect(items[3].at).toBe('2026-07-01 10:00:00');
    expect(items[3].kind).toBe('ai');
  });
});

describe('getRecentActivity — limit', () => {
  it('respects the limit parameter and defaults to 50', async () => {
    // Seed 60 events
    const values = Array.from({ length: 60 }, (_, i) => {
      const id = `e${String(i).padStart(3, '0')}`;
      // spread across different seconds so ordering is deterministic
      const ts = `2026-07-01 00:${String(Math.floor(i / 60)).padStart(2, '0')}:${String(i % 60).padStart(2, '0')}`;
      return `('${id}','page_view','/',null,'${ts}')`;
    }).join(',\n        ');
    await client.execute({
      sql: `insert into events (id, name, tool, anon_id, created_at) values ${values}`,
      args: [],
    });

    const items50 = await getRecentActivity(50, { db });
    expect(items50).toHaveLength(50);

    const items10 = await getRecentActivity(10, { db });
    expect(items10).toHaveLength(10);
  });

  it('applies the default limit of 50 when called with undefined', async () => {
    // Seed 51 rows so a working default (50) is distinguishable from "all rows".
    const values = Array.from({ length: 51 }, (_, i) => {
      const id = `d${String(i).padStart(3, '0')}`;
      const ts = `2026-07-01 00:00:${String(i % 60).padStart(2, '0')}`;
      return `('${id}','page_view','/','${ts}')`;
    }).join(',\n        ');
    await client.execute({
      sql: `insert into events (id, name, tool, created_at) values ${values}`,
      args: [],
    });

    const items = await getRecentActivity(undefined, { db });
    expect(items).toHaveLength(50);
  });

  it('clamps out-of-range and non-integer limits (0 → 1, 999 → 200, 12.9 → 12)', async () => {
    const values = Array.from({ length: 205 }, (_, i) => {
      const id = `c${String(i).padStart(3, '0')}`;
      const mins = String(Math.floor(i / 60)).padStart(2, '0');
      const secs = String(i % 60).padStart(2, '0');
      return `('${id}','page_view','/','2026-07-01 00:${mins}:${secs}')`;
    }).join(',\n        ');
    await client.execute({
      sql: `insert into events (id, name, tool, created_at) values ${values}`,
      args: [],
    });

    expect(await getRecentActivity(0, { db })).toHaveLength(1);
    expect(await getRecentActivity(999, { db })).toHaveLength(200);
    expect(await getRecentActivity(12.9, { db })).toHaveLength(12);
  });
});

describe('getRecentActivity — anonShort', () => {
  it('sets anonShort to the first 8 chars of anon_id', async () => {
    await client.execute({
      sql: `insert into events (id, name, anon_id, created_at) values
        ('e1','page_view','aaaabbbb-1234-5678-90ab-cdef01234567',datetime('now'))`,
      args: [],
    });

    const items = await getRecentActivity(10, { db });

    expect(items[0].anonShort).toBe('aaaabbbb');
  });

  it('returns null anonShort when anon_id is null', async () => {
    await client.execute({
      sql: `insert into events (id, name, created_at) values ('e1','page_view',datetime('now'))`,
      args: [],
    });

    const items = await getRecentActivity(10, { db });

    expect(items[0].anonShort).toBeNull();
  });

  it('includes country from both tables', async () => {
    await client.execute({
      sql: `insert into events (id, name, country, created_at) values
        ('e1','page_view','US',datetime('now'))`,
      args: [],
    });
    await client.execute({
      sql: `insert into tool_usage (id, tool_name, model, country, created_at) values
        ('u1','summarizer','m','GB',datetime('now','-1 seconds'))`,
      args: [],
    });

    const items = await getRecentActivity(10, { db });

    expect(items[0].country).toBe('US');
    expect(items[1].country).toBe('GB');
  });
});
