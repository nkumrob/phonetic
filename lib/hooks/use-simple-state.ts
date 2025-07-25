/**
 * React hook for simple state management
 */

import { useEffect, useState, useCallback } from 'react';
import { SimpleAppState, QuizRecord } from '@/lib/state/simple-types';
import { simpleStateManager } from '@/lib/state/simple-state-manager';

export function useSimpleState() {
  const [state, setState] = useState<SimpleAppState>(() => 
    simpleStateManager.getState()
  );
  
  useEffect(() => {
    // Subscribe to state changes
    const unsubscribe = simpleStateManager.subscribe(setState);
    return unsubscribe;
  }, []);
  
  // Quiz management
  const addQuizResult = useCallback((result: Omit<QuizRecord, 'id'>) => {
    simpleStateManager.addQuizResult(result);
  }, []);
  
  // Letter stats
  const updateLetterStats = useCallback((letter: string, correct: boolean) => {
    simpleStateManager.updateLetterStats(letter, correct);
  }, []);
  
  // Flashcard reviews
  const updateFlashcardReview = useCallback((letter: string) => {
    simpleStateManager.updateFlashcardReview(letter);
  }, []);
  
  // User profile
  const updateUserProfile = useCallback((updates: Partial<SimpleAppState['user']>) => {
    simpleStateManager.updateUserProfile(updates);
  }, []);
  
  // Preferences
  const updatePreferences = useCallback((updates: Partial<SimpleAppState['preferences']>) => {
    simpleStateManager.updatePreferences(updates);
  }, []);
  
  // Reset
  const resetProgress = useCallback(() => {
    if (confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
      simpleStateManager.reset();
    }
  }, []);
  
  // Computed values
  const overallAccuracy = state.progress.totalQuizzesTaken > 0
    ? Math.round((state.progress.totalCorrectAnswers / 
        (state.progress.totalCorrectAnswers + state.progress.totalIncorrectAnswers)) * 100)
    : 0;
  
  const recentQuizzes = state.progress.quizHistory.slice(-5);
  
  return {
    // State
    state,
    
    // Actions
    addQuizResult,
    updateLetterStats,
    updateFlashcardReview,
    updateUserProfile,
    updatePreferences,
    resetProgress,
    
    // Computed values
    overallAccuracy,
    recentQuizzes,
    isNewUser: state.user.name === '' && state.progress.totalQuizzesTaken === 0,
  };
}