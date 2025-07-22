/**
 * Migration from gamified state to simple state
 */

import { SimpleAppState, createDefaultSimpleState } from './simple-types';

export function migrateToSimpleState(): SimpleAppState | null {
  if (typeof window === 'undefined') {
    return null;
  }
  
  // Check for existing simple state first
  const existingSimple = localStorage.getItem('nato_app_state');
  if (existingSimple) {
    try {
      const parsed = JSON.parse(existingSimple);
      if (parsed.version === 1) {
        return null; // Already migrated
      }
    } catch (e) {
      // Continue with migration
    }
  }
  
  // Try to migrate from unified state
  const unifiedState = localStorage.getItem('nato_game_state_v3');
  if (unifiedState) {
    try {
      const oldState = JSON.parse(unifiedState);
      return migrateFromUnifiedBasic(oldState);
    } catch (e) {
      console.error('Failed to migrate from unified state:', e);
    }
  }
  
  // Try to migrate from legacy session
  const sessionState = localStorage.getItem('phoneticSession');
  if (sessionState) {
    try {
      const oldSession = JSON.parse(sessionState);
      return migrateFromSession(oldSession);
    } catch (e) {
      console.error('Failed to migrate from session:', e);
    }
  }
  
  // Check for standalone user data
  const userName = localStorage.getItem('userName');
  const userAvatar = localStorage.getItem('userAvatar');
  
  if (userName || userAvatar) {
    const newState = createDefaultSimpleState();
    if (userName) newState.user.name = userName;
    if (userAvatar) newState.user.avatar = userAvatar;
    return newState;
  }
  
  return null;
}

function migrateFromUnifiedBasic(oldState: Record<string, unknown>): SimpleAppState {
  const newState = createDefaultSimpleState();
  
  // Simple migration - just preserve user data
  const userName = localStorage.getItem('userName');
  const userAvatar = localStorage.getItem('userAvatar');
  
  if (userName) newState.user.name = userName;
  if (userAvatar) newState.user.avatar = userAvatar;
  
  return newState;
}

interface LegacySession {
  userProgress?: {
    totalQuizzesTaken?: number;
    totalCorrectAnswers?: number;
    totalIncorrectAnswers?: number;
    lastPlayed?: string;
  };
  quizHistory?: Array<{
    timestamp?: string;
    score?: number;
  }>;
  flashcardProgress?: Record<string, number>;
}

function migrateFromSession(oldSession: LegacySession): SimpleAppState {
  const newState = createDefaultSimpleState();
  
  // Migrate user data
  newState.user.name = localStorage.getItem('userName') || '';
  newState.user.avatar = localStorage.getItem('userAvatar') || '🧑‍✈️';
  
  // Migrate progress
  if (oldSession.userProgress) {
    newState.progress.totalQuizzesTaken = oldSession.userProgress.totalQuizzesTaken || 0;
    newState.progress.totalCorrectAnswers = oldSession.userProgress.totalCorrectAnswers || 0;
    newState.progress.totalIncorrectAnswers = oldSession.userProgress.totalIncorrectAnswers || 0;
    newState.progress.lastPlayedDate = oldSession.userProgress.lastPlayed || new Date().toISOString();
  }
  
  // Migrate quiz history
  if (oldSession.quizHistory) {
    newState.progress.quizHistory = oldSession.quizHistory.map((quiz, index) => ({
      id: `migrated-${index}`,
      date: quiz.timestamp || new Date().toISOString(),
      mode: 'practice' as const,
      totalQuestions: 10,
      correctAnswers: quiz.score || 0,
      duration: 300, // Default 5 minutes
      passed: (quiz.score || 0) >= 7,
    })).slice(-100);
  }
  
  // Migrate flashcard progress
  if (oldSession.flashcardProgress) {
    newState.progress.flashcardReviews = oldSession.flashcardProgress;
  }
  
  return newState;
}


// Function to perform the migration
export function performMigration(): boolean {
  const migrated = migrateToSimpleState();
  
  if (migrated) {
    // Save the migrated state
    localStorage.setItem('nato_app_state', JSON.stringify(migrated));
    
    // Mark migration as complete
    localStorage.setItem('migration_to_simple_complete', 'true');
    
    console.log('Successfully migrated to simple state');
    return true;
  }
  
  return false;
}