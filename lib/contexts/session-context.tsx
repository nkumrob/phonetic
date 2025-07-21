'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface UserProgress {
  totalQuizzesTaken: number;
  totalCorrectAnswers: number;
  totalIncorrectAnswers: number;
  bestStreak: number;
  currentStreak: number;
  level: number;
  experience: number;
  achievements: string[];
  unlockedModes: string[];
  lastPlayed: string;
  consecutiveDays: number;
}

interface SessionData {
  userProgress: UserProgress;
  quizHistory: any[];
  flashcardProgress: { [key: string]: number };
  conversionHistory: { id: string; input: string; output: string; timestamp: number }[];
}

interface SessionContextType {
  session: SessionData;
  updateProgress: (updates: Partial<UserProgress>) => void;
  addQuizResult: (result: any) => void;
  updateFlashcardProgress: (letter: string, count: number) => void;
  addConversionHistory: (item: any) => void;
  resetSession: () => void;
  getAchievementProgress: () => { [key: string]: number };
}

const defaultSession: SessionData = {
  userProgress: {
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
    consecutiveDays: 1,
  },
  quizHistory: [],
  flashcardProgress: {},
  conversionHistory: [],
};

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<SessionData>(defaultSession);

  // Load session from localStorage on mount
  useEffect(() => {
    const savedSession = localStorage.getItem('phoneticSession');
    if (savedSession) {
      try {
        const parsed = JSON.parse(savedSession);
        
        // Check consecutive days
        const lastPlayed = new Date(parsed.userProgress.lastPlayed);
        const today = new Date();
        const daysDiff = Math.floor((today.getTime() - lastPlayed.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysDiff === 1) {
          parsed.userProgress.consecutiveDays += 1;
        } else if (daysDiff > 1) {
          parsed.userProgress.consecutiveDays = 1;
        }
        
        parsed.userProgress.lastPlayed = today.toISOString();
        setSession(parsed);
      } catch (error) {
        console.error('Error loading session:', error);
      }
    }
  }, []);

  // Save session to localStorage on changes
  useEffect(() => {
    localStorage.setItem('phoneticSession', JSON.stringify(session));
  }, [session]);

  const updateProgress = (updates: Partial<UserProgress>) => {
    setSession(prev => ({
      ...prev,
      userProgress: {
        ...prev.userProgress,
        ...updates,
      },
    }));
  };

  const addQuizResult = (result: any) => {
    setSession(prev => {
      const newSession = { ...prev };
      
      // Update quiz history
      newSession.quizHistory = [...prev.quizHistory, result].slice(-50); // Keep last 50
      
      // Update progress
      newSession.userProgress.totalQuizzesTaken += 1;
      newSession.userProgress.totalCorrectAnswers += result.correct;
      newSession.userProgress.totalIncorrectAnswers += result.incorrect;
      
      if (result.streak > newSession.userProgress.bestStreak) {
        newSession.userProgress.bestStreak = result.streak;
      }
      
      // Add experience points
      const baseXP = result.correct * 10;
      const streakBonus = Math.min(result.streak * 5, 50);
      const difficultyMultiplier = 
        result.difficulty === 'easy' ? 1 : 
        result.difficulty === 'medium' ? 1.5 : 
        result.difficulty === 'hard' ? 2 :
        result.difficulty === 'expert' ? 3 : 
        result.difficulty === 'nightmare' ? 5 : 1;
      
      const totalXP = Math.floor((baseXP + streakBonus) * difficultyMultiplier);
      newSession.userProgress.experience += totalXP;
      
      // Level up logic
      const xpForNextLevel = newSession.userProgress.level * 100;
      if (newSession.userProgress.experience >= xpForNextLevel) {
        newSession.userProgress.level += 1;
        newSession.userProgress.experience -= xpForNextLevel;
        
        // Unlock new modes
        if (newSession.userProgress.level === 3 && !newSession.userProgress.unlockedModes.includes('medium')) {
          newSession.userProgress.unlockedModes.push('medium');
        }
        if (newSession.userProgress.level === 5 && !newSession.userProgress.unlockedModes.includes('hard')) {
          newSession.userProgress.unlockedModes.push('hard');
        }
        if (newSession.userProgress.level === 10 && !newSession.userProgress.unlockedModes.includes('expert')) {
          newSession.userProgress.unlockedModes.push('expert');
        }
        if (newSession.userProgress.level === 15 && !newSession.userProgress.unlockedModes.includes('nightmare')) {
          newSession.userProgress.unlockedModes.push('nightmare');
        }
      }
      
      return newSession;
    });
  };

  const updateFlashcardProgress = (letter: string, count: number) => {
    setSession(prev => ({
      ...prev,
      flashcardProgress: {
        ...prev.flashcardProgress,
        [letter]: count,
      },
    }));
  };

  const addConversionHistory = (item: any) => {
    setSession(prev => ({
      ...prev,
      conversionHistory: [...prev.conversionHistory, item].slice(-20), // Keep last 20
    }));
  };

  const resetSession = () => {
    setSession(defaultSession);
    localStorage.removeItem('phoneticSession');
  };

  const getAchievementProgress = () => {
    const progress = session.userProgress;
    return {
      firstQuiz: progress.totalQuizzesTaken >= 1 ? 100 : 0,
      tenQuizzes: Math.min((progress.totalQuizzesTaken / 10) * 100, 100),
      hundredQuizzes: Math.min((progress.totalQuizzesTaken / 100) * 100, 100),
      perfectScore: session.quizHistory.some(q => q.correct === 10 && q.incorrect === 0) ? 100 : 0,
      streakMaster: progress.bestStreak >= 20 ? 100 : (progress.bestStreak / 20) * 100,
      speedDemon: session.quizHistory.some(q => q.averageTime && q.averageTime < 3) ? 100 : 0,
      alphabetMaster: Object.keys(session.flashcardProgress).filter(k => session.flashcardProgress[k] >= 3).length === 26 ? 100 : 
        (Object.keys(session.flashcardProgress).filter(k => session.flashcardProgress[k] >= 3).length / 26) * 100,
      dailyPlayer: progress.consecutiveDays >= 7 ? 100 : (progress.consecutiveDays / 7) * 100,
      levelTen: progress.level >= 10 ? 100 : (progress.level / 10) * 100,
    };
  };

  return (
    <SessionContext.Provider value={{
      session,
      updateProgress,
      addQuizResult,
      updateFlashcardProgress,
      addConversionHistory,
      resetSession,
      getAchievementProgress,
    }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within SessionProvider');
  }
  return context;
}