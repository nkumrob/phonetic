/**
 * @jest-environment node
 */
import { recordTimeSaved, recordToolUsage, type ToolUsageEntry } from '../metrics';

const ENTRY: ToolUsageEntry = {
  id: '5b0c1f9e-9f2a-4a3b-8c1d-2e3f4a5b6c7d',
  toolName: 'prompt-improver',
  model: 'claude-haiku-4-5',
  inputTokens: 120,
  outputTokens: 80,
  latencyMs: 950,
  sessionHash: 'abc123',
};

function fakeDb(execute = jest.fn().mockResolvedValue({ rowsAffected: 1 })) {
  return { db: { execute }, execute };
}

function flushAsync() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

describe('recordToolUsage', () => {
  it('inserts a snake_case row with all usage fields', async () => {
    const { db, execute } = fakeDb();

    recordToolUsage(ENTRY, { db });
    await flushAsync();

    expect(execute).toHaveBeenCalledTimes(1);
    const stmt = execute.mock.calls[0][0];
    expect(stmt.sql).toMatch(/insert into tool_usage/i);
    expect(stmt.args).toEqual([
      ENTRY.id,
      'prompt-improver',
      'claude-haiku-4-5',
      120,
      80,
      950,
      'abc123',
    ]);
  });

  it('never throws or rejects when the insert fails', async () => {
    const { db } = fakeDb(jest.fn().mockRejectedValue(new Error('db down')));

    expect(() => recordToolUsage(ENTRY, { db })).not.toThrow();
    await flushAsync(); // an unhandled rejection here would fail the test
  });
});

describe('recordTimeSaved', () => {
  it('updates the row by id with a valid bucket', async () => {
    const { db, execute } = fakeDb();

    const recorded = await recordTimeSaved(ENTRY.id, '1-5', { db });

    expect(recorded).toBe(true);
    const stmt = execute.mock.calls[0][0];
    expect(stmt.sql).toMatch(/update tool_usage/i);
    expect(stmt.args).toEqual(['1-5', ENTRY.id]);
  });

  it('rejects invalid buckets without touching the db', async () => {
    const { db, execute } = fakeDb();

    const recorded = await recordTimeSaved(ENTRY.id, 'lots' as never, { db });

    expect(recorded).toBe(false);
    expect(execute).not.toHaveBeenCalled();
  });

  it('rejects malformed usage ids without touching the db', async () => {
    const { db, execute } = fakeDb();

    const recorded = await recordTimeSaved('not-a-uuid', '1-5', { db });

    expect(recorded).toBe(false);
    expect(execute).not.toHaveBeenCalled();
  });

  it('returns false instead of throwing when the update fails', async () => {
    const { db } = fakeDb(jest.fn().mockRejectedValue(new Error('db down')));

    await expect(recordTimeSaved(ENTRY.id, '1-5', { db })).resolves.toBe(false);
  });
});