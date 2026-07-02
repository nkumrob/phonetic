/**
 * @jest-environment node
 */
import {
  createReview,
  deleteReview,
  getReviewStats,
  listReviews,
  updateReview,
} from '../reviews-repo';

const ROW = {
  id: 'rev-1',
  name: 'Alice',
  email: null,
  rating: 5,
  title: 'Great',
  comment: 'Very useful',
  date: '2026-07-01T00:00:00.000Z',
  verified: 0,
  approved: 1,
  helpful: 3,
  location: null,
};

function fakeDb(rows: unknown[] = [ROW], rowsAffected = 1) {
  const execute = jest.fn().mockResolvedValue({ rows, rowsAffected });
  return { db: { execute }, execute };
}

describe('reviews repo', () => {
  describe('listReviews', () => {
    it('fetches approved reviews ordered by date and maps booleans', async () => {
      const { db, execute } = fakeDb();

      const reviews = await listReviews({ approvedOnly: true }, { db });

      const stmt = execute.mock.calls[0][0];
      expect(stmt.sql).toMatch(/approved = 1/i);
      expect(stmt.sql).toMatch(/order by date desc/i);
      expect(reviews[0]).toMatchObject({ id: 'rev-1', approved: true, verified: false });
    });

    it('applies rating and limit filters as args', async () => {
      const { db, execute } = fakeDb();

      await listReviews({ approvedOnly: true, rating: 5, limit: 10 }, { db });

      const stmt = execute.mock.calls[0][0];
      expect(stmt.sql).toMatch(/rating = \?/i);
      expect(stmt.sql).toMatch(/limit \?/i);
      expect(stmt.args).toEqual([5, 10]);
    });
  });

  describe('createReview', () => {
    it('inserts an unapproved review with a generated id and returns it', async () => {
      const { db, execute } = fakeDb([{ ...ROW, approved: 0 }]);

      const review = await createReview(
        { name: 'Alice', rating: 5, title: 'Great', comment: 'Very useful' },
        { db }
      );

      const stmt = execute.mock.calls[0][0];
      expect(stmt.sql).toMatch(/insert into reviews/i);
      expect(stmt.args[0]).toMatch(/^[0-9a-f-]{36}$/); // generated uuid
      expect(stmt.args).toContain('Alice');
      expect(review.approved).toBe(false);
    });
  });

  describe('updateReview', () => {
    it('updates only whitelisted fields and returns the updated review', async () => {
      const { db, execute } = fakeDb([{ ...ROW, approved: 1 }]);

      const review = await updateReview(
        'rev-1',
        { approved: true, id: 'hacked', unknown_column: 'x' } as never,
        { db }
      );

      const stmt = execute.mock.calls[0][0];
      expect(stmt.sql).toMatch(/set approved = \?/i);
      expect(stmt.sql).not.toMatch(/unknown_column/i);
      expect(stmt.args).toEqual([1, 'rev-1']);
      expect(review?.approved).toBe(true);
    });

    it('returns null when the review does not exist', async () => {
      const { db } = fakeDb([], 0);

      expect(await updateReview('missing', { approved: true }, { db })).toBeNull();
    });

    it('returns null when no updatable fields are provided', async () => {
      const { db, execute } = fakeDb();

      expect(await updateReview('rev-1', {}, { db })).toBeNull();
      expect(execute).not.toHaveBeenCalled();
    });
  });

  describe('deleteReview', () => {
    it('deletes by id and reports whether a row was removed', async () => {
      const { db, execute } = fakeDb([], 1);

      expect(await deleteReview('rev-1', { db })).toBe(true);
      expect(execute.mock.calls[0][0].args).toEqual(['rev-1']);
    });
  });

  describe('getReviewStats', () => {
    it('computes totals, average, and distribution from approved ratings', async () => {
      const { db } = fakeDb([{ rating: 5 }, { rating: 5 }, { rating: 4 }, { rating: 2 }]);

      const stats = await getReviewStats({ db });

      expect(stats.totalReviews).toBe(4);
      expect(stats.averageRating).toBe(4);
      expect(stats.ratingDistribution).toEqual({ 5: 2, 4: 1, 3: 0, 2: 1, 1: 0 });
    });

    it('returns zeroed stats when there are no reviews', async () => {
      const { db } = fakeDb([]);

      const stats = await getReviewStats({ db });

      expect(stats.totalReviews).toBe(0);
      expect(stats.averageRating).toBe(0);
    });
  });
});