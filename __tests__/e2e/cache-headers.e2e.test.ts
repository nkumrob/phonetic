import { getCacheHeaders, cacheConfigs } from '@/lib/utils/cache-headers';

describe('Cache Headers E2E', () => {
  test('static content has long cache duration', () => {
    const headers = getCacheHeaders(cacheConfigs.static);
    const cacheControl = headers.get('Cache-Control');
    
    expect(cacheControl).toContain('public');
    expect(cacheControl).toContain('max-age=3600'); // 1 hour
    expect(cacheControl).toContain('s-maxage=86400'); // 24 hours
    expect(cacheControl).toContain('stale-while-revalidate=604800'); // 7 days
  });
  
  test('realtime content is not cached', () => {
    const headers = getCacheHeaders(cacheConfigs.realtime);
    const cacheControl = headers.get('Cache-Control');
    
    expect(cacheControl).toContain('no-store');
    expect(cacheControl).toContain('no-cache');
    expect(cacheControl).toContain('must-revalidate');
  });
  
  test('API responses have appropriate caching', () => {
    const headers = getCacheHeaders(cacheConfigs.api);
    const cacheControl = headers.get('Cache-Control');
    
    expect(cacheControl).toContain('public');
    expect(cacheControl).toContain('max-age=0'); // No browser cache
    expect(cacheControl).toContain('s-maxage=300'); // 5 min CDN cache
    expect(cacheControl).toContain('stale-while-revalidate=3600'); // 1 hour SWR
  });
  
  test('private content is cached only in browser', () => {
    const headers = getCacheHeaders(cacheConfigs.private);
    const cacheControl = headers.get('Cache-Control');
    
    expect(cacheControl).toContain('private');
    expect(cacheControl).toContain('max-age=300'); // 5 minutes
    expect(cacheControl).not.toContain('s-maxage'); // No CDN cache
  });
  
  test('Vercel CDN headers are set correctly', () => {
    const headers = getCacheHeaders({ sMaxAge: 3600 });
    
    expect(headers.get('CDN-Cache-Control')).toBe('max-age=3600');
    expect(headers.get('Vercel-CDN-Cache-Control')).toBe('max-age=3600');
  });
  
  test('cache headers prevent unnecessary API calls', () => {
    // Verify different cache strategies
    const strategies = {
      '/api/pdf': cacheConfigs.static,      // Static, cacheable
      '/api/health': cacheConfigs.realtime, // Dynamic, no cache
    };
    
    Object.entries(strategies).forEach(([route, config]) => {
      const headers = getCacheHeaders(config);
      expect(headers.get('Cache-Control')).toBeTruthy();
    });
  });
});