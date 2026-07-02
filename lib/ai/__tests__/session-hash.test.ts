/**
 * @jest-environment node
 */
import type { NextRequest } from 'next/server';
import { anonymousSessionHash } from '../session-hash';

function fakeRequest(ip: string, userAgent: string): NextRequest {
  return {
    headers: new Headers({ 'x-forwarded-for': ip, 'user-agent': userAgent }),
  } as unknown as NextRequest;
}

describe('anonymousSessionHash', () => {
  it('is stable for the same visitor on the same day', () => {
    const a = anonymousSessionHash(fakeRequest('203.0.113.7', 'Mozilla/5.0'));
    const b = anonymousSessionHash(fakeRequest('203.0.113.7', 'Mozilla/5.0'));

    expect(a).toBe(b);
  });

  it('differs across visitors', () => {
    const a = anonymousSessionHash(fakeRequest('203.0.113.7', 'Mozilla/5.0'));
    const b = anonymousSessionHash(fakeRequest('198.51.100.9', 'Mozilla/5.0'));

    expect(a).not.toBe(b);
  });

  it('never contains the raw IP and looks like a hex digest', () => {
    const hash = anonymousSessionHash(fakeRequest('203.0.113.7', 'Mozilla/5.0'));

    expect(hash).not.toContain('203.0.113.7');
    expect(hash).toMatch(/^[a-f0-9]{16}$/);
  });

  it('tolerates missing headers', () => {
    const request = { headers: new Headers() } as unknown as NextRequest;

    expect(anonymousSessionHash(request)).toMatch(/^[a-f0-9]{16}$/);
  });
});