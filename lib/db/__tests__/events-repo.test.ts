/**
 * @jest-environment node
 */
import { insertEvent } from '../events-repo';

function fakeDb(rowsAffected = 1) {
  const execute = jest.fn().mockResolvedValue({ rows: [], rowsAffected });
  return { db: { execute }, execute };
}

describe('events repo', () => {
  it('inserts an event with all fields as args (incl. country and city)', async () => {
    const { db, execute } = fakeDb();

    await insertEvent(
      {
        id: 'evt-1',
        name: 'converter_use',
        tool: 'phonetic-converter',
        anonId: 'anon-1',
        metadata: '{"chars":12}',
        country: 'US',
        city: 'Austin',
      },
      { db }
    );

    const stmt = execute.mock.calls[0][0];
    expect(stmt.sql).toMatch(/insert into events/i);
    expect(stmt.args).toEqual([
      'evt-1',
      'converter_use',
      'phonetic-converter',
      'anon-1',
      '{"chars":12}',
      'US',
      'Austin',
    ]);
  });

  it('passes nulls for optional fields including country and city', async () => {
    const { db, execute } = fakeDb();

    await insertEvent(
      { id: 'evt-2', name: 'page_view', tool: null, anonId: null, metadata: null, country: null, city: null },
      { db }
    );

    expect(execute.mock.calls[0][0].args).toEqual(['evt-2', 'page_view', null, null, null, null, null]);
  });

  it('propagates db failures to the caller', async () => {
    const execute = jest.fn().mockRejectedValue(new Error('db down'));

    await expect(
      insertEvent(
        { id: 'evt-3', name: 'page_view', tool: null, anonId: null, metadata: null, country: null, city: null },
        { db: { execute } }
      )
    ).rejects.toThrow('db down');
  });
});
