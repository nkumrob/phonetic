import { NextRequest } from 'next/server';
import { config } from '@/lib/config/env';
import { logger } from './logger';

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store for rate limiting (for single-instance deployments)
// For production with multiple instances, use Redis or similar
const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Rate limiting utility for API routes
 */
export class RateLimiter {
  private max: number;
  private windowMs: number;
  private keyPrefix: string;

  constructor(options?: { max?: number; windowMs?: number; keyPrefix?: string }) {
    this.max = options?.max || config.apiRateLimitMax;
    this.windowMs = options?.windowMs || config.apiRateLimitWindowMs;
    this.keyPrefix = options?.keyPrefix ?? '';
  }
  
  /**
   * Check if request should be rate limited
   */
  async check(request: NextRequest): Promise<{ allowed: boolean; remaining: number; reset: Date }> {
    // Get identifier (IP address or user ID) scoped to this limiter's namespace
    const identifier = this.getIdentifier(request);
    const storeKey = this.keyPrefix ? `${this.keyPrefix}:${identifier}` : identifier;
    const now = Date.now();

    // Get or create rate limit entry
    let entry = rateLimitStore.get(storeKey);
    
    // Reset if window has passed
    if (!entry || entry.resetTime <= now) {
      entry = {
        count: 0,
        resetTime: now + this.windowMs,
      };
    }
    
    // Increment count
    entry.count++;
    rateLimitStore.set(storeKey, entry);

    // Calculate remaining requests
    const remaining = Math.max(0, this.max - entry.count);
    const reset = new Date(entry.resetTime);
    const allowed = entry.count <= this.max;

    // Log rate limit hit
    if (!allowed) {
      logger.warn('Rate limit exceeded', {
        context: 'rate-limit',
        metadata: {
          identifier: storeKey,
          count: entry.count,
          max: this.max,
        }
      });
    }
    
    // Clean up old entries periodically
    this.cleanup();
    
    return { allowed, remaining, reset };
  }
  
  /**
   * Get identifier for rate limiting (IP-based)
   */
  private getIdentifier(request: NextRequest): string {
    // Try to get real IP from headers (for proxied requests)
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    
    if (forwardedFor) {
      // x-forwarded-for can contain multiple IPs, take the first one
      return forwardedFor.split(',')[0].trim();
    }
    
    if (realIp) {
      return realIp;
    }
    
    // Fallback to unknown (Next.js Request doesn't have ip property)
    return 'unknown';
  }
  
  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    const entries = Array.from(rateLimitStore.entries());
    
    // Only run cleanup occasionally (every 100 requests)
    if (Math.random() > 0.01) return;
    
    for (const [key, entry] of entries) {
      if (entry.resetTime <= now) {
        rateLimitStore.delete(key);
      }
    }
  }
  
  /**
   * Create rate limit headers
   */
  createHeaders(result: { allowed: boolean; remaining: number; reset: Date }): Headers {
    const headers = new Headers();
    
    headers.set('X-RateLimit-Limit', this.max.toString());
    headers.set('X-RateLimit-Remaining', result.remaining.toString());
    headers.set('X-RateLimit-Reset', result.reset.toISOString());
    
    if (!result.allowed) {
      headers.set('Retry-After', Math.ceil((result.reset.getTime() - Date.now()) / 1000).toString());
    }
    
    return headers;
  }
}

// Default rate limiter instance
export const defaultRateLimiter = new RateLimiter();