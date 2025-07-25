/**
 * Common test utilities and custom render functions
 */

import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { SimpleAppProvider } from '@/lib/contexts/simple-app-context';
import userEvent from '@testing-library/user-event';

// Custom render function that includes providers
export const renderWithProviders = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <SimpleAppProvider>{children}</SimpleAppProvider>
  );

  return {
    user: userEvent.setup(),
    ...render(ui, { wrapper: Wrapper, ...options }),
  };
};

// Test data builders
export const buildQuizQuestion = (overrides = {}) => ({
  id: `test-${Math.random()}`,
  type: 'letter-to-code' as const,
  question: 'What is the phonetic code for "A"?',
  options: ['Alpha', 'Bravo', 'Charlie', 'Delta'],
  correctAnswer: 'Alpha',
  points: 10,
  ...overrides,
});

export const buildUserProgress = (overrides = {}) => ({
  totalQuizzesTaken: 0,
  totalCorrectAnswers: 0,
  totalIncorrectAnswers: 0,
  bestStreak: 0,
  currentStreak: 0,
  level: 1,
  experience: 0,
  achievements: [],
  unlockedModes: ['easy'],
  lastPlayed: new Date().toISOString(),
  consecutiveDays: 0,
  ...overrides,
});

export const buildQuizResult = (overrides = {}) => ({
  mode: 'practice',
  difficulty: 'adaptive',
  correct: 0,
  incorrect: 0,
  score: 0,
  streak: 0,
  averageTime: 0,
  timestamp: new Date().toISOString(),
  ...overrides,
});

// Common assertions
export const expectQuizInProgress = () => {
  const questionText = document.querySelector('[class*="Question"]');
  expect(questionText).toBeInTheDocument();
  expect(questionText?.textContent).toMatch(/Question \d+ of \d+/);
};

export const expectQuizCompleted = () => {
  const completedText = document.querySelector('[class*="completed"]');
  expect(completedText).toBeInTheDocument();
};

// Mock timers utility
export const setupMockTimers = () => {
  jest.useFakeTimers();
  
  return {
    advance: (ms: number) => jest.advanceTimersByTime(ms),
    runAll: () => jest.runAllTimers(),
    cleanup: () => jest.useRealTimers(),
  };
};

// Local storage utilities
export const mockLocalStorage = () => {
  const store: Record<string, string> = {};
  
  const mockStorage = {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      Object.keys(store).forEach(key => delete store[key]);
    },
  };

  Object.defineProperty(window, 'localStorage', {
    value: mockStorage,
    writable: true,
  });

  return mockStorage;
};

// Wait utilities
export const waitForLoadingToFinish = async () => {
  const { waitFor } = await import('@testing-library/react');
  
  await waitFor(() => {
    const loadingElements = document.querySelectorAll('[class*="loading"]');
    expect(loadingElements.length).toBe(0);
  });
};

// Debug utilities
export const logTestState = (label: string) => {
  if (process.env.DEBUG_TESTS) {
    console.log(`\n=== ${label} ===`);
    console.log('DOM:', document.body.innerHTML);
    console.log('Local Storage:', { ...localStorage });
    console.log('================\n');
  }
};

// Accessibility testing helpers
export const checkA11y = async (container: HTMLElement) => {
  const { axe, toHaveNoViolations } = await import('jest-axe');
  expect.extend(toHaveNoViolations);
  
  const results = await axe(container);
  expect(results).toHaveNoViolations();
};

// Mock sound effects
export const mockSoundEffects = () => ({
  playCorrect: jest.fn(),
  playIncorrect: jest.fn(),
  playStreak: jest.fn(),
  playLevelUp: jest.fn(),
  playClick: jest.fn(),
  playAchievement: jest.fn(),
});

// Re-export commonly used testing library functions
export * from '@testing-library/react';
export { userEvent };