import { RateLimiter } from '@/lib/utils/rate-limit';
import { NextRequest } from 'next/server';

describe('Rate Limiting E2E', () => {
  let rateLimiter: RateLimiter;
  
  beforeEach(() => {
    rateLimiter = new RateLimiter({
      max: 5,
      windowMs: 1000, // 1 second window for testing
    });
  });
  
  test('should allow requests within rate limit', async () => {
    const mockRequest = {
      headers: new Headers({ 'x-real-ip': '192.168.1.1' }),
      ip: '192.168.1.1',
    } as unknown as NextRequest;
    
    // First 5 requests should be allowed
    for (let i = 0; i < 5; i++) {
      const result = await rateLimiter.check(mockRequest);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(5 - i - 1);
    }
  });
  
  test('should block requests exceeding rate limit', async () => {
    const mockRequest = {
      headers: new Headers({ 'x-real-ip': '192.168.1.2' }),
      ip: '192.168.1.2',
    } as unknown as NextRequest;
    
    // Make 5 allowed requests
    for (let i = 0; i < 5; i++) {
      await rateLimiter.check(mockRequest);
    }
    
    // 6th request should be blocked
    const result = await rateLimiter.check(mockRequest);
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });
  
  test('should reset after time window', async () => {
    jest.useFakeTimers();
    
    const mockRequest = {
      headers: new Headers({ 'x-real-ip': '192.168.1.3' }),
      ip: '192.168.1.3',
    } as unknown as NextRequest;
    
    // Exhaust rate limit
    for (let i = 0; i < 6; i++) {
      await rateLimiter.check(mockRequest);
    }
    
    // Should be blocked
    let result = await rateLimiter.check(mockRequest);
    expect(result.allowed).toBe(false);
    
    // Advance time past window
    jest.advanceTimersByTime(1100);
    
    // Should be allowed again
    result = await rateLimiter.check(mockRequest);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(4); // 5 - 1
    
    jest.useRealTimers();
  });
  
  test('should track different IPs separately', async () => {
    const request1 = {
      headers: new Headers({ 'x-real-ip': '192.168.1.4' }),
      ip: '192.168.1.4',
    } as unknown as NextRequest;
    
    const request2 = {
      headers: new Headers({ 'x-real-ip': '192.168.1.5' }),
      ip: '192.168.1.5',
    } as unknown as NextRequest;
    
    // Exhaust limit for first IP
    for (let i = 0; i < 6; i++) {
      await rateLimiter.check(request1);
    }
    
    // First IP should be blocked
    const result1 = await rateLimiter.check(request1);
    expect(result1.allowed).toBe(false);
    
    // Second IP should still be allowed
    const result2 = await rateLimiter.check(request2);
    expect(result2.allowed).toBe(true);
    expect(result2.remaining).toBe(4);
  });
  
  test('should create proper rate limit headers', () => {
    const result = {
      allowed: false,
      remaining: 0,
      reset: new Date(Date.now() + 60000),
    };
    
    const headers = rateLimiter.createHeaders(result);
    
    expect(headers.get('X-RateLimit-Limit')).toBe('5');
    expect(headers.get('X-RateLimit-Remaining')).toBe('0');
    expect(headers.get('X-RateLimit-Reset')).toBeTruthy();
    expect(headers.get('Retry-After')).toBeTruthy();
    expect(parseInt(headers.get('Retry-After')!)).toBeGreaterThan(0);
  });
});