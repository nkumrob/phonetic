/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { createFeatureRequestHandler } from '../handler';

const allow = {
  check: jest.fn().mockResolvedValue({ allowed: true, remaining: 9, reset: new Date() }),
};
const deny = {
  check: jest.fn().mockResolvedValue({ allowed: false, remaining: 0, reset: new Date() }),
};

function makeRequest(body: unknown) {
  return new NextRequest('http://localhost/api/feature-requests', {
    method: 'POST',
    body: typeof body === 'string' ? body : JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('POST /api/feature-requests', () => {
  it('201 happy path: minimal valid request', async () => {
    const insert = jest.fn().mockResolvedValue(undefined);
    const handler = createFeatureRequestHandler({ insert, limiter: allow });

    const res = await handler(makeRequest({ request: 'x'.repeat(10) }));

    expect(res.status).toBe(201);
    const body = await res.json() as { ok: boolean };
    expect(body.ok).toBe(true);
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({
        id: expect.stringMatching(/^[0-9a-f-]{36}$/),
        name: null,
        email: null,
        request: 'x'.repeat(10),
      })
    );
  });

  it('201 with optional name and email', async () => {
    const insert = jest.fn().mockResolvedValue(undefined);
    const handler = createFeatureRequestHandler({ insert, limiter: allow });

    const res = await handler(
      makeRequest({ request: 'A request here.', name: 'Alice', email: 'a@b.com' })
    );

    expect(res.status).toBe(201);
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Alice', email: 'a@b.com' })
    );
  });

  it('201 with empty name/email strings coerced to null', async () => {
    const insert = jest.fn().mockResolvedValue(undefined);
    const handler = createFeatureRequestHandler({ insert, limiter: allow });

    const res = await handler(
      makeRequest({ request: 'x'.repeat(10), name: '', email: '' })
    );

    expect(res.status).toBe(201);
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({ name: null, email: null })
    );
  });

  it('400 when request field is missing', async () => {
    const insert = jest.fn();
    const handler = createFeatureRequestHandler({ insert, limiter: allow });

    const res = await handler(makeRequest({ name: 'Alice' }));

    expect(res.status).toBe(400);
    expect(insert).not.toHaveBeenCalled();
  });

  it('400 when request is too short (< 10 chars)', async () => {
    const insert = jest.fn();
    const handler = createFeatureRequestHandler({ insert, limiter: allow });

    const res = await handler(makeRequest({ request: 'short' }));

    expect(res.status).toBe(400);
  });

  it('400 when request is too long (> 2000 chars)', async () => {
    const insert = jest.fn();
    const handler = createFeatureRequestHandler({ insert, limiter: allow });

    const res = await handler(makeRequest({ request: 'a'.repeat(2001) }));

    expect(res.status).toBe(400);
  });

  it('400 when name is too long (> 80 chars)', async () => {
    const insert = jest.fn();
    const handler = createFeatureRequestHandler({ insert, limiter: allow });

    const res = await handler(
      makeRequest({ request: 'x'.repeat(10), name: 'n'.repeat(81) })
    );

    expect(res.status).toBe(400);
  });

  it('400 when email does not contain @', async () => {
    const insert = jest.fn();
    const handler = createFeatureRequestHandler({ insert, limiter: allow });

    const res = await handler(
      makeRequest({ request: 'x'.repeat(10), email: 'notanemail' })
    );

    expect(res.status).toBe(400);
  });

  it('400 when email is too long (> 120 chars)', async () => {
    const insert = jest.fn();
    const handler = createFeatureRequestHandler({ insert, limiter: allow });

    const res = await handler(
      makeRequest({ request: 'x'.repeat(10), email: 'a@' + 'b'.repeat(120) })
    );

    expect(res.status).toBe(400);
  });

  it('400 for invalid JSON body', async () => {
    const insert = jest.fn();
    const handler = createFeatureRequestHandler({ insert, limiter: allow });

    const res = await handler(makeRequest('not-valid-json'));

    expect(res.status).toBe(400);
  });

  it('429 when rate limited — insert is NOT called', async () => {
    const insert = jest.fn();
    const handler = createFeatureRequestHandler({ insert, limiter: deny });

    const res = await handler(makeRequest({ request: 'x'.repeat(10) }));

    expect(res.status).toBe(429);
    expect(insert).not.toHaveBeenCalled();
  });

  it('500 when insert throws', async () => {
    const insert = jest.fn().mockRejectedValue(new Error('DB error'));
    const handler = createFeatureRequestHandler({ insert, limiter: allow });

    const res = await handler(makeRequest({ request: 'x'.repeat(10) }));

    expect(res.status).toBe(500);
  });
});
