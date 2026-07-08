/**
 * @jest-environment node
 */
import {
  insertFeatureRequest,
  listFeatureRequests,
} from '../feature-requests-repo';

function fakeDb(rows: unknown[] = [], rowsAffected = 1) {
  const execute = jest.fn().mockResolvedValue({ rows, rowsAffected });
  return { db: { execute }, execute };
}

const FEATURE_ROW = {
  id: 'fr-1',
  name: 'Alice',
  email: 'alice@example.com',
  request: 'Please add dark mode',
  created_at: '2026-07-01 10:00:00',
};

describe('feature-requests repo', () => {
  describe('insertFeatureRequest', () => {
    it('inserts a row with correct SQL and args (id, name, email, request)', async () => {
      const { db, execute } = fakeDb([], 1);

      await insertFeatureRequest(
        { id: 'fr-abc', name: 'Alice', email: 'alice@example.com', request: 'Add dark mode' },
        { db }
      );

      const stmt = execute.mock.calls[0][0];
      expect(stmt.sql).toMatch(/insert into feature_requests/i);
      // args in order: id, name, email, request
      expect(stmt.args[0]).toBe('fr-abc');
      expect(stmt.args[1]).toBe('Alice');
      expect(stmt.args[2]).toBe('alice@example.com');
      expect(stmt.args[3]).toBe('Add dark mode');
    });

    it('passes null for name and email when they are null', async () => {
      const { db, execute } = fakeDb([], 1);

      await insertFeatureRequest(
        { id: 'fr-xyz', name: null, email: null, request: 'Some request text here' },
        { db }
      );

      const stmt = execute.mock.calls[0][0];
      expect(stmt.args[1]).toBeNull();
      expect(stmt.args[2]).toBeNull();
    });
  });

  describe('listFeatureRequests', () => {
    it('fetches rows ordered newest-first with default limit of 100', async () => {
      const { db, execute } = fakeDb([FEATURE_ROW]);

      const results = await listFeatureRequests(undefined, { db });

      const stmt = execute.mock.calls[0][0];
      expect(stmt.sql).toMatch(/order by created_at desc/i);
      // default limit arg
      expect(stmt.args).toContain(100);
      expect(results).toHaveLength(1);
    });

    it('passes an explicit limit as an arg', async () => {
      const { db, execute } = fakeDb([]);

      await listFeatureRequests(25, { db });

      const stmt = execute.mock.calls[0][0];
      expect(stmt.args).toContain(25);
    });

    it('clamps limit 0 to 1', async () => {
      const { db, execute } = fakeDb([]);

      await listFeatureRequests(0, { db });

      const stmt = execute.mock.calls[0][0];
      expect(stmt.args).toContain(1);
    });

    it('clamps limit 600 to 500', async () => {
      const { db, execute } = fakeDb([]);

      await listFeatureRequests(600, { db });

      const stmt = execute.mock.calls[0][0];
      expect(stmt.args).toContain(500);
    });

    it('normalises SQLite space-separated created_at to ISO-Z', async () => {
      const row = { ...FEATURE_ROW, created_at: '2026-07-01 10:00:00' };
      const { db } = fakeDb([row]);

      const results = await listFeatureRequests(undefined, { db });

      expect(results[0].createdAt).toBe('2026-07-01T10:00:00Z');
    });

    it('passes through a created_at that already includes T and Z', async () => {
      const row = { ...FEATURE_ROW, created_at: '2026-07-01T10:00:00Z' };
      const { db } = fakeDb([row]);

      const results = await listFeatureRequests(undefined, { db });

      expect(results[0].createdAt).toBe('2026-07-01T10:00:00Z');
    });

    it('returns createdAt matching ISO-Z pattern', async () => {
      const { db } = fakeDb([FEATURE_ROW]);

      const results = await listFeatureRequests(undefined, { db });

      expect(results[0].createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);
    });
  });
});
