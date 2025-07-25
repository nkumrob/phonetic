import { test, expect } from '@playwright/test';

test.describe('Security Headers', () => {
  test('should have all required security headers', async ({ page }) => {
    const response = await page.goto('/');
    const headers = response?.headers() || {};
    
    // Check for required security headers
    expect(headers['x-frame-options']).toBe('DENY');
    expect(headers['x-content-type-options']).toBe('nosniff');
    expect(headers['x-xss-protection']).toBe('1; mode=block');
    expect(headers['referrer-policy']).toBe('origin-when-cross-origin');
    expect(headers['permissions-policy']).toBeTruthy();
    
    // Check for CSP
    const csp = headers['content-security-policy'];
    expect(csp).toBeTruthy();
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("script-src");
    expect(csp).toContain("style-src");
  });

  test('should have HSTS header in production', async ({ page }) => {
    const response = await page.goto('/');
    const headers = response?.headers() || {};
    
    // In production, should have strict transport security
    if (process.env.NODE_ENV === 'production') {
      expect(headers['strict-transport-security']).toBeTruthy();
      expect(headers['strict-transport-security']).toContain('max-age=');
    }
  });
});