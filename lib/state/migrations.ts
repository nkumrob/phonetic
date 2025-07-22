/**
 * State Migration System
 * Handles migration from fragmented localStorage to unified state
 */

import { UnifiedGameState, createDefaultState } from './types';
import { LevelSystem } from '@/lib/core/level-system';

interface LegacySession {
  userProgress: {
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
  };
  quizHistory: any[];
  flashcardProgress: Record<string, number>;
  conversionHistory: any[];
}

export class StateMigration {
  private static readonly LEGACY_KEYS = [
    'phoneticSession',
    'dailyGoals_v2',
    'theme',
    'soundEnabled',
    'soundVolume',
    'onboardingCompleted',
    'userName',
    'phoneticQuizStats',
    'userProgress',
    'lastKnownLevel',
    // Keys to remove
    'nato_quiz_session',
    'nato_session_backup',
    'streak_data',
    'achievement_progress',
  ];
  
  /**
   * Check if migration is needed
   */
  static needsMigration(): boolean {
    // Check if running on server
    if (typeof window === 'undefined') {
      return false;
    }
    
    // If unified state exists, no migration needed
    if (localStorage.getItem('nato_game_state_v3')) {
      return false;
    }
    
    // Check if any legacy keys exist
    return this.LEGACY_KEYS.some(key => localStorage.getItem(key) !== null);
  }
  
  /**
   * Migrate from legacy storage to unified state
   */
  static migrate(): UnifiedGameState {
    console.log('Starting state migration...');
    
    const state = createDefaultState();
    
    // Migrate session data
    const sessionData = this.migrateLegacySession();
    if (sessionData) {
      state.progress.totalXP = sessionData.userProgress.experience;
      state.progress.achievements = sessionData.userProgress.achievements;
      state.progress.unlockedModes = sessionData.userProgress.unlockedModes;
      
      state.stats.totalQuizzesTaken = sessionData.userProgress.totalQuizzesTaken;
      state.stats.totalCorrectAnswers = sessionData.userProgress.totalCorrectAnswers;
      state.stats.totalIncorrectAnswers = sessionData.userProgress.totalIncorrectAnswers;
      state.stats.bestStreak = sessionData.userProgress.bestStreak;
      state.stats.dailyStreak = sessionData.userProgress.consecutiveDays;
      state.stats.lastPlayedDate = sessionData.userProgress.lastPlayed;
      
      state.quizHistory = sessionData.quizHistory || [];
      state.learning.flashcardProgress = sessionData.flashcardProgress || {};
    }
    
    // Migrate user data
    const userName = localStorage.getItem('userName');
    if (userName) {
      state.user.name = userName;
    }
    
    const onboardingCompleted = localStorage.getItem('onboardingCompleted');
    if (onboardingCompleted === 'true') {
      state.user.onboardingCompleted = true;
    }
    
    // Migrate preferences
    const theme = localStorage.getItem('theme');
    if (theme === 'light' || theme === 'dark') {
      state.preferences.theme = theme;
    }
    
    const soundEnabled = localStorage.getItem('soundEnabled');
    if (soundEnabled !== null) {
      state.preferences.soundEnabled = soundEnabled === 'true';
    }
    
    const soundVolume = localStorage.getItem('soundVolume');
    if (soundVolume !== null) {
      state.preferences.soundVolume = parseFloat(soundVolume);
    }
    
    // Migrate daily goals
    const dailyGoals = localStorage.getItem('dailyGoals_v2');
    if (dailyGoals) {
      try {
        const parsed = JSON.parse(dailyGoals);
        state.dailyGoals = {
          date: parsed.date,
          goals: parsed.goals,
          lastResetTime: parsed.lastResetTime,
          completedAllBonus: parsed.completedAllBonus,
          streakDays: parsed.streakDays,
        };
      } catch (e) {
        console.error('Failed to parse daily goals:', e);
      }
    }
    
    // Additional quiz stats
    const quizStats = localStorage.getItem('phoneticQuizStats');
    if (quizStats) {
      try {
        const parsed = JSON.parse(quizStats);
        // Merge with existing quiz history if not already included
        if (Array.isArray(parsed) && state.quizHistory.length === 0) {
          state.quizHistory = parsed;
        }
      } catch (e) {
        console.error('Failed to parse quiz stats:', e);
      }
    }
    
    console.log('Migration completed successfully');
    return state;
  }
  
  /**
   * Migrate legacy session data
   */
  private static migrateLegacySession(): LegacySession | null {
    const sessionStr = localStorage.getItem('phoneticSession');
    if (!sessionStr) return null;
    
    try {
      return JSON.parse(sessionStr);
    } catch (e) {
      console.error('Failed to parse legacy session:', e);
      return null;
    }
  }
  
  /**
   * Clean up legacy keys after successful migration
   */
  static cleanupLegacyKeys(): void {
    console.log('Cleaning up legacy keys...');
    
    // Mark migration timestamp
    localStorage.setItem('nato_migration_completed', new Date().toISOString());
    
    // Don't immediately delete keys - keep for 30 days as backup
    // In production, you'd check the migration timestamp and delete after grace period
  }
  
  /**
   * Force cleanup of all legacy keys (use with caution)
   */
  static forceCleanup(): void {
    console.warn('Force cleaning all legacy keys...');
    
    this.LEGACY_KEYS.forEach(key => {
      localStorage.removeItem(key);
    });
  }
}