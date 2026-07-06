/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { middleware } from '../middleware';

const EXISTING_UUID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

describe('anonymous id middleware', () => {
  it('sets an np_anon cookie for visitors without one', () => {
    const response = middleware(new NextRequest('http://localhost/'));

    const cookie = response.cookies.get('np_anon');
    expect(cookie?.value).toMatch(/^[0-9a-f-]{36}$/);
    expect(cookie?.httpOnly).toBe(true);
    expect(cookie?.sameSite).toBe('lax');
    expect(cookie?.maxAge).toBe(60 * 60 * 24 * 365);
  });

  it('refreshes the existing cookie value with a fresh maxAge', () => {
    const request = new NextRequest('http://localhost/', {
      headers: { cookie: `np_anon=${EXISTING_UUID}` },
    });

    const response = middleware(request);

    const cookie = response.cookies.get('np_anon');
    expect(cookie?.value).toBe(EXISTING_UUID);
    expect(cookie?.maxAge).toBe(31536000);
  });

  it('replaces a malformed np_anon cookie with a fresh UUID instead of renewing it verbatim', () => {
    const request = new NextRequest('http://localhost/', {
      headers: { cookie: 'np_anon=garbage' },
    });

    const response = middleware(request);

    const cookie = response.cookies.get('np_anon');
    expect(cookie?.value).not.toBe('garbage');
    expect(cookie?.value).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
  });
});
