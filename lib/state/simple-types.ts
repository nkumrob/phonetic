/**
 * Simple App State Types
 * Non-gamified state management for NATO Phonetic Alphabet learning
 */

export interface QuizRecord {
  id: string;
  date: string;
  mode: 'learn' | 'practice' | 'challenge';
  totalQuestions: number;
  correctAnswers: number;
  duration: number; // in seconds
  passed: boolean;
}

export interface LetterStats {
  attempts: number;
  correct: number;
  lastPracticed?: string;
}

export interface SimpleAppState {
  version: number;
  
  user: {
    name: string;
    avatar: string; // emoji character
    createdAt: string;
  };
  
  preferences: {
    theme: 'light' | 'dark' | 'system';
    soundEnabled: boolean;
    soundVolume: number;
  };
  
  progress: {
    quizHistory: QuizRecord[];
    letterStats: Record<string, LetterStats>; // letter -> stats
    flashcardReviews: Record<string, number>; // letter -> review count
    totalQuizzesTaken: number;
    totalCorrectAnswers: number;
    totalIncorrectAnswers: number;
    lastPlayedDate: string;
  };
}

// Default state factory
export function createDefaultSimpleState(): SimpleAppState {
  return {
    version: 1,
    
    user: {
      name: '',
      avatar: '✈️',
      createdAt: new Date().toISOString(),
    },
    
    preferences: {
      theme: 'system',
      soundEnabled: true,
      soundVolume: 0.5,
    },
    
    progress: {
      quizHistory: [],
      letterStats: {},
      flashcardReviews: {},
      totalQuizzesTaken: 0,
      totalCorrectAnswers: 0,
      totalIncorrectAnswers: 0,
      lastPlayedDate: new Date().toISOString(),
    },
  };
}

// Helper to calculate overall accuracy
export function calculateOverallAccuracy(state: SimpleAppState): number {
  const total = state.progress.totalCorrectAnswers + state.progress.totalIncorrectAnswers;
  if (total === 0) return 0;
  return Math.round((state.progress.totalCorrectAnswers / total) * 100);
}

// Helper to get recent quiz performance
export function getRecentQuizStats(state: SimpleAppState, count: number = 5) {
  const recent = state.progress.quizHistory.slice(-count);
  if (recent.length === 0) return { averageAccuracy: 0, passRate: 0 };
  
  const totalCorrect = recent.reduce((sum, quiz) => sum + quiz.correctAnswers, 0);
  const totalQuestions = recent.reduce((sum, quiz) => sum + quiz.totalQuestions, 0);
  const passed = recent.filter(q => q.passed).length;
  
  return {
    averageAccuracy: totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0,
    passRate: Math.round((passed / recent.length) * 100),
  };
}