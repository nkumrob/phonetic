/**
 * Test template for React hooks
 * Copy this file and replace:
 * - useHookName with your hook name
 * - Update test cases for your hook's behavior
 */

import { renderHook, act } from '@testing-library/react';
import { useHookName } from '@/lib/hooks/use-hook-name';

// Mock dependencies if needed
jest.mock('@/lib/some-dependency', () => ({
  someFunction: jest.fn(),
}));

describe('useHookName', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('Initial State', () => {
    it('should return default values on mount', () => {
      const { result } = renderHook(() => useHookName());
      
      expect(result.current.value).toBe('default');
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should accept initial configuration', () => {
      const { result } = renderHook(() => 
        useHookName({ initialValue: 'custom' })
      );
      
      expect(result.current.value).toBe('custom');
    });
  });

  describe('State Updates', () => {
    it('should update value when setValue is called', () => {
      const { result } = renderHook(() => useHookName());
      
      act(() => {
        result.current.setValue('new value');
      });
      
      expect(result.current.value).toBe('new value');
    });

    it('should handle multiple rapid updates correctly', () => {
      const { result } = renderHook(() => useHookName());
      
      act(() => {
        result.current.increment();
        result.current.increment();
        result.current.increment();
      });
      
      expect(result.current.count).toBe(3);
    });
  });

  describe('Side Effects', () => {
    it('should save to localStorage when value changes', () => {
      const { result } = renderHook(() => useHookName());
      
      act(() => {
        result.current.setValue('test');
      });
      
      expect(localStorage.getItem('hookValue')).toBe('"test"');
    });

    it('should load from localStorage on mount', () => {
      localStorage.setItem('hookValue', '"stored"');
      
      const { result } = renderHook(() => useHookName());
      
      expect(result.current.value).toBe('stored');
    });
  });

  describe('Async Operations', () => {
    it('should handle async operations correctly', async () => {
      const { result } = renderHook(() => useHookName());
      
      expect(result.current.isLoading).toBe(false);
      
      act(() => {
        result.current.fetchData();
      });
      
      expect(result.current.isLoading).toBe(true);
      
      // Wait for async operation
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });
      
      expect(result.current.isLoading).toBe(false);
      expect(result.current.data).toEqual({ /* expected data */ });
    });

    it('should handle errors in async operations', async () => {
      const mockError = new Error('Fetch failed');
      jest.spyOn(global, 'fetch').mockRejectedValueOnce(mockError);
      
      const { result } = renderHook(() => useHookName());
      
      await act(async () => {
        await result.current.fetchData();
      });
      
      expect(result.current.error).toBe('Fetch failed');
      expect(result.current.data).toBeNull();
    });
  });

  describe('Cleanup', () => {
    it('should cleanup subscriptions on unmount', () => {
      const mockUnsubscribe = jest.fn();
      const mockSubscribe = jest.fn(() => mockUnsubscribe);
      
      const { unmount } = renderHook(() => 
        useHookName({ subscribe: mockSubscribe })
      );
      
      expect(mockSubscribe).toHaveBeenCalled();
      
      unmount();
      
      expect(mockUnsubscribe).toHaveBeenCalled();
    });

    it('should cancel pending requests on unmount', () => {
      const { result, unmount } = renderHook(() => useHookName());
      
      act(() => {
        result.current.startLongOperation();
      });
      
      unmount();
      
      // Verify operation was cancelled
      expect(result.current.isOperationCancelled).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle null/undefined inputs gracefully', () => {
      const { result } = renderHook(() => useHookName());
      
      act(() => {
        result.current.setValue(null);
      });
      
      expect(result.current.value).toBe('');
      expect(() => result.current.process()).not.toThrow();
    });

    it('should debounce rapid calls', async () => {
      jest.useFakeTimers();
      const mockCallback = jest.fn();
      
      const { result } = renderHook(() => 
        useHookName({ onChange: mockCallback })
      );
      
      // Rapid updates
      act(() => {
        result.current.setValue('a');
        result.current.setValue('ab');
        result.current.setValue('abc');
      });
      
      expect(mockCallback).not.toHaveBeenCalled();
      
      act(() => {
        jest.advanceTimersByTime(500);
      });
      
      expect(mockCallback).toHaveBeenCalledTimes(1);
      expect(mockCallback).toHaveBeenCalledWith('abc');
      
      jest.useRealTimers();
    });
  });

  describe('Performance', () => {
    it('should memoize expensive calculations', () => {
      const expensiveCalculation = jest.fn(x => x * 2);
      
      const { result, rerender } = renderHook(
        ({ value }) => useHookName({ value, calculate: expensiveCalculation }),
        { initialProps: { value: 5 } }
      );
      
      expect(expensiveCalculation).toHaveBeenCalledTimes(1);
      expect(result.current.calculated).toBe(10);
      
      // Rerender with same value
      rerender({ value: 5 });
      
      expect(expensiveCalculation).toHaveBeenCalledTimes(1);
      expect(result.current.calculated).toBe(10);
      
      // Rerender with different value
      rerender({ value: 6 });
      
      expect(expensiveCalculation).toHaveBeenCalledTimes(2);
      expect(result.current.calculated).toBe(12);
    });
  });
});