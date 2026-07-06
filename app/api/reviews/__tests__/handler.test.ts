/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { createGetHandler, createPostHandler } from '../handler';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const APPROVED_REVIEW = {
  id: 'r1',
  name: 'Alice',
  email: 'alice@example.com',
  rating: 5,
  title: 'Great',
  comment: 'Very useful',
  date: '2026-07-01T00:00:00.000Z',
  verified: true,
  approved: true,
  helpful: 2,
};

const PENDING_REVIEW = {
  id: 'r2',
  name: 'Bob',
  email: 'bob@example.com',
  rating: 3,
  title: 'OK',
  comment: 'Decent',
  date: '2026-07-02T00:00:00.000Z',
  verified: false,
  approved: false,
  helpful: 0,
};

function makeGetRequest(search = '', cookie = '') {
  const url = `http://localhost/api/reviews${search ? `?${search}` : ''}`;
  return new NextRequest(url, {
    method: 'GET',
    headers: cookie ? { cookie } : {},
  });
}

function makePostRequest(body: unknown) {
  return new NextRequest('http://localhost/api/reviews', {
    method: 'POST',
    body: typeof body === 'string' ? body : JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

// ---------------------------------------------------------------------------
// GET handler tests
// ---------------------------------------------------------------------------

describe('GET /api/reviews', () => {
  const nonAdmin = jest.fn().mockResolvedValue(false);
  const isAdmin = jest.fn().mockResolvedValue(true);

  describe('non-admin caller', () => {
    it('always returns approved-only and strips email even when approved=false is requested', async () => {
      const listReviews = jest.fn().mockResolvedValue([APPROVED_REVIEW]);
      const handler = createGetHandler({ listReviews, verifySession: nonAdmin });

      const res = await handler(makeGetRequest('approved=false'));
      expect(res.status).toBe(200);
      const { reviews } = (await res.json()) as { reviews: typeof APPROVED_REVIEW[] };

      // enforces approved-only filter regardless of param
      expect(listReviews.mock.calls[0][0]).toMatchObject({ approvedFilter: true });

      // email stripped from every review
      expect(reviews).toHaveLength(1);
      expect((reviews[0] as Record<string, unknown>).email).toBeUndefined();
      expect(reviews[0].id).toBe('r1');
    });

    it('strips email from all returned reviews even when no param given', async () => {
      const listReviews = jest.fn().mockResolvedValue([{ ...APPROVED_REVIEW, email: 'alice@example.com' }]);
      const handler = createGetHandler({ listReviews, verifySession: nonAdmin });

      const res = await handler(makeGetRequest());
      const { reviews } = (await res.json()) as { reviews: Record<string, unknown>[] };

      expect(reviews[0].email).toBeUndefined();
    });
  });

  describe('admin caller', () => {
    it('approved=false → unapproved-only with emails present', async () => {
      const listReviews = jest.fn().mockResolvedValue([PENDING_REVIEW]);
      const handler = createGetHandler({ listReviews, verifySession: isAdmin });

      const res = await handler(makeGetRequest('approved=false'));
      expect(res.status).toBe(200);
      const { reviews } = (await res.json()) as { reviews: typeof PENDING_REVIEW[] };

      expect(listReviews.mock.calls[0][0]).toMatchObject({ approvedFilter: false });
      expect(reviews[0].email).toBe('bob@example.com');
    });

    it('approved=true → approved-only with emails present', async () => {
      const listReviews = jest.fn().mockResolvedValue([APPROVED_REVIEW]);
      const handler = createGetHandler({ listReviews, verifySession: isAdmin });

      const res = await handler(makeGetRequest('approved=true'));
      const { reviews } = (await res.json()) as { reviews: typeof APPROVED_REVIEW[] };

      expect(listReviews.mock.calls[0][0]).toMatchObject({ approvedFilter: true });
      expect(reviews[0].email).toBe('alice@example.com');
    });

    it('no approved param → all reviews with emails', async () => {
      const listReviews = jest.fn().mockResolvedValue([APPROVED_REVIEW, PENDING_REVIEW]);
      const handler = createGetHandler({ listReviews, verifySession: isAdmin });

      const res = await handler(makeGetRequest());
      const { reviews } = (await res.json()) as { reviews: typeof APPROVED_REVIEW[] };

      // approvedFilter absent (undefined) → all
      const callArg = listReviews.mock.calls[0][0] as Record<string, unknown>;
      expect('approvedFilter' in callArg ? callArg.approvedFilter : 'NOT_SET').toBeUndefined();
      expect(reviews).toHaveLength(2);
      expect(reviews[0].email).toBeDefined();
    });
  });

  it('returns 500 when listReviews throws', async () => {
    const listReviews = jest.fn().mockRejectedValue(new Error('db down'));
    const handler = createGetHandler({ listReviews, verifySession: nonAdmin });

    const res = await handler(makeGetRequest());
    expect(res.status).toBe(500);
  });
});

// ---------------------------------------------------------------------------
// POST handler tests (unchanged behaviour — just ensure factory still works)
// ---------------------------------------------------------------------------

describe('POST /api/reviews', () => {
  it('creates an unapproved review and returns 201', async () => {
    const created = { ...PENDING_REVIEW, id: 'new-id' };
    const createReview = jest.fn().mockResolvedValue(created);
    const handler = createPostHandler({ createReview });

    const res = await handler(
      makePostRequest({ name: 'Bob', rating: 3, title: 'OK', comment: 'Decent' })
    );

    expect(res.status).toBe(201);
    const body = (await res.json()) as { review: typeof created };
    expect(body.review.id).toBe('new-id');
  });

  it('returns 400 when required fields are missing', async () => {
    const handler = createPostHandler({ createReview: jest.fn() });

    const res = await handler(makePostRequest({ name: 'Bob', rating: 3 }));
    expect(res.status).toBe(400);
  });

  it('returns 400 for out-of-range rating', async () => {
    const handler = createPostHandler({ createReview: jest.fn() });

    const res = await handler(
      makePostRequest({ name: 'Bob', rating: 6, title: 'Bad', comment: 'Nope' })
    );
    expect(res.status).toBe(400);
  });

  it('returns 500 when createReview throws', async () => {
    const createReview = jest.fn().mockRejectedValue(new Error('db down'));
    const handler = createPostHandler({ createReview });

    const res = await handler(
      makePostRequest({ name: 'Bob', rating: 3, title: 'OK', comment: 'Decent' })
    );
    expect(res.status).toBe(500);
  });
});
