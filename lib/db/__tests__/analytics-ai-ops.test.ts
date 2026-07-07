/**
 * @jest-environment node
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createClient, type Client } from '@libsql/client';
import { getAiOpsStats } from '../analytics/ai-ops';
import type { DbLike } from '../analytics/shared';

let client: Client;
let db: DbLike;

beforeEach(async () => {
  client = createClient({ url: ':memory:' });
  await client.executeMultiple(readFileSync(resolve(process.cwd(), 'lib/db/schema.sql'), 'utf8'));
  db = client as unknown as DbLike;
});

afterEach(() => client.close());

describe('getAiOpsStats — cost estimation', () => {
  it('estimates cost for a priced model (claude-haiku-4-5)', async () => {
    // 1M input @ $1/MTok + 0.2M output @ $5/MTok = $1 + $1 = $2.00
    await client.execute({
      sql: `insert into tool_usage (id, tool_name, model, input_tokens, output_tokens, latency_ms, created_at) values
        ('u1','summarizer','claude-haiku-4-5',1000000,200000,800,datetime('now'))`,
      args: [],
    });

    const stats = await getAiOpsStats(7, { db });

    const haiku = stats.byModel.find((m) => m.model === 'claude-haiku-4-5')!;
    expect(haiku).toBeDefined();
    expect(haiku.conversations).toBe(1);
    expect(haiku.inputTokens).toBe(1000000);
    expect(haiku.outputTokens).toBe(200000);
    expect(haiku.estimatedCostUsd).toBeCloseTo(2.0, 4);
    expect(stats.totalCostUsd).toBeCloseTo(2.0, 4);
  });

  it('sets estimatedCostUsd to null for an unpriced model and totalCostUsd to null', async () => {
    await client.execute({
      sql: `insert into tool_usage (id, tool_name, model, input_tokens, output_tokens, created_at) values
        ('u1','gpt-tool','some-unpriced-model',500000,100000,datetime('now'))`,
      args: [],
    });

    const stats = await getAiOpsStats(7, { db });

    const nano = stats.byModel.find((m) => m.model === 'some-unpriced-model')!;
    expect(nano).toBeDefined();
    expect(nano.estimatedCostUsd).toBeNull();
    expect(stats.totalCostUsd).toBeNull();
  });

  it('sets totalCostUsd to null when ANY model is unpriced (mixed window)', async () => {
    await client.execute({
      sql: `insert into tool_usage (id, tool_name, model, input_tokens, output_tokens, latency_ms, created_at) values
        ('u1','summarizer','claude-haiku-4-5',1000000,200000,800,datetime('now')),
        ('u2','gpt-tool','some-unpriced-model',500000,100000,600,datetime('now'))`,
      args: [],
    });

    const stats = await getAiOpsStats(7, { db });

    const haiku = stats.byModel.find((m) => m.model === 'claude-haiku-4-5')!;
    expect(haiku.estimatedCostUsd).toBeCloseTo(2.0, 4); // priced row still shows cost

    const nano = stats.byModel.find((m) => m.model === 'some-unpriced-model')!;
    expect(nano.estimatedCostUsd).toBeNull();

    expect(stats.totalCostUsd).toBeNull(); // null because at least one model is unpriced
  });

  it('computes totalCostUsd as sum of all model costs when all are priced', async () => {
    // 2M input + 0.4M output for haiku-4-5: 2*1 + 0.4*5 = 4.0
    await client.execute({
      sql: `insert into tool_usage (id, tool_name, model, input_tokens, output_tokens, latency_ms, created_at) values
        ('u1','summarizer','claude-haiku-4-5',2000000,400000,900,datetime('now'))`,
      args: [],
    });

    const stats = await getAiOpsStats(7, { db });

    expect(stats.totalCostUsd).toBeCloseTo(4.0, 4);
  });
});

describe('getAiOpsStats — latency', () => {
  it('averages latency_ms across rows in range', async () => {
    await client.execute({
      sql: `insert into tool_usage (id, tool_name, model, latency_ms, created_at) values
        ('u1','t','m',800,datetime('now')),
        ('u2','t','m',1200,datetime('now'))`,
      args: [],
    });

    const stats = await getAiOpsStats(7, { db });

    expect(stats.avgLatencyMs).toBe(1000);
  });

  it('returns 0 when no latency data exists', async () => {
    const stats = await getAiOpsStats(7, { db });
    expect(stats.avgLatencyMs).toBe(0);
  });
});

describe('getAiOpsStats — timeSavedDistribution', () => {
  it('groups votes by bucket', async () => {
    await client.execute({
      sql: `insert into tool_usage (id, tool_name, model, time_saved_bucket, created_at) values
        ('u1','t','m','5-15',datetime('now')),
        ('u2','t','m','5-15',datetime('now')),
        ('u3','t','m','1-5',datetime('now'))`,
      args: [],
    });

    const stats = await getAiOpsStats(7, { db });

    expect(stats.timeSavedDistribution).toEqual(
      expect.arrayContaining([
        { bucket: '5-15', votes: 2 },
        { bucket: '1-5', votes: 1 },
      ])
    );
  });
});
