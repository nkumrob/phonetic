import { test, expect } from '@playwright/test';

test.describe('Console Logs in Production', () => {
  test('should not have console logs on any page', async ({ page }) => {
    const consoleLogs: string[] = [];
    
    // Listen for all console events
    page.on('console', msg => {
      if (['log', 'error', 'warn', 'info', 'debug'].includes(msg.type())) {
        consoleLogs.push(`${msg.type()}: ${msg.text()}`);
      }
    });
    
    // Test all main pages
    const pages = ['/', '/learn', '/practice', '/tools', '/profile', '/settings'];
    
    for (const pagePath of pages) {
      await page.goto(pagePath);
      await page.waitForLoadState('networkidle');
    }
    
    // Test interactions
    await page.goto('/practice');
    await page.click('div:has-text("Practice")');
    await page.waitForTimeout(500);
    
    await page.goto('/learn');
    await page.click('.phonetic-card >> nth=0');
    await page.waitForTimeout(500);
    
    // Should have no console logs
    expect(consoleLogs).toHaveLength(0);
  });
  
  test('should not log errors during error scenarios', async ({ page }) => {
    const consoleLogs: string[] = [];
    
    page.on('console', msg => {
      if (['log', 'error', 'warn'].includes(msg.type())) {
        consoleLogs.push(msg.text());
      }
    });
    
    // Trigger 404
    await page.goto('/non-existent-page');
    
    // API error
    await page.route('/api/pdf', route => {
      route.fulfill({ status: 500, body: 'Server error' });
    });
    
    await page.goto('/tools');
    await page.click('text=Download PDF').catch(() => {});
    
    expect(consoleLogs).toHaveLength(0);
  });
});