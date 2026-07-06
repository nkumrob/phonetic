/**
 * @jest-environment node
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createClient, type Client } from '@libsql/client';
import { getTrafficStats } from '../analytics/traffic';
import type { DbLike } from '../analytics/shared';

let client: Client;
let db: DbLike;

beforeEach(async () => {
  client = createClient({ url: ':memory:' });
  await client.executeMultiple(readFileSync(resolve(process.cwd(), 'lib/db/schema.sql'), 'utf8'));
  db = client as unknown as DbLike;
});

afterEach(() => client.close());

describe('getTrafficStats — topPages', () => {
  it('returns paths ordered by views descending', async () => {
    await client.execute({
      sql: `insert into events (id, name, tool, anon_id, created_at) values
        ('e1','page_view','/tools','a1',datetime('now')),
        ('e2','page_view','/tools','a2',datetime('now')),
        ('e3','page_view','/tools','a3',datetime('now')),
        ('e4','page_view','/','a1',datetime('now')),
        ('e5','page_view','/practice','a2',datetime('now'))`,
      args: [],
    });

    const stats = await getTrafficStats(7, { db });

    expect(stats.topPages[0]).toEqual({ path: '/tools', views: 3 });
    expect(stats.topPages.length).toBeGreaterThanOrEqual(3);
    // Sorted desc
    for (let i = 1; i < stats.topPages.length; i++) {
      expect(stats.topPages[i].views).toBeLessThanOrEqual(stats.topPages[i - 1].views);
    }
  });

  it('excludes page_view events outside the date window', async () => {
    await client.execute({
      sql: `insert into events (id, name, tool, anon_id, created_at) values
        ('e1','page_view','/old','a1',datetime('now','-30 days')),
        ('e2','page_view','/new','a2',datetime('now'))`,
      args: [],
    });

    const stats = await getTrafficStats(7, { db });

    expect(stats.topPages.find((p) => p.path === '/old')).toBeUndefined();
    expect(stats.topPages.find((p) => p.path === '/new')).toBeDefined();
  });
});

describe('getTrafficStats — new vs returning', () => {
  it('visitor whose first event predates the window counts as returning', async () => {
    // 'old-visitor': first event 30 days ago, also active today → returning
    await client.execute({
      sql: `insert into events (id, name, anon_id, created_at) values
        ('e1','page_view','old-visitor',datetime('now','-30 days')),
        ('e2','page_view','old-visitor',datetime('now'))`,
      args: [],
    });
    // 'new-visitor': first and only event today → new
    await client.execute({
      sql: `insert into events (id, name, anon_id, created_at) values
        ('e3','page_view','new-visitor',datetime('now'))`,
      args: [],
    });

    const stats = await getTrafficStats(7, { db });

    expect(stats.returningVisitors).toBe(1);
    expect(stats.newVisitors).toBe(1);
  });

  it('visitor whose first_seen is across tool_usage (not events) is classified correctly', async () => {
    // 'early': first ever activity is in tool_usage 20 days ago, and has an event today → returning
    await client.execute({
      sql: `insert into tool_usage (id, tool_name, anon_id, created_at) values
        ('u1','summarizer','early',datetime('now','-20 days'))`,
      args: [],
    });
    await client.execute({
      sql: `insert into events (id, name, anon_id, created_at) values
        ('e1','page_view','early',datetime('now'))`,
      args: [],
    });

    const stats = await getTrafficStats(7, { db });

    expect(stats.returningVisitors).toBe(1);
    expect(stats.newVisitors).toBe(0);
  });
});

describe('getTrafficStats — funnel', () => {
  it('started >= completed per mode', async () => {
    await client.execute({
      sql: `insert into events (id, name, tool, anon_id, created_at) values
        ('e1','practice_session','learn','a1',datetime('now')),
        ('e2','practice_session','learn','a2',datetime('now')),
        ('e3','practice_complete','learn','a1',datetime('now')),
        ('e4','practice_session','challenge','a3',datetime('now'))`,
      args: [],
    });

    const stats = await getTrafficStats(7, { db });

    const learn = stats.funnel.find((f) => f.mode === 'learn')!;
    expect(learn).toBeDefined();
    expect(learn.started).toBe(2);
    expect(learn.completed).toBe(1);
    expect(learn.started).toBeGreaterThanOrEqual(learn.completed);

    const challenge = stats.funnel.find((f) => f.mode === 'challenge')!;
    expect(challenge).toBeDefined();
    expect(challenge.started).toBe(1);
    expect(challenge.completed).toBe(0);
  });

  it('returns empty funnel when no practice events exist', async () => {
    const stats = await getTrafficStats(7, { db });
    expect(stats.funnel).toEqual([]);
  });
});

describe('getTrafficStats — toolLeaderboard', () => {
  it('combines tool_usage and event-backed tools, sorted desc', async () => {
    await client.execute({
      sql: `insert into tool_usage (id, tool_name, created_at) values
        ('u1','summarizer',datetime('now')),
        ('u2','summarizer',datetime('now')),
        ('u3','email-drafter',datetime('now'))`,
      args: [],
    });
    await client.execute({
      sql: `insert into events (id, name, tool, created_at) values
        ('e1','converter_use','phonetic-converter',datetime('now')),
        ('e2','practice_session','learn',datetime('now'))`,
      args: [],
    });

    const stats = await getTrafficStats(7, { db });

    expect(stats.toolLeaderboard[0]).toEqual({ tool: 'summarizer', uses: 2 });
    expect(stats.toolLeaderboard.find((t) => t.tool === 'phonetic-converter')).toBeDefined();
  });
});

describe('getTrafficStats — countries', () => {
  it('excludes page_view events from the events arm; tool_usage still counts', async () => {
    // Same visitor produces a page_view (should NOT count) and a tool_usage (should count).
    await client.execute({
      sql: `insert into events (id, name, tool, anon_id, country, created_at) values
        ('e1','page_view','/','a1','US',datetime('now')),
        ('e2','converter_use','phonetic-converter','a2','US',datetime('now'))`,
      args: [],
    });
    await client.execute({
      sql: `insert into tool_usage (id, tool_name, anon_id, country, created_at) values
        ('u1','summarizer','a3','US',datetime('now'))`,
      args: [],
    });

    const stats = await getTrafficStats(7, { db });

    const us = stats.countries.find((c) => c.country === 'US')!;
    expect(us).toBeDefined();
    // a1's page_view is excluded; only a2 (event, non-page_view) and a3 (tool_usage) count.
    expect(us.visitors).toBe(2);
    expect(us.interactions).toBe(2);
  });

  it('omits countries whose only activity is a page_view event', async () => {
    await client.execute({
      sql: `insert into events (id, name, tool, anon_id, country, created_at) values
        ('e1','page_view','/','a1','FR',datetime('now'))`,
      args: [],
    });

    const stats = await getTrafficStats(7, { db });

    expect(stats.countries.find((c) => c.country === 'FR')).toBeUndefined();
  });
});
