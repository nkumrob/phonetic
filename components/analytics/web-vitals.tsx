'use client';

import { useEffect } from 'react';
import { useReportWebVitals } from 'next/web-vitals';

/**
 * Web Vitals Reporter Component
 * Tracks and reports Core Web Vitals metrics for performance monitoring
 */
export function WebVitalsReporter() {
  useReportWebVitals((metric) => {
    // Only log in development or send to analytics in production
    if (process.env.NODE_ENV === 'development') {
      console.log('[Web Vitals]', metric);
    }

    // Send to analytics in production
    if (process.env.NODE_ENV === 'production' && typeof window !== 'undefined') {
      // Send to Google Analytics if available
      const gtag = (window as Window & { gtag?: (...args: unknown[]) => void }).gtag;
      if (gtag) {
        gtag('event', metric.name, {
          value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
          event_category: 'Web Vitals',
          event_label: metric.id,
          non_interaction: true,
        });
      }

      // Log warnings for poor metrics
      const thresholds = {
        FCP: 1800,  // First Contentful Paint - Good: < 1.8s
        LCP: 2500,  // Largest Contentful Paint - Good: < 2.5s
        FID: 100,   // First Input Delay - Good: < 100ms
        CLS: 0.1,   // Cumulative Layout Shift - Good: < 0.1
        TTFB: 800,  // Time to First Byte - Good: < 800ms
        INP: 200,   // Interaction to Next Paint - Good: < 200ms
      };

      const threshold = thresholds[metric.name as keyof typeof thresholds];
      if (threshold && metric.value > threshold) {
        console.warn(`[Performance Warning] ${metric.name}: ${metric.value} (threshold: ${threshold})`);
      }
    }
  });

  // Monitor long tasks in development
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development' || typeof window === 'undefined') return;

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.duration > 50) {
          console.warn('[Long Task]', {
            duration: `${entry.duration.toFixed(2)}ms`,
            startTime: `${entry.startTime.toFixed(2)}ms`,
          });
        }
      }
    });

    try {
      observer.observe({ entryTypes: ['longtask'] });
    } catch {
      // longtask not supported in all browsers
    }

    return () => observer.disconnect();
  }, []);

  return null;
}

