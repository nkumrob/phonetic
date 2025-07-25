'use client';

import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import { useSimpleState } from '@/lib/hooks/use-simple-state';
import { SimpleAppState, QuizRecord } from '@/lib/state/simple-types';
import { performMigration } from '@/lib/state/migrate-to-simple';

interface SimpleAppContextType {
  // State
  state: SimpleAppState;
  
  // Actions
  addQuizResult: (result: Omit<QuizRecord, 'id'>) => void;
  updateLetterStats: (letter: string, correct: boolean) => void;
  updateFlashcardReview: (letter: string) => void;
  updateUserProfile: (updates: Partial<SimpleAppState['user']>) => void;
  updatePreferences: (updates: Partial<SimpleAppState['preferences']>) => void;
  resetProgress: () => void;
  
  // Computed values
  overallAccuracy: number;
  recentQuizzes: QuizRecord[];
  isNewUser: boolean;
}

const SimpleAppContext = createContext<SimpleAppContextType | undefined>(undefined);

export function SimpleAppProvider({ children }: { children: ReactNode }) {
  const stateHook = useSimpleState();
  
  // Perform migration on mount if needed
  useEffect(() => {
    const migrationComplete = localStorage.getItem('migration_to_simple_complete');
    if (!migrationComplete) {
      performMigration();
    }
  }, []);
  
  return (
    <SimpleAppContext.Provider value={stateHook}>
      {children}
    </SimpleAppContext.Provider>
  );
}

export function useSimpleAppState() {
  const context = useContext(SimpleAppContext);
  if (!context) {
    throw new Error('useSimpleAppState must be used within SimpleAppProvider');
  }
  return context;
}