/**
 * Simplified Streak System Types
 * 
 * We maintain only 3 essential streak types:
 * 1. Quiz Streak - Current streak within active quiz (temporary)
 * 2. Best Streak - Highest streak ever achieved (permanent)
 * 3. Daily Streak - Consecutive days of practice (permanent)
 */

export interface StreakSystem {
  // Active quiz streak (resets each quiz)
  quizStreak: number;
  
  // Best streak ever achieved
  bestStreak: number;
  
  // Consecutive days of practice
  dailyStreak: number;
  lastPracticeDate: string;
}

export interface StreakUpdate {
  type: 'quiz' | 'best' | 'daily';
  value: number;
}

// Streak milestones for celebrations
export const STREAK_MILESTONES = {
  quiz: [5, 10, 20, 50],
  daily: [3, 7, 14, 30, 100]
} as const;

// Streak display configuration
export const STREAK_DISPLAY = {
  quiz: {
    icon: '🔥',
    name: 'Answer Streak',
    description: 'Consecutive correct answers'
  },
  best: {
    icon: '🏆',
    name: 'Best Streak',
    description: 'Your highest streak ever'
  },
  daily: {
    icon: '📅',
    name: 'Daily Streak',
    description: 'Days in a row'
  }
} as const;