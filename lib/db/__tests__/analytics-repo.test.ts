/**
 * @jest-environment node
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createClient, type Client } from '@libsql/client';
import { getOverviewStats, getToolStats, type DbLike } from '../analytics-repo';

let client: Client;
let db: DbLike;

beforeEach(async () => {
  client = createClient({ url: ':memory:' });
  await client.executeMultiple(readFileSync(resolve(process.cwd(), 'lib/db/schema.sql'), 'utf8'));
  db = client as unknown as DbLike;
});

afterEach(() => client.close());

async function seed() {
  // 2 AI runs today (same visitor), 1 AI run 40 days ago (other visitor)
  await client.execute({
    sql: `insert into tool_usage (id, tool_name, model, input_tokens, output_tokens, latency_ms, session_hash, anon_id, time_saved_bucket, created_at) values
      ('u1','summarizer','m',100,50,900,'sh','aaaaaaaa-0000-0000-0000-000000000001','5-15', datetime('now')),
      ('u2','summarizer','m',200,100,1100,'sh','aaaaaaaa-0000-0000-0000-000000000001', null, datetime('now')),
      ('u3','email-drafter','m',10,5,500,'sh','aaaaaaaa-0000-0000-0000-000000000002','1-5', datetime('now','-40 days'))`,
    args: [],
  });
  // events today: 1 converter use (visitor 3), 1 practice session (visitor 1), 1 page_view, 1 template_use
  await client.execute({
    sql: `insert into events (id, name, tool, anon_id, created_at) values
      ('e1','converter_use','phonetic-converter','aaaaaaaa-0000-0000-0000-000000000003', datetime('now')),
      ('e2','practice_session','learn','aaaaaaaa-0000-0000-0000-000000000001', datetime('now')),
      ('e3','page_view','/tools', 'aaaaaaaa-0000-0000-0000-000000000003', datetime('now')),
      ('e4','template_use','summarizer','aaaaaaaa-0000-0000-0000-000000000001', datetime('now'))`,
    args: [],
  });
}

describe('getOverviewStats', () => {
  it('computes KPIs over the range (30d): visitors, interactions, conversations, tokens, time saved', async () => {
    await seed();

    const stats = await getOverviewStats(30, { db });

    expect(stats.uniqueVisitors).toBe(2); // in-range: visitor ...0001 (u1,u2,e2,e4) and ...0003 (e1,e3); u3's visitor is outside range
    expect(stats.aiConversations).toBe(2); // u1,u2
    expect(stats.interactions).toBe(5); // u1,u2 + e1,e2,e4 (page_view excluded)
    expect(stats.tokens).toBe(450); // (100+50)+(200+100)
    expect(stats.timeSavedMinutes).toBe(10); // one '5-15' vote in range
  });

  it('produces a daily series covering the range with ai/other split', async () => {
    await seed();

    const stats = await getOverviewStats(7, { db });

    const today = stats.dailySeries[stats.dailySeries.length - 1];
    expect(stats.dailySeries).toHaveLength(7);
    expect(today.ai).toBe(2);
    expect(today.other).toBe(3); // converter, practice, template (page_view excluded)
    expect(stats.dailySeries[0].ai + stats.dailySeries[0].other).toBe(0); // empty older day
  });

  it('builds the tool leaderboard excluding template_use and page_view', async () => {
    await seed();

    const stats = await getOverviewStats(30, { db });

    expect(stats.toolLeaderboard).toEqual(
      expect.arrayContaining([
        { tool: 'summarizer', uses: 2 },
        { tool: 'phonetic-converter', uses: 1 },
        { tool: 'practice', uses: 1 },
      ])
    );
    expect(stats.toolLeaderboard.find((t) => t.tool === '/tools')).toBeUndefined();
    expect(stats.toolLeaderboard[0]).toEqual({ tool: 'summarizer', uses: 2 }); // sorted desc
  });

  it('returns the time-saved vote distribution', async () => {
    await seed();
    const stats = await getOverviewStats(30, { db });
    expect(stats.timeSavedDistribution).toEqual([{ bucket: '5-15', votes: 1 }]);
  });

  it('calendar-day alignment: first-day row counted, eve-of-window row excluded, series total equals interactions', async () => {
    // Row on the first calendar day of the 7-day window (6 days ago at 00:30).
    await client.execute({
      sql: `insert into tool_usage (id, tool_name, anon_id, created_at) values
        ('a1', 'test-tool', 'aaaa', date('now', '-6 days') || ' 00:30:00')`,
      args: [],
    });
    // Row on the calendar day BEFORE the window (7 days ago at 23:30 — the rolling
    // window would include this; the calendar-day window must not).
    await client.execute({
      sql: `insert into tool_usage (id, tool_name, anon_id, created_at) values
        ('a2', 'test-tool', 'bbbb', date('now', '-7 days') || ' 23:30:00')`,
      args: [],
    });

    const stats = await getOverviewStats(7, { db });

    expect(stats.aiConversations).toBe(1); // only a1 — a2 is outside the calendar window
    const seriesTotal = stats.dailySeries.reduce((sum, p) => sum + p.ai + p.other, 0);
    expect(seriesTotal).toBe(stats.interactions); // chart and KPIs are aligned
  });
});

describe('getToolStats', () => {
  it('returns per-tool rows for AI tools and event-backed tools', async () => {
    await seed();

    const rows = await getToolStats(30, { db });

    const summarizer = rows.find((r) => r.tool === 'summarizer')!;
    expect(summarizer).toMatchObject({
      uses: 2,
      uniqueUsers: 1,
      inputTokens: 300,
      outputTokens: 150,
      avgLatencyMs: 1000,
      timeSavedVotes: 1,
    });
    const converter = rows.find((r) => r.tool === 'phonetic-converter')!;
    expect(converter).toMatchObject({ uses: 1, uniqueUsers: 1, inputTokens: null, avgLatencyMs: null });
    expect(rows.find((r) => r.tool === 'email-drafter')).toBeUndefined(); // outside range
  });
});
