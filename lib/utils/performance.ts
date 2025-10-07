/**
 * Performance monitoring utilities for production optimization
 */

// Performance metrics tracking
export const performanceMetrics = {
  // Track component render times
  measureRender: (componentName: string, callback: () => void) => {
    if (typeof window === 'undefined' || process.env.NODE_ENV !== 'development') {
      callback();
      return;
    }

    const startTime = performance.now();
    callback();
    const endTime = performance.now();
    const duration = endTime - startTime;

    if (duration > 16) { // Longer than one frame (60fps)
      console.warn(`[Performance] ${componentName} render took ${duration.toFixed(2)}ms`);
    }
  },

  // Track API call performance
  measureAPI: async <T,>(apiName: string, apiCall: () => Promise<T>): Promise<T> => {
    if (typeof window === 'undefined' || process.env.NODE_ENV !== 'development') {
      return apiCall();
    }

    const startTime = performance.now();
    try {
      const result = await apiCall();
      const endTime = performance.now();
      const duration = endTime - startTime;

      if (duration > 1000) { // Longer than 1 second
        console.warn(`[Performance] API ${apiName} took ${duration.toFixed(2)}ms`);
      }

      return result;
    } catch (error) {
      const endTime = performance.now();
      const duration = endTime - startTime;
      console.error(`[Performance] API ${apiName} failed after ${duration.toFixed(2)}ms`, error);
      throw error;
    }
  },

  // Get Web Vitals
  getWebVitals: () => {
    if (typeof window === 'undefined') return null;

    return {
      // First Contentful Paint
      FCP: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0,
      
      // Largest Contentful Paint
      LCP: performance.getEntriesByType('largest-contentful-paint')[0]?.startTime || 0,
      
      // Cumulative Layout Shift
      CLS: performance.getEntriesByType('layout-shift').reduce((sum, entry: any) => {
        if (!entry.hadRecentInput) {
          return sum + entry.value;
        }
        return sum;
      }, 0),
    };
  },
};

// Debounce utility for performance optimization
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

// Throttle utility for performance optimization
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

// Lazy load images with Intersection Observer
export const lazyLoadImage = (
  imgElement: HTMLImageElement,
  src: string,
  options?: IntersectionObserverInit
) => {
  if (typeof window === 'undefined') return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        img.src = src;
        img.classList.add('loaded');
        observer.unobserve(img);
      }
    });
  }, options || { rootMargin: '50px' });

  observer.observe(imgElement);

  return () => observer.disconnect();
};

// Prefetch resources
export const prefetchResource = (url: string, type: 'script' | 'style' | 'image' = 'script') => {
  if (typeof window === 'undefined') return;

  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.as = type;
  link.href = url;
  document.head.appendChild(link);
};

// Check if user prefers reduced motion
export const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// Optimize animations based on user preference
export const getAnimationDuration = (defaultDuration: number): number => {
  return prefersReducedMotion() ? 0 : defaultDuration;
};

// Memory usage monitoring (development only)
export const monitorMemory = () => {
  if (typeof window === 'undefined' || process.env.NODE_ENV !== 'development') return;

  if ('memory' in performance) {
    const memory = (performance as any).memory;
    console.log('[Performance] Memory Usage:', {
      usedJSHeapSize: `${(memory.usedJSHeapSize / 1048576).toFixed(2)} MB`,
      totalJSHeapSize: `${(memory.totalJSHeapSize / 1048576).toFixed(2)} MB`,
      jsHeapSizeLimit: `${(memory.jsHeapSizeLimit / 1048576).toFixed(2)} MB`,
    });
  }
};

// Bundle size analyzer helper
export const logBundleSize = (componentName: string) => {
  if (typeof window === 'undefined' || process.env.NODE_ENV !== 'development') return;

  const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
  const jsResources = resources.filter(r => r.name.endsWith('.js'));
  
  const totalSize = jsResources.reduce((sum, r) => sum + (r.transferSize || 0), 0);
  
  console.log(`[Performance] ${componentName} - Total JS: ${(totalSize / 1024).toFixed(2)} KB`);
};

// Request Idle Callback wrapper with fallback
export const requestIdleCallback = (callback: () => void, options?: { timeout?: number }) => {
  if (typeof window === 'undefined') return;

  if ('requestIdleCallback' in window) {
    return window.requestIdleCallback(callback, options);
  } else {
    // Fallback for browsers that don't support requestIdleCallback
    return setTimeout(callback, 1);
  }
};

// Cancel Idle Callback wrapper
export const cancelIdleCallback = (id: number) => {
  if (typeof window === 'undefined') return;

  if ('cancelIdleCallback' in window) {
    window.cancelIdleCallback(id);
  } else {
    clearTimeout(id);
  }
};

// Optimize scroll performance
export const optimizeScroll = (callback: () => void) => {
  if (typeof window === 'undefined') return () => {};

  let ticking = false;

  const handleScroll = () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        callback();
        ticking = false;
      });
      ticking = true;
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });

  return () => window.removeEventListener('scroll', handleScroll);
};

// Check if device is low-end
export const isLowEndDevice = (): boolean => {
  if (typeof window === 'undefined') return false;

  // Check for hardware concurrency (CPU cores)
  const cores = navigator.hardwareConcurrency || 1;
  
  // Check for device memory (if available)
  const memory = (navigator as any).deviceMemory || 4;

  // Consider low-end if less than 2 cores or less than 2GB RAM
  return cores < 2 || memory < 2;
};

// Adaptive loading based on device capabilities
export const shouldLoadHeavyFeature = (): boolean => {
  if (typeof window === 'undefined') return true;

  // Don't load heavy features on low-end devices
  if (isLowEndDevice()) return false;

  // Check connection speed
  const connection = (navigator as any).connection;
  if (connection) {
    const effectiveType = connection.effectiveType;
    // Don't load on slow connections (2g, slow-2g)
    if (effectiveType === '2g' || effectiveType === 'slow-2g') return false;
  }

  return true;
};

// Performance observer for monitoring
export const observePerformance = (callback: (entries: PerformanceEntry[]) => void) => {
  if (typeof window === 'undefined') return () => {};

  const observer = new PerformanceObserver((list) => {
    callback(list.getEntries());
  });

  observer.observe({ entryTypes: ['measure', 'navigation', 'resource', 'paint'] });

  return () => observer.disconnect();
};

