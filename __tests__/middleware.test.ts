/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { middleware } from '../middleware';

describe('anonymous id middleware', () => {
  it('sets an np_anon cookie for visitors without one', () => {
    const response = middleware(new NextRequest('http://localhost/'));

    const cookie = response.cookies.get('np_anon');
    expect(cookie?.value).toMatch(/^[0-9a-f-]{36}$/);
    expect(cookie?.httpOnly).toBe(true);
    expect(cookie?.sameSite).toBe('lax');
    expect(cookie?.maxAge).toBe(60 * 60 * 24 * 365);
  });

  it('does not reissue when the cookie already exists', () => {
    const request = new NextRequest('http://localhost/', {
      headers: { cookie: 'np_anon=existing-id' },
    });

    const response = middleware(request);

    expect(response.cookies.get('np_anon')).toBeUndefined();
  });
});
