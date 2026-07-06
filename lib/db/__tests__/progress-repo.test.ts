/**
 * @jest-environment node
 */
import { getProgress, upsertProgress } from '../progress-repo';

describe('progress repo', () => {
  it('returns the stored data JSON for an anon id', async () => {
    const execute = jest.fn().mockResolvedValue({ rows: [{ data: '{"timeSavedMinutes":10}' }], rowsAffected: 0 });

    const data = await getProgress('anon-1', { db: { execute } });

    expect(execute.mock.calls[0][0].sql).toMatch(/select data from user_progress where anon_id = \?/i);
    expect(execute.mock.calls[0][0].args).toEqual(['anon-1']);
    expect(data).toBe('{"timeSavedMinutes":10}');
  });

  it('returns null when no row exists', async () => {
    const execute = jest.fn().mockResolvedValue({ rows: [], rowsAffected: 0 });
    expect(await getProgress('anon-2', { db: { execute } })).toBeNull();
  });

  it('upserts on conflict', async () => {
    const execute = jest.fn().mockResolvedValue({ rows: [], rowsAffected: 1 });

    await upsertProgress('anon-1', '{"timeSavedMinutes":13}', { db: { execute } });

    const stmt = execute.mock.calls[0][0];
    expect(stmt.sql).toMatch(/insert into user_progress/i);
    expect(stmt.sql).toMatch(/on conflict\s*\(anon_id\)\s*do update/i);
    expect(stmt.args).toEqual(['anon-1', '{"timeSavedMinutes":13}']);
  });
});
