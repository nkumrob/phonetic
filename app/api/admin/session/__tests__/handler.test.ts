/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { createLoginHandler, createLogoutHandler } from '../handler';
import { verifySessionToken } from '@/lib/server/admin-session';

const allow = { check: jest.fn().mockResolvedValue({ allowed: true, remaining: 4, reset: new Date() }) };
const ENV = { password: 'correct-horse', secret: 'session-secret' };

function loginRequest(body: unknown) {
  return new NextRequest('http://localhost/api/admin/session', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

describe('POST /api/admin/session (login)', () => {
  it('sets a verifiable np_admin cookie on correct password', async () => {
    const handler = createLoginHandler({ limiter: allow, env: ENV });

    const res = await handler(loginRequest({ password: 'correct-horse' }));

    expect(res.status).toBe(200);
    const cookie = res.cookies.get('np_admin');
    expect(cookie?.httpOnly).toBe(true);
    expect(cookie?.sameSite).toBe('lax');
    expect(await verifySessionToken(cookie?.value, 'session-secret')).toBe(true);
  });

  it('rejects wrong passwords with 401 and no cookie', async () => {
    const handler = createLoginHandler({ limiter: allow, env: ENV });

    const res = await handler(loginRequest({ password: 'wrong' }));

    expect(res.status).toBe(401);
    expect(res.cookies.get('np_admin')).toBeUndefined();
  });

  it('rejects non-string and missing passwords with 400', async () => {
    const handler = createLoginHandler({ limiter: allow, env: ENV });
    expect((await handler(loginRequest({}))).status).toBe(400);
    expect((await handler(loginRequest({ password: 42 }))).status).toBe(400);
  });

  it('returns 503 when ADMIN_PASSWORD is not configured', async () => {
    const handler = createLoginHandler({ limiter: allow, env: { password: '', secret: 's' } });
    expect((await handler(loginRequest({ password: 'x' }))).status).toBe(503);
  });

  it('rate limits login attempts (429)', async () => {
    const deny = { check: jest.fn().mockResolvedValue({ allowed: false, remaining: 0, reset: new Date() }) };
    const handler = createLoginHandler({ limiter: deny, env: ENV });
    expect((await handler(loginRequest({ password: 'correct-horse' }))).status).toBe(429);
  });
});

describe('DELETE /api/admin/session (logout)', () => {
  it('clears the cookie', async () => {
    const handler = createLogoutHandler();
    const res = await handler();

    expect(res.status).toBe(200);
    expect(res.cookies.get('np_admin')?.value).toBe('');
  });
});
