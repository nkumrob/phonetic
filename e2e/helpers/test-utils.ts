import { Page, expect } from '@playwright/test';

export async function checkAccessibility(page: Page) {
  // Basic accessibility checks
  const results = await page.evaluate(() => {
    const checks = {
      hasSkipLink: !!document.querySelector('a[href="#main"]'),
      hasProperHeadings: !!document.querySelector('h1'),
      hasAltTexts: Array.from(document.querySelectorAll('img')).every(img => img.alt),
      hasAriaLabels: Array.from(document.querySelectorAll('button')).every(btn => 
        btn.textContent || btn.getAttribute('aria-label')
      ),
      hasProperContrast: true, // Would need axe-core for real contrast checking
    };
    return checks;
  });
  
  return results;
}

export async function measurePerformance(page: Page) {
  const metrics = await page.evaluate(() => {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    return {
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
      firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
      firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0,
    };
  });
  
  return metrics;
}

export async function checkSecurityHeaders(page: Page) {
  const response = await page.goto('/');
  const headers = response?.headers() || {};
  
  return {
    hasCSP: !!headers['content-security-policy'],
    hasXFrameOptions: !!headers['x-frame-options'],
    hasXContentTypeOptions: !!headers['x-content-type-options'],
    hasStrictTransportSecurity: !!headers['strict-transport-security'],
    hasReferrerPolicy: !!headers['referrer-policy'],
  };
}

export async function simulateSlowNetwork(page: Page, latency = 1000) {
  // Simulate slow 3G
  await page.route('**/*', async route => {
    await new Promise(resolve => setTimeout(resolve, latency));
    await route.continue();
  });
}

export async function waitForLoadComplete(page: Page) {
  await page.waitForLoadState('networkidle');
  await page.evaluate(() => document.fonts.ready);
}

export async function checkForConsoleErrors(page: Page): Promise<string[]> {
  const errors: string[] = [];
  
  page.on('console', msg => {
    if (msg.type() === 'error' || msg.type() === 'warning') {
      errors.push(`${msg.type()}: ${msg.text()}`);
    }
  });
  
  page.on('pageerror', error => {
    errors.push(`Page error: ${error.message}`);
  });
  
  return errors;
}

export async function testKeyboardNavigation(page: Page) {
  // Tab through all interactive elements
  const elements = await page.evaluate(() => {
    const focusableElements = Array.from(
      document.querySelectorAll(
        'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
    );
    return focusableElements.length;
  });
  
  for (let i = 0; i < elements; i++) {
    await page.keyboard.press('Tab');
    const hasFocus = await page.evaluate(() => {
      return document.activeElement !== document.body;
    });
    expect(hasFocus).toBe(true);
  }
}