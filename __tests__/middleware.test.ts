/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { middleware } from '../middleware';
import { createSessionToken } from '@/lib/server/admin-session';

const EXISTING_UUID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

describe('anonymous id middleware', () => {
  it('sets an np_anon cookie for visitors without one', async () => {
    const response = await middleware(new NextRequest('http://localhost/'));

    const cookie = response.cookies.get('np_anon');
    expect(cookie?.value).toMatch(/^[0-9a-f-]{36}$/);
    expect(cookie?.httpOnly).toBe(true);
    expect(cookie?.sameSite).toBe('lax');
    expect(cookie?.maxAge).toBe(60 * 60 * 24 * 365);
  });

  it('refreshes the existing cookie value with a fresh maxAge', async () => {
    const request = new NextRequest('http://localhost/', {
      headers: { cookie: `np_anon=${EXISTING_UUID}` },
    });

    const response = await middleware(request);

    const cookie = response.cookies.get('np_anon');
    expect(cookie?.value).toBe(EXISTING_UUID);
    expect(cookie?.maxAge).toBe(31536000);
  });

  it('replaces a malformed np_anon cookie with a fresh UUID instead of renewing it verbatim', async () => {
    const request = new NextRequest('http://localhost/', {
      headers: { cookie: 'np_anon=garbage' },
    });

    const response = await middleware(request);

    const cookie = response.cookies.get('np_anon');
    expect(cookie?.value).not.toBe('garbage');
    expect(cookie?.value).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
  });
});

describe('admin guard', () => {
  const SECRET = 'test-secret';

  beforeEach(() => {
    process.env.ADMIN_SESSION_SECRET = SECRET;
  });
  afterEach(() => {
    delete process.env.ADMIN_SESSION_SECRET;
  });

  it('redirects unauthenticated /admin pages to /admin/login', async () => {
    const res = await middleware(new NextRequest('http://localhost/admin'));
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toBe('http://localhost/admin/login');
  });

  it('lets /admin/login through without a session', async () => {
    const res = await middleware(new NextRequest('http://localhost/admin/login'));
    expect(res.status).toBe(200);
  });

  it('allows /admin with a valid session cookie', async () => {
    const token = await createSessionToken(SECRET);
    const res = await middleware(
      new NextRequest('http://localhost/admin', { headers: { cookie: `np_admin=${token}` } })
    );
    expect(res.status).toBe(200);
  });

  it('401s /api/admin/* without a session but allows /api/admin/session', async () => {
    expect((await middleware(new NextRequest('http://localhost/api/admin/stats/overview'))).status).toBe(401);
    expect((await middleware(new NextRequest('http://localhost/api/admin/session', { method: 'POST' }))).status).toBe(200);
  });

  it('401s /api/admin/session-hijack without a session (prefix-sharing route is NOT exempt)', async () => {
    const res = await middleware(new NextRequest('http://localhost/api/admin/session-hijack'));
    expect(res.status).toBe(401);
  });

  it('401s review mutations but not review reads', async () => {
    expect((await middleware(new NextRequest('http://localhost/api/reviews/abc', { method: 'PATCH' }))).status).toBe(401);
    expect((await middleware(new NextRequest('http://localhost/api/reviews/abc', { method: 'DELETE' }))).status).toBe(401);
    expect((await middleware(new NextRequest('http://localhost/api/reviews'))).status).toBe(200);
  });

  it('denies everything when the secret is unset', async () => {
    delete process.env.ADMIN_SESSION_SECRET;
    const token = await createSessionToken(SECRET);
    const res = await middleware(
      new NextRequest('http://localhost/admin', { headers: { cookie: `np_admin=${token}` } })
    );
    expect(res.status).toBe(307);
  });
});
