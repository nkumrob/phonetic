/**
 * Test template for integration tests
 * Copy this file and replace:
 * - FeatureName with your feature name
 * - Update the user journey and test cases
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from '@/app/layout';
import '@testing-library/jest-dom';

// Mock external services
jest.mock('@/lib/api', () => ({
  fetchData: jest.fn(),
  saveData: jest.fn(),
}));

describe('FeatureName Integration', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
    jest.clearAllMocks();
    localStorage.clear();
    
    // Setup common mocks
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Complete User Journey', () => {
    it('should allow user to complete full feature workflow', async () => {
      // Step 1: User navigates to feature
      render(<App />);
      
      const navLink = screen.getByRole('link', { name: /feature/i });
      await user.click(navLink);
      
      // Verify navigation
      expect(screen.getByRole('heading', { name: /feature page/i })).toBeInTheDocument();
      
      // Step 2: User interacts with form
      const nameInput = screen.getByLabelText(/name/i);
      await user.type(nameInput, 'Test User');
      
      const emailInput = screen.getByLabelText(/email/i);
      await user.type(emailInput, 'test@example.com');
      
      // Step 3: User submits form
      const submitButton = screen.getByRole('button', { name: /submit/i });
      await user.click(submitButton);
      
      // Verify loading state
      expect(screen.getByText(/processing/i)).toBeInTheDocument();
      
      // Step 4: Wait for success
      await waitFor(() => {
        expect(screen.getByText(/success/i)).toBeInTheDocument();
      });
      
      // Step 5: Verify data persistence
      expect(localStorage.getItem('userData')).toContain('Test User');
      
      // Step 6: Verify navigation to next step
      expect(screen.getByRole('heading', { name: /dashboard/i })).toBeInTheDocument();
    });

    it('should handle errors gracefully throughout the journey', async () => {
      // Mock API failure
      global.fetch = jest.fn().mockRejectedValueOnce(new Error('Network error'));
      
      render(<App />);
      
      // Navigate and fill form
      await user.click(screen.getByRole('link', { name: /feature/i }));
      await user.type(screen.getByLabelText(/name/i), 'Test User');
      await user.click(screen.getByRole('button', { name: /submit/i }));
      
      // Verify error handling
      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent(/error occurred/i);
      });
      
      // Verify user can retry
      const retryButton = screen.getByRole('button', { name: /try again/i });
      expect(retryButton).toBeInTheDocument();
      
      // Mock successful retry
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });
      
      await user.click(retryButton);
      
      await waitFor(() => {
        expect(screen.getByText(/success/i)).toBeInTheDocument();
      });
    });
  });

  describe('Cross-Component Interactions', () => {
    it('should update multiple components when state changes', async () => {
      render(<App />);
      
      // Initial state
      const header = screen.getByRole('banner');
      const sidebar = screen.getByRole('complementary');
      
      expect(within(header).getByText(/0 points/i)).toBeInTheDocument();
      expect(within(sidebar).getByText(/level 1/i)).toBeInTheDocument();
      
      // Perform action that updates global state
      await user.click(screen.getByRole('button', { name: /complete task/i }));
      
      // Verify updates across components
      await waitFor(() => {
        expect(within(header).getByText(/10 points/i)).toBeInTheDocument();
        expect(within(sidebar).getByText(/level 1/i)).toBeInTheDocument();
      });
    });

    it('should maintain state consistency across page navigation', async () => {
      render(<App />);
      
      // Set some state
      await user.type(screen.getByLabelText(/username/i), 'TestUser');
      await user.click(screen.getByRole('button', { name: /save/i }));
      
      // Navigate away
      await user.click(screen.getByRole('link', { name: /other page/i }));
      
      // Navigate back
      await user.click(screen.getByRole('link', { name: /home/i }));
      
      // Verify state persisted
      expect(screen.getByLabelText(/username/i)).toHaveValue('TestUser');
    });
  });

  describe('Real-World Scenarios', () => {
    it('should handle concurrent operations correctly', async () => {
      render(<App />);
      
      // Start multiple async operations
      const button1 = screen.getByRole('button', { name: /action 1/i });
      const button2 = screen.getByRole('button', { name: /action 2/i });
      
      await user.click(button1);
      await user.click(button2);
      
      // Both should show loading
      expect(screen.getAllByText(/loading/i)).toHaveLength(2);
      
      // Wait for both to complete
      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      });
      
      // Verify both completed successfully
      expect(screen.getByText(/action 1 complete/i)).toBeInTheDocument();
      expect(screen.getByText(/action 2 complete/i)).toBeInTheDocument();
    });

    it('should handle rapid user interactions', async () => {
      render(<App />);
      
      const incrementButton = screen.getByRole('button', { name: /increment/i });
      
      // Rapid clicks
      for (let i = 0; i < 10; i++) {
        await user.click(incrementButton);
      }
      
      // Should handle all clicks
      await waitFor(() => {
        expect(screen.getByText(/count: 10/i)).toBeInTheDocument();
      });
    });

    it('should recover from temporary failures', async () => {
      let callCount = 0;
      global.fetch = jest.fn().mockImplementation(() => {
        callCount++;
        if (callCount < 3) {
          return Promise.reject(new Error('Temporary failure'));
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ data: 'success' }),
        });
      });
      
      render(<App />);
      
      await user.click(screen.getByRole('button', { name: /fetch data/i }));
      
      // Should retry and eventually succeed
      await waitFor(() => {
        expect(screen.getByText(/success/i)).toBeInTheDocument();
      }, { timeout: 5000 });
      
      expect(callCount).toBe(3);
    });
  });

  describe('Performance and Edge Cases', () => {
    it('should handle large data sets efficiently', async () => {
      const largeDataSet = Array.from({ length: 1000 }, (_, i) => ({
        id: i,
        name: `Item ${i}`,
        value: Math.random(),
      }));
      
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({ items: largeDataSet }),
      });
      
      render(<App />);
      
      await user.click(screen.getByRole('button', { name: /load data/i }));
      
      await waitFor(() => {
        expect(screen.getByText(/1000 items loaded/i)).toBeInTheDocument();
      });
      
      // Verify virtualization or pagination
      const visibleItems = screen.getAllByRole('listitem');
      expect(visibleItems.length).toBeLessThan(100); // Should not render all items
    });

    it('should handle browser back/forward navigation', async () => {
      const { rerender } = render(<App />);
      
      // Navigate through pages
      await user.click(screen.getByRole('link', { name: /page 1/i }));
      await user.click(screen.getByRole('link', { name: /page 2/i }));
      
      // Simulate browser back
      window.history.back();
      rerender(<App />);
      
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /page 1/i })).toBeInTheDocument();
      });
      
      // Simulate browser forward
      window.history.forward();
      rerender(<App />);
      
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /page 2/i })).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility Integration', () => {
    it('should maintain focus management through user journey', async () => {
      render(<App />);
      
      // Tab through interactive elements
      await user.tab();
      expect(screen.getByRole('link', { name: /home/i })).toHaveFocus();
      
      await user.tab();
      expect(screen.getByRole('button', { name: /menu/i })).toHaveFocus();
      
      // Open modal
      await user.keyboard('{Enter}');
      
      // Focus should move to modal
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /close/i })).toHaveFocus();
      });
      
      // Close modal
      await user.keyboard('{Escape}');
      
      // Focus should return to trigger
      expect(screen.getByRole('button', { name: /menu/i })).toHaveFocus();
    });
  });
});