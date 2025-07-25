import { test, expect } from '@playwright/test';

test.describe('Memory Leak Prevention', () => {
  test('should cleanup event listeners on navigation', async ({ page }) => {
    // Enable Chrome DevTools Protocol for memory profiling
    const client = await page.context().newCDPSession(page);
    await client.send('Performance.enable');
    
    // Get initial memory
    const getMemoryUsage = async () => {
      const metrics = await client.send('Performance.getMetrics');
      const jsHeapUsed = metrics.metrics.find(m => m.name === 'JSHeapUsedSize');
      return jsHeapUsed?.value || 0;
    };
    
    const initialMemory = await getMemoryUsage();
    
    // Navigate between pages multiple times
    for (let i = 0; i < 10; i++) {
      await page.goto('/');
      await page.goto('/learn');
      await page.goto('/practice');
      await page.goto('/tools');
    }
    
    // Force garbage collection if available
    await page.evaluate(() => {
      if ((window as any).gc) {
        (window as any).gc();
      }
    });
    
    await page.waitForTimeout(1000);
    
    const finalMemory = await getMemoryUsage();
    const memoryIncrease = finalMemory - initialMemory;
    const percentIncrease = (memoryIncrease / initialMemory) * 100;
    
    // Memory increase should be less than 20%
    expect(percentIncrease).toBeLessThan(20);
  });

  test('should cleanup timers in flashcards', async ({ page }) => {
    await page.goto('/learn');
    
    // Start monitoring timer count
    await page.evaluate(() => {
      (window as any).__activeTimers = new Set();
      const originalSetTimeout = window.setTimeout;
      const originalClearTimeout = window.clearTimeout;
      
      window.setTimeout = function(...args: Parameters<typeof setTimeout>) {
        const id = originalSetTimeout.apply(window, args);
        (window as any).__activeTimers.add(id);
        return id;
      } as typeof setTimeout;
      
      window.clearTimeout = function(id) {
        (window as any).__activeTimers.delete(id);
        return originalClearTimeout.apply(window, [id]);
      };
    });
    
    // Use flashcards
    await page.click('text=Flashcards');
    await page.click('.flashcard'); // Flip
    await page.click('text=Next');
    await page.click('.flashcard'); // Flip again
    
    // Navigate away
    await page.goto('/');
    
    // Check that timers were cleaned up
    const activeTimers = await page.evaluate(() => (window as any).__activeTimers.size);
    expect(activeTimers).toBe(0);
  });

  test('should cleanup speech synthesis on unmount', async ({ page }) => {
    await page.goto('/learn');
    
    // Monitor speech synthesis
    await page.evaluate(() => {
      (window as any).__speechActive = false;
      const originalSpeak = window.speechSynthesis.speak;
      
      window.speechSynthesis.speak = function(utterance) {
        (window as any).__speechActive = true;
        utterance.onend = () => {
          (window as any).__speechActive = false;
        };
        return originalSpeak.call(window.speechSynthesis, utterance);
      };
    });
    
    // Trigger speech
    await page.click('text=Flashcards');
    await page.click('button:has-text("Play Sound")');
    
    // Navigate away immediately
    await page.goto('/');
    
    // Speech should be cancelled
    const speechActive = await page.evaluate(() => (window as any).__speechActive);
    expect(speechActive).toBe(false);
  });

  test('should not accumulate DOM nodes', async ({ page }) => {
    await page.goto('/practice');
    
    const getNodeCount = () => page.evaluate(() => document.querySelectorAll('*').length);
    
    const initialNodes = await getNodeCount();
    
    // Complete multiple quizzes
    for (let i = 0; i < 5; i++) {
      await page.click('text=Practice');
      
      // Answer 10 questions
      for (let j = 0; j < 10; j++) {
        await page.click('.quiz-option >> nth=0');
        await page.waitForTimeout(100);
      }
      
      await page.click('text=Try Again');
    }
    
    const finalNodes = await getNodeCount();
    const nodeIncrease = finalNodes - initialNodes;
    
    // Should not accumulate nodes (allow small variance)
    expect(nodeIncrease).toBeLessThan(100);
  });
});