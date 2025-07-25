import { NextRequest, NextResponse } from 'next/server';
import { RateLimiter } from '@/lib/utils/rate-limit';

/**
 * Middleware wrapper to add rate limiting to API routes
 */
export function withRateLimit(
  handler: (request: NextRequest) => Promise<NextResponse> | NextResponse,
  options?: { max?: number; windowMs?: number }
) {
  const rateLimiter = new RateLimiter(options);
  
  return async (request: NextRequest): Promise<NextResponse> => {
    // Check rate limit
    const rateLimitResult = await rateLimiter.check(request);
    
    // If rate limited, return 429 response
    if (!rateLimitResult.allowed) {
      const headers = rateLimiter.createHeaders(rateLimitResult);
      
      return NextResponse.json(
        {
          error: 'Too Many Requests',
          message: `Rate limit exceeded. Please retry after ${headers.get('Retry-After')} seconds.`,
        },
        {
          status: 429,
          headers,
        }
      );
    }
    
    // Process request
    const response = await handler(request);
    
    // Add rate limit headers to response
    const headers = rateLimiter.createHeaders(rateLimitResult);
    headers.forEach((value, key) => {
      response.headers.set(key, value);
    });
    
    return response;
  };
}