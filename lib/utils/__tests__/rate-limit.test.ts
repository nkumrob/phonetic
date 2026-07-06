/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { RateLimiter } from '../rate-limit';

function makeRequest(ip: string = '10.0.0.1') {
  return new NextRequest('http://localhost/test', {
    method: 'GET',
    headers: { 'x-forwarded-for': ip },
  });
}

describe('RateLimiter', () => {
  describe('keyPrefix namespace isolation', () => {
    it('two limiters with different keyPrefixes do not share counts for the same IP', async () => {
      // Use unique prefixes per test-run to avoid cross-test state pollution
      const suffix = Math.random().toString(36).slice(2);
      const limiterA = new RateLimiter({ keyPrefix: `ns-a-${suffix}`, max: 1, windowMs: 60_000 });
      const limiterB = new RateLimiter({ keyPrefix: `ns-b-${suffix}`, max: 1, windowMs: 60_000 });
      const req = makeRequest('192.0.2.99');

      // Exhaust limiter A
      const firstA = await limiterA.check(req);
      expect(firstA.allowed).toBe(true);
      const secondA = await limiterA.check(req);
      expect(secondA.allowed).toBe(false); // A is now exhausted

      // Limiter B must still allow the same IP — its namespace is separate
      const firstB = await limiterB.check(req);
      expect(firstB.allowed).toBe(true);
    });

    it('limiters sharing the same keyPrefix share a counter', async () => {
      const suffix = Math.random().toString(36).slice(2);
      const prefix = `shared-${suffix}`;
      const limiter1 = new RateLimiter({ keyPrefix: prefix, max: 2, windowMs: 60_000 });
      const limiter2 = new RateLimiter({ keyPrefix: prefix, max: 2, windowMs: 60_000 });
      const req = makeRequest('192.0.2.77');

      await limiter1.check(req); // count = 1
      await limiter2.check(req); // count = 2
      const result = await limiter1.check(req); // count = 3 → over max 2
      expect(result.allowed).toBe(false);
    });
  });

  describe('trustProxyIp mode', () => {
    it('shares one bucket when leftmost xff differs but rightmost hop is the same', async () => {
      const suffix = Math.random().toString(36).slice(2);
      const limiter = new RateLimiter({ keyPrefix: `trusted-${suffix}`, max: 1, windowMs: 60_000, trustProxyIp: true });

      // Attacker rotates the client-supplied (leftmost) entry; rightmost (proxy) stays the same
      const req1 = new NextRequest('http://localhost/test', {
        headers: { 'x-forwarded-for': '1.2.3.4, 10.0.0.1' },
      });
      const req2 = new NextRequest('http://localhost/test', {
        headers: { 'x-forwarded-for': '9.9.9.9, 10.0.0.1' },
      });

      const first = await limiter.check(req1);
      expect(first.allowed).toBe(true);

      // Same rightmost hop → same bucket → now at limit → blocked
      const second = await limiter.check(req2);
      expect(second.allowed).toBe(false);
    });

    it('without trustProxyIp, different leftmost xff entries are treated as different identifiers', async () => {
      const suffix = Math.random().toString(36).slice(2);
      const limiter = new RateLimiter({ keyPrefix: `untrusted-${suffix}`, max: 1, windowMs: 60_000 });

      const req1 = new NextRequest('http://localhost/test', {
        headers: { 'x-forwarded-for': '1.2.3.4, 10.0.0.1' },
      });
      const req2 = new NextRequest('http://localhost/test', {
        headers: { 'x-forwarded-for': '9.9.9.9, 10.0.0.1' },
      });

      const first = await limiter.check(req1);
      expect(first.allowed).toBe(true);

      // Different leftmost → different bucket → still allowed (existing legacy behaviour)
      const second = await limiter.check(req2);
      expect(second.allowed).toBe(true);
    });
  });

  describe('no-prefix backward compatibility', () => {
    it('allows requests up to max when no keyPrefix is provided', async () => {
      const suffix = Math.random().toString(36).slice(2);
      // Use a very high limit to avoid interfering with other tests that share
      // the no-prefix namespace; unique IPs prevent collisions.
      const limiter = new RateLimiter({ max: 3, windowMs: 60_000 });
      const req = makeRequest(`10.99.${suffix.charCodeAt(0)}.1`);

      const r1 = await limiter.check(req);
      const r2 = await limiter.check(req);
      const r3 = await limiter.check(req);
      const r4 = await limiter.check(req);

      expect(r1.allowed).toBe(true);
      expect(r2.allowed).toBe(true);
      expect(r3.allowed).toBe(true);
      expect(r4.allowed).toBe(false);
    });
  });
});
