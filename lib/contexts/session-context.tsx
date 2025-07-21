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

interface QuizResult {
  mode: string;
  difficulty: string;
  correct: number;
  incorrect: number;
  score: number;
  streak: number;
  averageTime: number;
  timestamp: string;
}

interface ConversionHistoryItem {
  id: string;
  input: string;
  output: string;
  timestamp: number;
}

interface SessionData {
  userProgress: UserProgress;
  quizHistory: QuizResult[];
  flashcardProgress: { [key: string]: number };
  conversionHistory: ConversionHistoryItem[];
}

interface SessionContextType {
  session: SessionData;
  updateProgress: (updates: Partial<UserProgress>) => void;
  addQuizResult: (result: QuizResult) => void;
  updateFlashcardProgress: (letter: string, count: number) => void;
  addConversionHistory: (item: ConversionHistoryItem) => void;
  resetSession: () => void;
  getAchievementProgress: () => { [key: string]: number };
  isSaving: boolean;
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
  const [isSaving, setIsSaving] = useState(false);

  // Load session from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    try {
      const savedSession = localStorage.getItem('phoneticSession');
      
      if (savedSession) {
        const parsed = JSON.parse(savedSession);
        
        // Validate the loaded data
        if (parsed && parsed.userProgress && typeof parsed.userProgress === 'object') {
          // Check consecutive days
          const lastPlayed = parsed.userProgress.lastPlayed ? new Date(parsed.userProgress.lastPlayed) : new Date();
          const today = new Date();
          const daysDiff = Math.floor((today.getTime() - lastPlayed.getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysDiff === 1) {
            parsed.userProgress.consecutiveDays = (parsed.userProgress.consecutiveDays || 0) + 1;
          } else if (daysDiff > 1) {
            parsed.userProgress.consecutiveDays = 1;
          }
          
          parsed.userProgress.lastPlayed = today.toISOString();
          
          // Merge with default to ensure all fields exist
          const mergedSession = {
            ...defaultSession,
            ...parsed,
            userProgress: {
              ...defaultSession.userProgress,
              ...parsed.userProgress,
            },
            // Ensure arrays are preserved
            quizHistory: parsed.quizHistory || defaultSession.quizHistory,
            flashcardProgress: parsed.flashcardProgress || defaultSession.flashcardProgress,
            conversionHistory: parsed.conversionHistory || defaultSession.conversionHistory,
          };
          
          setSession(mergedSession);
        } else {
          // If no valid saved data, just use defaults
          setSession(defaultSession);
        }
      }
    } catch (error) {
      console.error('Error loading session from localStorage:', error);
      // Don't crash the app if localStorage fails
    }
  }, []);

  // Track if session has been initialized from localStorage
  const [isInitialized, setIsInitialized] = useState(false);

  // Save session to localStorage on changes with debouncing
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Skip the first save if we haven't initialized yet
    if (!isInitialized) {
      setIsInitialized(true);
      return;
    }
    
    setIsSaving(true);
    const timeoutId = setTimeout(() => {
      try {
        const dataToSave = JSON.stringify(session);
        localStorage.setItem('phoneticSession', dataToSave);
        setIsSaving(false);
      } catch (error) {
        console.error('Error saving session to localStorage:', error);
        setIsSaving(false);
      }
    }, 500); // Debounce by 500ms
    
    return () => clearTimeout(timeoutId);
  }, [session, isInitialized]);

  const updateProgress = (updates: Partial<UserProgress>) => {
    setSession(prev => {
      const newProgress = {
        ...prev.userProgress,
        ...updates,
      };
      
      // Check for level up if experience was updated
      if (updates.experience !== undefined) {
        // Store total experience earned
        const totalXP = updates.experience;
        let currentLevel = 1;
        let remainingXP = totalXP;
        
        // Calculate current level based on total XP
        // Level 1: 0-99 XP, Level 2: 100-299 XP, Level 3: 300-599 XP, etc.
        let xpNeeded = 0;
        while (remainingXP >= (currentLevel * 100)) {
          remainingXP -= (currentLevel * 100);
          xpNeeded += (currentLevel * 100);
          currentLevel += 1;
          
          // Unlock new modes based on level
          if (currentLevel === 3 && !newProgress.unlockedModes.includes('medium')) {
            newProgress.unlockedModes.push('medium');
          }
          if (currentLevel === 5 && !newProgress.unlockedModes.includes('hard')) {
            newProgress.unlockedModes.push('hard');
          }
          if (currentLevel === 10 && !newProgress.unlockedModes.includes('expert')) {
            newProgress.unlockedModes.push('expert');
          }
          if (currentLevel === 15 && !newProgress.unlockedModes.includes('nightmare')) {
            newProgress.unlockedModes.push('nightmare');
          }
        }
        
        newProgress.level = currentLevel;
        newProgress.experience = totalXP; // Store total XP, not remaining
      }
      
      return {
        ...prev,
        userProgress: newProgress,
      };
    });
  };

  const addQuizResult = (result: QuizResult) => {
    setSession(prev => {
      const newSession = { ...prev };
      
      // Update quiz history
      newSession.quizHistory = [...prev.quizHistory, result].slice(-50); // Keep last 50
      
      // Update progress
      newSession.userProgress.totalQuizzesTaken += 1;
      newSession.userProgress.totalCorrectAnswers += result.correct;
      newSession.userProgress.totalIncorrectAnswers += result.incorrect;
      
      // Update best streak if current is higher
      if (result.streak > newSession.userProgress.bestStreak) {
        newSession.userProgress.bestStreak = result.streak;
      }
      
      // Note: currentStreak is not used anymore. Quiz streaks are tracked per session only.
      // Daily streaks are tracked via consecutiveDays.
      // We keep currentStreak for backward compatibility but don't update it.
      
      // XP is now added per answer in the quiz component, not at the end
      // This prevents double XP addition and allows for proper animations
      
      // Check for level up based on current experience
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

  const addConversionHistory = (item: ConversionHistoryItem) => {
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
      isSaving,
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