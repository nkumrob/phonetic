import { test, expect } from '@playwright/test';
import { checkForConsoleErrors } from '../helpers/test-utils';

test.describe('Console Logs in Production', () => {
  test.beforeEach(async ({ page }) => {
    // Set NODE_ENV to production for these tests
    await page.addInitScript(() => {
      (window as any).__TEST_ENV__ = 'production';
    });
  });

  test('should not have console logs on home page', async ({ page }) => {
    const errors = await checkForConsoleErrors(page);
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    expect(errors).toHaveLength(0);
  });

  test('should not have console logs during quiz interaction', async ({ page }) => {
    const errors = await checkForConsoleErrors(page);
    
    await page.goto('/practice');
    await page.click('text=Practice');
    
    // Answer a question
    await page.click('.quiz-option >> nth=0');
    await page.waitForTimeout(500);
    
    expect(errors).toHaveLength(0);
  });

  test('should not have console logs during flashcard usage', async ({ page }) => {
    const errors = await checkForConsoleErrors(page);
    
    await page.goto('/learn');
    await page.click('text=Flashcards');
    
    // Flip card
    await page.click('.flashcard');
    await page.waitForTimeout(500);
    
    // Navigate cards
    await page.click('text=Next');
    
    expect(errors).toHaveLength(0);
  });

  test('should not log errors during API calls', async ({ page }) => {
    const errors = await checkForConsoleErrors(page);
    
    await page.goto('/tools');
    
    // Test text converter
    await page.fill('textarea', 'TEST');
    await page.waitForTimeout(1000);
    
    expect(errors).toHaveLength(0);
  });

  test('should handle errors without console logs', async ({ page }) => {
    const errors = await checkForConsoleErrors(page);
    
    // Trigger a 404
    await page.goto('/non-existent-page');
    
    // Should show error page without console logs
    await expect(page.locator('text=404')).toBeVisible();
    expect(errors).toHaveLength(0);
  });
});