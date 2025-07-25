import { test, expect } from '@playwright/test';
import { measurePerformance, checkAccessibility } from '../helpers/test-utils';

test.describe('Full User Flow Regression Tests', () => {
  test('complete learning journey should work end-to-end', async ({ page }) => {
    // Start timing
    const startTime = Date.now();
    
    // 1. Visit home page
    await page.goto('/');
    await expect(page.locator('h1:text("Master the NATO")')).toBeVisible();
    
    // Check accessibility
    const homeAccessibility = await checkAccessibility(page);
    expect(homeAccessibility.hasProperHeadings).toBe(true);
    expect(homeAccessibility.hasAriaLabels).toBe(true);
    
    // 2. Explore alphabet grid
    await page.click('text=Interactive NATO alphabet grid');
    await expect(page.locator('.phonetic-card').first()).toBeVisible();
    
    // Test keyboard navigation
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    await expect(page.locator('.speaking')).toBeVisible();
    
    // 3. Use text converter
    await page.goto('/tools');
    await page.fill('textarea', 'HELLO');
    await expect(page.locator('text=Hotel Echo Lima Lima Oscar')).toBeVisible();
    
    // Test copy functionality
    await page.click('button:has-text("Copy")');
    const clipboard = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboard).toContain('Hotel Echo Lima Lima Oscar');
    
    // 4. Try flashcards
    await page.goto('/practice');
    await page.click('text=Learn');
    
    // Flip cards
    for (let i = 0; i < 3; i++) {
      await page.click('.flashcard');
      await page.waitForTimeout(500);
      await page.click('text=Next');
    }
    
    // 5. Take a quiz
    await page.goto('/practice');
    await page.click('text=Practice mode');
    
    // Answer 10 questions
    let correctAnswers = 0;
    for (let i = 0; i < 10; i++) {
      const question = await page.locator('.question-text').textContent();
      
      // Find correct answer (for testing)
      const options = await page.locator('.quiz-option').all();
      for (const option of options) {
        const text = await option.textContent();
        if (text && question?.includes(text.charAt(0))) {
          await option.click();
          correctAnswers++;
          break;
        }
      }
      
      await page.waitForTimeout(500);
    }
    
    // Check quiz completion
    await expect(page.locator('text=Quiz Complete')).toBeVisible();
    await expect(page.locator(`text=${correctAnswers}/10`)).toBeVisible();
    
    // 6. Check profile
    await page.goto('/profile');
    await expect(page.locator('text=Your Progress')).toBeVisible();
    await expect(page.locator('text=Total Quizzes')).toBeVisible();
    
    // 7. Customize profile
    await page.fill('input[placeholder*="name"]', 'Test User');
    await page.click('text=👨‍✈️');
    await page.click('button:has-text("Save")');
    
    // 8. Check settings
    await page.goto('/settings');
    
    // Toggle sound
    await page.click('text=Enable Sound Effects');
    
    // Change theme
    await page.click('button:has-text("Dark")');
    await page.click('button:has-text("Save Settings")');
    
    // Verify theme changed
    const isDark = await page.evaluate(() => 
      document.documentElement.classList.contains('dark')
    );
    expect(isDark).toBe(true);
    
    // 9. Download PDF
    await page.goto('/tools');
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.click('text=Download PDF')
    ]);
    
    expect(download.suggestedFilename()).toContain('nato-phonetic');
    
    // 10. Test error recovery
    await page.goto('/non-existent');
    await expect(page.locator('text=404')).toBeVisible();
    await page.click('text=Return Home');
    await expect(page.locator('h1:text("Master the NATO")')).toBeVisible();
    
    // Performance check
    const totalTime = Date.now() - startTime;
    expect(totalTime).toBeLessThan(30000); // 30 seconds for full flow
  });

  test('data persistence across sessions', async ({ browser }) => {
    // First session
    const context1 = await browser.newContext();
    const page1 = await context1.newPage();
    
    await page1.goto('/profile');
    await page1.fill('input[placeholder*="name"]', 'Persistent User');
    await page1.click('button:has-text("Save")');
    
    // Take a quiz
    await page1.goto('/practice');
    await page1.click('text=Practice mode');
    
    // Answer one question
    await page1.click('.quiz-option >> nth=0');
    await page1.waitForTimeout(500);
    
    // Close context
    await context1.close();
    
    // Second session - data should persist
    const context2 = await browser.newContext();
    const page2 = await context2.newPage();
    
    await page2.goto('/profile');
    const userName = await page2.inputValue('input[placeholder*="name"]');
    expect(userName).toBe('Persistent User');
    
    // Check quiz history
    await expect(page2.locator('text=Total Quizzes')).toBeVisible();
    const quizCount = await page2.locator('text=Total Quizzes').locator('..').locator('text=/\\d+/').textContent();
    expect(parseInt(quizCount || '0')).toBeGreaterThan(0);
    
    await context2.close();
  });

  test('responsive design works across devices', async ({ browser }) => {
    // Test different viewports
    const viewports = [
      { width: 375, height: 812, name: 'iPhone X' },
      { width: 768, height: 1024, name: 'iPad' },
      { width: 1920, height: 1080, name: 'Desktop' }
    ];
    
    for (const viewport of viewports) {
      const context = await browser.newContext({
        viewport: { width: viewport.width, height: viewport.height }
      });
      const page = await context.newPage();
      
      await page.goto('/');
      
      // Check responsive elements
      const isMenuVisible = await page.isVisible('.mobile-menu-button');
      const isDesktopNavVisible = await page.isVisible('.desktop-nav');
      
      if (viewport.width < 768) {
        expect(isMenuVisible).toBe(true);
        expect(isDesktopNavVisible).toBe(false);
      } else {
        expect(isMenuVisible).toBe(false);
        expect(isDesktopNavVisible).toBe(true);
      }
      
      // Check grid layout
      await page.goto('/learn');
      const gridColumns = await page.evaluate(() => {
        const grid = document.querySelector('.alphabet-grid');
        if (grid) {
          const styles = window.getComputedStyle(grid);
          return styles.gridTemplateColumns.split(' ').length;
        }
        return 0;
      });
      
      if (viewport.width < 640) {
        expect(gridColumns).toBeLessThanOrEqual(4);
      } else {
        expect(gridColumns).toBeGreaterThanOrEqual(6);
      }
      
      await context.close();
    }
  });

  test('performance remains stable under load', async ({ page }) => {
    // Initial performance baseline
    await page.goto('/');
    const initialMetrics = await measurePerformance(page);
    
    // Simulate heavy usage
    for (let i = 0; i < 20; i++) {
      await page.goto('/practice');
      await page.goto('/learn');
      await page.goto('/tools');
    }
    
    // Final performance check
    await page.goto('/');
    const finalMetrics = await measurePerformance(page);
    
    // Performance should not degrade significantly
    expect(finalMetrics.domContentLoaded).toBeLessThan(initialMetrics.domContentLoaded * 1.5);
    expect(finalMetrics.firstContentfulPaint).toBeLessThan(initialMetrics.firstContentfulPaint * 1.5);
  });
});