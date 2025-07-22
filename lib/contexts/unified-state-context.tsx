'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useUnifiedState } from '@/lib/hooks/use-unified-state';
import { UnifiedGameState } from '@/lib/state/types';
import { LevelInfo, UnlockInfo } from '@/lib/core/level-system';

interface UnifiedStateContextType {
  // State
  state: UnifiedGameState;
  levelInfo: LevelInfo;
  unlockInfo: UnlockInfo;
  
  // Actions
  updateXP: (xpChange: number) => void;
  addQuizResult: (result: UnifiedGameState['quizHistory'][0]) => void;
  updatePreferences: (updates: Partial<UnifiedGameState['preferences']>) => void;
  updateDailyGoal: (goalId: string, progress: number) => void;
  resetState: () => void;
  addAchievement: (achievementId: string) => void;
  updateFlashcardProgress: (letter: string, timesReviewed: number) => void;
  
  // Computed values
  isNewUser: boolean;
  hasProgress: boolean;
}

const UnifiedStateContext = createContext<UnifiedStateContextType | undefined>(undefined);

export function UnifiedStateProvider({ children }: { children: ReactNode }) {
  const stateHook = useUnifiedState();
  
  return (
    <UnifiedStateContext.Provider value={stateHook}>
      {children}
    </UnifiedStateContext.Provider>
  );
}

export function useUnifiedStateContext() {
  const context = useContext(UnifiedStateContext);
  if (!context) {
    throw new Error('useUnifiedStateContext must be used within UnifiedStateProvider');
  }
  return context;
}

// Migration helper - maps old session context to unified state
export function useSessionCompat() {
  const { state, levelInfo, updateXP, addQuizResult, updateFlashcardProgress, resetState } = useUnifiedStateContext();
  
  // Map unified state to old session format for compatibility
  const session = {
    userProgress: {
      totalQuizzesTaken: state.stats.totalQuizzesTaken,
      totalCorrectAnswers: state.stats.totalCorrectAnswers,
      totalIncorrectAnswers: state.stats.totalIncorrectAnswers,
      bestStreak: state.stats.globalBestStreak,
      currentStreak: 0, // Deprecated
      level: levelInfo.level,
      experience: state.progress.totalXP,
      achievements: state.progress.achievements,
      unlockedModes: state.progress.unlockedModes,
      lastPlayed: state.stats.lastPlayedDate,
      consecutiveDays: state.stats.dailyPracticeStreak,
    },
    quizHistory: state.quizHistory,
    flashcardProgress: state.learning.flashcardProgress,
    conversionHistory: [], // Not migrated yet
  };
  
  const updateProgress = (updates: any) => {
    if ('experience' in updates) {
      const xpDiff = updates.experience - state.progress.totalXP;
      updateXP(xpDiff);
    }
    // Other updates can be added as needed
  };
  
  const getAchievementProgress = () => {
    const progress = state.stats;
    const achievements = state.progress.achievements;
    
    return {
      firstQuiz: progress.totalQuizzesTaken >= 1 ? 100 : 0,
      tenQuizzes: Math.min((progress.totalQuizzesTaken / 10) * 100, 100),
      hundredQuizzes: Math.min((progress.totalQuizzesTaken / 100) * 100, 100),
      perfectScore: state.quizHistory.some(q => q.correct === 10 && q.incorrect === 0) ? 100 : 0,
      streakMaster: progress.globalBestStreak >= 20 ? 100 : (progress.globalBestStreak / 20) * 100,
      speedDemon: state.quizHistory.some(q => q.averageTime && q.averageTime < 3) ? 100 : 0,
      alphabetMaster: Object.keys(state.learning.flashcardProgress).filter(k => state.learning.flashcardProgress[k] >= 3).length === 26 ? 100 : 
        (Object.keys(state.learning.flashcardProgress).filter(k => state.learning.flashcardProgress[k] >= 3).length / 26) * 100,
      dailyPlayer: progress.dailyPracticeStreak >= 7 ? 100 : (progress.dailyPracticeStreak / 7) * 100,
      levelTen: levelInfo.level >= 10 ? 100 : (levelInfo.level / 10) * 100,
    };
  };
  
  return {
    session,
    updateProgress,
    addQuizResult,
    updateFlashcardProgress,
    resetSession: resetState,
    getAchievementProgress,
    isSaving: false, // Always false since saves are automatic
  };
}