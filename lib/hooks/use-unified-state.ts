/**
 * React hook for unified state management
 */

import { useEffect, useState, useCallback } from 'react';
import { UnifiedGameState } from '@/lib/state/types';
import { unifiedStateManager } from '@/lib/state/unified-state-manager';
import { LevelSystem } from '@/lib/core/level-system';

export function useUnifiedState() {
  const [state, setState] = useState<UnifiedGameState>(() => 
    unifiedStateManager.getState()
  );
  
  useEffect(() => {
    // Subscribe to state changes
    const unsubscribe = unifiedStateManager.subscribe(setState);
    
    // Update daily streak on mount
    unifiedStateManager.updateDailyStreak();
    
    return unsubscribe;
  }, []);
  
  // Computed values - use confirmed level from state
  const levelInfo = LevelSystem.getLevelInfo(state.progress.currentLevel, state.progress.totalXP);
  const unlockInfo = LevelSystem.getUnlockInfo(state.progress.currentLevel);
  
  // Helper functions
  const updateXP = useCallback((xpChange: number) => {
    unifiedStateManager.updateXP(xpChange);
  }, []);
  
  const addQuizResult = useCallback((result: UnifiedGameState['quizHistory'][0]) => {
    unifiedStateManager.addQuizResult(result);
  }, []);
  
  const updatePreferences = useCallback(
    (updates: Partial<UnifiedGameState['preferences']>) => {
      unifiedStateManager.update('preferences', (prefs) => ({
        ...prefs,
        ...updates,
      }));
    },
    []
  );
  
  const updateDailyGoal = useCallback(
    (goalId: string, progress: number) => {
      unifiedStateManager.update('dailyGoals', (goals) => {
        const updatedGoals = goals.goals.map(goal => 
          goal.id === goalId 
            ? { ...goal, progress: Math.min(progress, goal.target), completed: progress >= goal.target }
            : goal
        );
        
        return {
          ...goals,
          goals: updatedGoals,
        };
      });
    },
    []
  );
  
  const resetState = useCallback(() => {
    // Preserve user's name from localStorage
    const savedUserName = localStorage.getItem('userName');
    unifiedStateManager.reset(savedUserName || undefined);
  }, []);
  
  const addAchievement = useCallback((achievementId: string) => {
    unifiedStateManager.update('progress', (progress) => {
      if (progress.achievements.includes(achievementId)) {
        return progress;
      }
      
      return {
        ...progress,
        achievements: [...progress.achievements, achievementId],
      };
    });
  }, []);
  
  const updateFlashcardProgress = useCallback(
    (letter: string, timesReviewed: number) => {
      unifiedStateManager.update('learning', (learning) => ({
        ...learning,
        flashcardProgress: {
          ...learning.flashcardProgress,
          [letter]: timesReviewed,
        },
      }));
    },
    []
  );
  
  const subscribeLevelUp = useCallback(
    (callback: (oldLevel: number, newLevel: number) => void) => {
      return unifiedStateManager.subscribeLevelUp(callback);
    },
    []
  );
  
  const confirmLevelUp = useCallback(() => {
    return unifiedStateManager.confirmLevelUp();
  }, []);

  return {
    // State
    state,
    levelInfo,
    unlockInfo,
    
    // Actions
    updateXP,
    addQuizResult,
    updatePreferences,
    updateDailyGoal,
    resetState,
    addAchievement,
    updateFlashcardProgress,
    subscribeLevelUp,
    confirmLevelUp,
    
    // Computed values
    isNewUser: state.progress.totalXP === 0 && !state.user.onboardingCompleted,
    hasProgress: state.progress.totalXP > 0 || state.stats.totalQuizzesTaken > 0,
  };
}