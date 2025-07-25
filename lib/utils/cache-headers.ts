/**
 * Cache header utilities for API routes
 */

interface CacheOptions {
  maxAge?: number;      // Browser cache in seconds
  sMaxAge?: number;     // CDN cache in seconds
  staleWhileRevalidate?: number; // SWR in seconds
  noStore?: boolean;    // Disable caching completely
  private?: boolean;    // Private cache only
}

/**
 * Generate cache headers for API responses
 */
export function getCacheHeaders(options: CacheOptions = {}): Headers {
  const headers = new Headers();
  
  if (options.noStore) {
    // No caching allowed
    headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    headers.set('Pragma', 'no-cache');
    headers.set('Expires', '0');
  } else {
    // Build Cache-Control header
    const directives: string[] = [];
    
    if (options.private) {
      directives.push('private');
    } else {
      directives.push('public');
    }
    
    if (options.maxAge !== undefined) {
      directives.push(`max-age=${options.maxAge}`);
    }
    
    if (options.sMaxAge !== undefined) {
      directives.push(`s-maxage=${options.sMaxAge}`);
    }
    
    if (options.staleWhileRevalidate !== undefined) {
      directives.push(`stale-while-revalidate=${options.staleWhileRevalidate}`);
    }
    
    headers.set('Cache-Control', directives.join(', '));
    
    // Vercel-specific CDN headers
    if (options.sMaxAge !== undefined) {
      headers.set('CDN-Cache-Control', `max-age=${options.sMaxAge}`);
      headers.set('Vercel-CDN-Cache-Control', `max-age=${options.sMaxAge}`);
    }
  }
  
  return headers;
}

/**
 * Common cache configurations
 */
export const cacheConfigs = {
  // Static content that rarely changes
  static: {
    maxAge: 3600,      // 1 hour browser cache
    sMaxAge: 86400,    // 24 hours CDN cache
    staleWhileRevalidate: 604800, // 7 days SWR
  },
  
  // Dynamic content with some caching
  dynamic: {
    maxAge: 0,         // No browser cache
    sMaxAge: 60,       // 1 minute CDN cache
    staleWhileRevalidate: 300, // 5 minutes SWR
  },
  
  // User-specific content
  private: {
    private: true,
    maxAge: 300,       // 5 minutes browser cache
  },
  
  // Real-time data
  realtime: {
    noStore: true,     // No caching at all
  },
  
  // API responses
  api: {
    maxAge: 0,         // No browser cache
    sMaxAge: 300,      // 5 minutes CDN cache
    staleWhileRevalidate: 3600, // 1 hour SWR
  },
};