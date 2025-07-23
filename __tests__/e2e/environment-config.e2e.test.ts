import { config, env } from '@/lib/config/env';

describe('Environment Configuration E2E', () => {
  test('should load environment variables correctly', () => {
    // Test default values are loaded
    expect(config.siteUrl).toBe('http://localhost:3000');
    expect(config.nodeEnv).toBe('test'); // Jest sets NODE_ENV to 'test'
    
    // Test feature flags
    expect(config.enableAnalytics).toBe(false);
    expect(config.enablePwa).toBe(false);
    
    // Test API configuration
    expect(config.apiRateLimitMax).toBe(100);
    expect(config.apiRateLimitWindowMs).toBe(900000);
  });
  
  test('should have correct environment helper methods', () => {
    // In test environment
    expect(env.isTest()).toBe(true);
    expect(env.isDevelopment()).toBe(false);
    expect(env.isProduction()).toBe(false);
  });
  
  test('should handle missing optional values gracefully', () => {
    expect(config.gaId).toBeUndefined();
    expect(config.googleSiteVerification).toBeUndefined();
    expect(config.sentryDsn).toBeUndefined();
  });
});