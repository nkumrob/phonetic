import { test, expect } from '@playwright/test';

test.describe('Bundle Size and Performance', () => {
  test('should have optimized JavaScript bundle size', async ({ page }) => {
    const resources: any[] = [];
    
    page.on('response', response => {
      const url = response.url();
      if (url.includes('.js') && !url.includes('hot-update')) {
        resources.push({
          url,
          size: parseInt(response.headers()['content-length'] || '0'),
          compressed: response.headers()['content-encoding'] === 'gzip'
        });
      }
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const totalSize = resources.reduce((sum, r) => sum + r.size, 0);
    const jsFiles = resources.filter(r => r.url.endsWith('.js'));
    
    // Check total JS size (should be under 500KB compressed)
    expect(totalSize).toBeLessThan(500 * 1024);
    
    // Check individual chunks (none should be over 200KB)
    jsFiles.forEach(file => {
      expect(file.size).toBeLessThan(200 * 1024);
    });
    
    // Ensure compression is enabled
    const compressedFiles = resources.filter(r => r.compressed);
    expect(compressedFiles.length).toBeGreaterThan(0);
  });

  test('should lazy load non-critical components', async ({ page }) => {
    const loadedChunks = new Set<string>();
    
    page.on('response', response => {
      const url = response.url();
      if (url.includes('.js') && url.includes('chunk')) {
        loadedChunks.add(url);
      }
    });
    
    // Load home page
    await page.goto('/');
    const initialChunks = loadedChunks.size;
    
    // Navigate to practice - should load additional chunks
    await page.goto('/practice');
    await page.waitForLoadState('networkidle');
    
    const practiceChunks = loadedChunks.size;
    expect(practiceChunks).toBeGreaterThan(initialChunks);
    
    // PDF functionality should be lazy loaded
    await page.goto('/tools');
    await page.click('text=Download PDF');
    
    const finalChunks = loadedChunks.size;
    expect(finalChunks).toBeGreaterThan(practiceChunks);
  });

  test('should optimize font loading', async ({ page }) => {
    const fontLoadTiming = await page.evaluate(async () => {
      performance.mark('font-load-start');
      await document.fonts.ready;
      performance.mark('font-load-end');
      
      const measure = performance.measure('font-load', 'font-load-start', 'font-load-end');
      return measure.duration;
    });
    
    // Fonts should load quickly (under 500ms)
    expect(fontLoadTiming).toBeLessThan(500);
    
    // Check font-display property
    const fontDisplay = await page.evaluate(() => {
      const styles = Array.from(document.styleSheets);
      for (const sheet of styles) {
        try {
          const rules = Array.from(sheet.cssRules);
          const fontFace = rules.find(rule => rule instanceof CSSFontFaceRule);
          if (fontFace) {
            return (fontFace as any).style.fontDisplay;
          }
        } catch (e) {
          // Cross-origin stylesheets
        }
      }
      return null;
    });
    
    expect(fontDisplay).toBe('swap');
  });

  test('should meet Core Web Vitals targets', async ({ page }) => {
    await page.goto('/');
    
    // Wait for page to be interactive
    await page.waitForLoadState('networkidle');
    
    const metrics = await page.evaluate(() => {
      return new Promise<any>((resolve) => {
        let lcp = 0;
        let fid = 0;
        let cls = 0;
        
        // Observe LCP
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          lcp = lastEntry.startTime;
        }).observe({ entryTypes: ['largest-contentful-paint'] });
        
        // Observe FID
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          if (entries.length > 0) {
            fid = entries[0].processingStart - entries[0].startTime;
          }
        }).observe({ entryTypes: ['first-input'] });
        
        // Observe CLS
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              cls += entry.value;
            }
          });
        }).observe({ entryTypes: ['layout-shift'] });
        
        // Collect metrics after some time
        setTimeout(() => {
          resolve({ lcp, fid, cls });
        }, 5000);
      });
    });
    
    // Good thresholds
    expect(metrics.lcp).toBeLessThan(2500); // 2.5s
    expect(metrics.cls).toBeLessThan(0.1);  // 0.1
    
    // Note: FID requires real user interaction
    if (metrics.fid > 0) {
      expect(metrics.fid).toBeLessThan(100); // 100ms
    }
  });

  test('should optimize images', async ({ page }) => {
    const images: any[] = [];
    
    page.on('response', response => {
      const url = response.url();
      if (url.match(/\.(jpg|jpeg|png|webp|svg)$/i)) {
        images.push({
          url,
          size: parseInt(response.headers()['content-length'] || '0'),
          type: response.headers()['content-type']
        });
      }
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check image optimization
    images.forEach(img => {
      // Images should be reasonably sized
      expect(img.size).toBeLessThan(500 * 1024); // 500KB max per image
      
      // Prefer modern formats
      if (img.url.includes('logo') || img.url.includes('icon')) {
        expect(img.type).toMatch(/svg|webp/);
      }
    });
  });
});