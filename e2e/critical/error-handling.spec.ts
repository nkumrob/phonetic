import { test, expect } from '@playwright/test';

test.describe('Error Handling and Recovery', () => {
  test('should handle API failures gracefully', async ({ page, context }) => {
    // Mock API failure
    await context.route('/api/pdf', route => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Server error' })
      });
    });
    
    await page.goto('/tools');
    await page.click('text=Download PDF');
    
    // Should show error message, not crash
    await expect(page.locator('text=error')).toBeVisible();
    
    // Page should still be interactive
    await page.click('text=Text Converter');
    await expect(page.locator('textarea')).toBeVisible();
  });

  test('should handle component errors with boundaries', async ({ page }) => {
    await page.goto('/practice');
    
    // Inject error into component
    await page.evaluate(() => {
      const quiz = document.querySelector('.quiz-container');
      if (quiz) {
        Object.defineProperty(quiz, 'innerHTML', {
          get() { throw new Error('Component error'); }
        });
      }
    });
    
    // Try to interact - should show error boundary
    await page.click('text=Practice').catch(() => {});
    
    // Should show error UI
    await expect(page.locator('text=Something went wrong')).toBeVisible();
    await expect(page.locator('button:text("Try Again")')).toBeVisible();
  });

  test('should handle network failures', async ({ page, context }) => {
    await page.goto('/');
    
    // Go offline
    await context.setOffline(true);
    
    // Try to navigate
    await page.click('text=Practice').catch(() => {});
    
    // Should handle offline state gracefully
    const isOnline = await page.evaluate(() => navigator.onLine);
    expect(isOnline).toBe(false);
    
    // Go back online
    await context.setOffline(false);
    
    // Should recover
    await page.reload();
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should handle localStorage errors', async ({ page }) => {
    await page.goto('/');
    
    // Mock localStorage to throw errors
    await page.evaluate(() => {
      Object.defineProperty(window, 'localStorage', {
        value: {
          getItem: () => { throw new Error('Storage error'); },
          setItem: () => { throw new Error('Storage error'); },
          removeItem: () => { throw new Error('Storage error'); },
          clear: () => { throw new Error('Storage error'); }
        },
        configurable: true
      });
    });
    
    // Navigate to pages that use localStorage
    await page.goto('/practice');
    await page.goto('/profile');
    
    // Should not crash, fallback to memory storage
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should handle malformed data gracefully', async ({ page }) => {
    // Set corrupted data in localStorage
    await page.evaluate(() => {
      localStorage.setItem('nato_phonetic_state', 'corrupted{data}');
    });
    
    // App should handle corrupted data
    await page.goto('/');
    await page.goto('/profile');
    
    // Should show default state, not crash
    await expect(page.locator('text=Your Profile')).toBeVisible();
  });

  test('should recover from speech synthesis errors', async ({ page }) => {
    await page.goto('/learn');
    
    // Mock speech synthesis to throw error
    await page.evaluate(() => {
      window.speechSynthesis.speak = () => {
        throw new Error('Speech synthesis error');
      };
    });
    
    // Try to use speech
    await page.click('text=Flashcards');
    await page.click('button:has-text("Play Sound")');
    
    // Should not crash, just fail silently
    await expect(page.locator('.flashcard')).toBeVisible();
  });
});