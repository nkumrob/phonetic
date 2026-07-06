/**
 * @jest-environment node
 *
 * Defense-in-depth auth tests for review mutation handlers (PATCH / DELETE).
 * Uses the factory DI seam — no jest.mock required.
 */
import { NextRequest } from 'next/server';
import { createSessionToken } from '@/lib/server/admin-session';
import { createPatchHandler, createDeleteHandler } from '../[id]/handler';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const REVIEW = {
  id: 'rev-1',
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

const SECRET = 'test-handler-secret';

// ---------------------------------------------------------------------------
// Request helpers
// ---------------------------------------------------------------------------

function makePatchRequest(cookie = '') {
  return new NextRequest('http://localhost/api/reviews/rev-1', {
    method: 'PATCH',
    body: JSON.stringify({ approved: true }),
    headers: {
      'Content-Type': 'application/json',
      ...(cookie ? { cookie } : {}),
    },
  });
}

function makeDeleteRequest(cookie = '') {
  return new NextRequest('http://localhost/api/reviews/rev-1', {
    method: 'DELETE',
    headers: cookie ? { cookie } : {},
  });
}

function fakeParams(id = 'rev-1'): { params: Promise<{ id: string }> } {
  return { params: Promise.resolve({ id }) };
}

// ---------------------------------------------------------------------------
// PATCH handler
// ---------------------------------------------------------------------------

describe('PATCH /api/reviews/[id]', () => {
  beforeEach(() => {
    process.env.ADMIN_SESSION_SECRET = SECRET;
  });
  afterEach(() => {
    delete process.env.ADMIN_SESSION_SECRET;
  });

  it('returns 401 with no cookie — repo is never called', async () => {
    const updateReview = jest.fn();
    const handler = createPatchHandler({ updateReview });

    const res = await handler(makePatchRequest(), fakeParams());

    expect(res.status).toBe(401);
    const body = (await res.json()) as { error: string };
    expect(body.error).toBe('Unauthorized');
    expect(updateReview).not.toHaveBeenCalled();
  });

  it('returns 401 with a junk np_admin cookie — repo is never called', async () => {
    const updateReview = jest.fn();
    const handler = createPatchHandler({ updateReview });

    const res = await handler(makePatchRequest('np_admin=garbage'), fakeParams());

    expect(res.status).toBe(401);
    expect(updateReview).not.toHaveBeenCalled();
  });

  it('calls updateReview and returns 200 with a valid np_admin token', async () => {
    const token = await createSessionToken(SECRET);
    const updateReview = jest.fn().mockResolvedValue(REVIEW);
    const handler = createPatchHandler({ updateReview });

    const res = await handler(makePatchRequest(`np_admin=${token}`), fakeParams());

    expect(res.status).toBe(200);
    const body = (await res.json()) as { review: typeof REVIEW };
    expect(body.review.id).toBe('rev-1');
    expect(updateReview).toHaveBeenCalledWith('rev-1', { approved: true });
  });

  it('returns 404 when updateReview returns null', async () => {
    const token = await createSessionToken(SECRET);
    const updateReview = jest.fn().mockResolvedValue(null);
    const handler = createPatchHandler({ updateReview });

    const res = await handler(makePatchRequest(`np_admin=${token}`), fakeParams('unknown'));

    expect(res.status).toBe(404);
    expect(updateReview).toHaveBeenCalled();
  });

  it('returns 500 when updateReview throws', async () => {
    const token = await createSessionToken(SECRET);
    const updateReview = jest.fn().mockRejectedValue(new Error('db down'));
    const handler = createPatchHandler({ updateReview });

    const res = await handler(makePatchRequest(`np_admin=${token}`), fakeParams());

    expect(res.status).toBe(500);
  });
});

// ---------------------------------------------------------------------------
// DELETE handler
// ---------------------------------------------------------------------------

describe('DELETE /api/reviews/[id]', () => {
  beforeEach(() => {
    process.env.ADMIN_SESSION_SECRET = SECRET;
  });
  afterEach(() => {
    delete process.env.ADMIN_SESSION_SECRET;
  });

  it('returns 401 with no cookie — repo is never called', async () => {
    const deleteReview = jest.fn();
    const handler = createDeleteHandler({ deleteReview });

    const res = await handler(makeDeleteRequest(), fakeParams());

    expect(res.status).toBe(401);
    const body = (await res.json()) as { error: string };
    expect(body.error).toBe('Unauthorized');
    expect(deleteReview).not.toHaveBeenCalled();
  });

  it('returns 401 with a junk np_admin cookie — repo is never called', async () => {
    const deleteReview = jest.fn();
    const handler = createDeleteHandler({ deleteReview });

    const res = await handler(makeDeleteRequest('np_admin=not-a-valid-token'), fakeParams());

    expect(res.status).toBe(401);
    expect(deleteReview).not.toHaveBeenCalled();
  });

  it('calls deleteReview and returns 200 with a valid np_admin token', async () => {
    const token = await createSessionToken(SECRET);
    const deleteReview = jest.fn().mockResolvedValue(true);
    const handler = createDeleteHandler({ deleteReview });

    const res = await handler(makeDeleteRequest(`np_admin=${token}`), fakeParams());

    expect(res.status).toBe(200);
    const body = (await res.json()) as { success: boolean };
    expect(body.success).toBe(true);
    expect(deleteReview).toHaveBeenCalledWith('rev-1');
  });

  it('returns 404 when deleteReview returns false', async () => {
    const token = await createSessionToken(SECRET);
    const deleteReview = jest.fn().mockResolvedValue(false);
    const handler = createDeleteHandler({ deleteReview });

    const res = await handler(makeDeleteRequest(`np_admin=${token}`), fakeParams('unknown'));

    expect(res.status).toBe(404);
    expect(deleteReview).toHaveBeenCalled();
  });

  it('returns 500 when deleteReview throws', async () => {
    const token = await createSessionToken(SECRET);
    const deleteReview = jest.fn().mockRejectedValue(new Error('db down'));
    const handler = createDeleteHandler({ deleteReview });

    const res = await handler(makeDeleteRequest(`np_admin=${token}`), fakeParams());

    expect(res.status).toBe(500);
  });
});
