import { test, expect } from '@playwright/test';
import { checkSecurityHeaders } from '../helpers/test-utils';

test.describe('Security Headers', () => {
  test('should have all required security headers', async ({ page }) => {
    const headers = await checkSecurityHeaders(page);
    
    expect(headers.hasCSP).toBe(true);
    expect(headers.hasXFrameOptions).toBe(true);
    expect(headers.hasXContentTypeOptions).toBe(true);
    expect(headers.hasStrictTransportSecurity).toBe(true);
    expect(headers.hasReferrerPolicy).toBe(true);
  });

  test('should block iframe embedding', async ({ page }) => {
    await page.goto('/');
    
    // Try to embed the site in an iframe
    const iframeBlocked = await page.evaluate(async () => {
      const iframe = document.createElement('iframe');
      iframe.src = window.location.href;
      document.body.appendChild(iframe);
      
      // Wait for potential load
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      try {
        // Try to access iframe content
        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        return !iframeDoc || !iframeDoc.body;
      } catch (e) {
        return true; // Blocked by same-origin policy
      }
    });
    
    expect(iframeBlocked).toBe(true);
  });

  test('should have proper CSP directives', async ({ page }) => {
    const response = await page.goto('/');
    const csp = response?.headers()['content-security-policy'];
    
    if (csp) {
      expect(csp).toContain("default-src 'self'");
      expect(csp).toContain("script-src");
      expect(csp).toContain("style-src");
      expect(csp).toContain("img-src");
      expect(csp).toContain("font-src");
    }
  });
});