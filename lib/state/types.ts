/**
 * Unified Game State Types
 * Single source of truth for all game state
 */

export interface LetterMemoryState {
  letter: string;
  lastReviewed: string;
  interval: number; // Days until next review
  easeFactor: number; // SM-2 ease factor
  repetitions: number;
  mistakeCount: number;
}

export interface UnifiedGameState {
  version: number; // For migrations
  user: {
    name: string;
    createdAt: string;
    onboardingCompleted: boolean;
  };
  progress: {
    totalXP: number; // Single XP value, level calculated from this
    achievements: string[];
    unlockedModes: string[];
  };
  stats: {
    totalQuizzesTaken: number;
    totalCorrectAnswers: number;
    totalIncorrectAnswers: number;
    bestStreak: number; // Renamed from globalBestStreak for clarity
    dailyStreak: number; // Renamed from dailyPracticeStreak for clarity
    lastPlayedDate: string;
  };
  learning: {
    letterStates: Record<string, LetterMemoryState>;
    nextReviewDue: string | null;
    flashcardProgress: Record<string, number>; // Letter -> times reviewed
  };
  preferences: {
    theme: 'light' | 'dark' | 'system';
    soundEnabled: boolean;
    soundVolume: number;
  };
  dailyGoals: {
    date: string;
    goals: Array<{
      id: string;
      type: 'quiz' | 'practice' | 'streak';
      description: string;
      progress: number;
      target: number;
      xpReward: number;
      completed: boolean;
      icon: string;
    }>;
    lastResetTime: number;
    completedAllBonus: boolean;
    streakDays: number;
  };
  quizHistory: Array<{
    mode: string;
    difficulty: string;
    correct: number;
    incorrect: number;
    score: number;
    streak: number;
    averageTime: number;
    timestamp: string;
  }>;
}

// Default state factory
export function createDefaultState(): UnifiedGameState {
  return {
    version: 2,
    user: {
      name: '',
      createdAt: new Date().toISOString(),
      onboardingCompleted: false,
    },
    progress: {
      totalXP: 0,
      achievements: [],
      unlockedModes: ['easy'],
    },
    stats: {
      totalQuizzesTaken: 0,
      totalCorrectAnswers: 0,
      totalIncorrectAnswers: 0,
      bestStreak: 0,
      dailyStreak: 0,
      lastPlayedDate: new Date().toISOString(),
    },
    learning: {
      letterStates: {},
      nextReviewDue: null,
      flashcardProgress: {},
    },
    preferences: {
      theme: 'system',
      soundEnabled: true,
      soundVolume: 0.5,
    },
    dailyGoals: {
      date: new Date().toISOString().split('T')[0],
      goals: [],
      lastResetTime: Date.now(),
      completedAllBonus: false,
      streakDays: 0,
    },
    quizHistory: [],
  };
}