/**
 * Simple State Manager
 * Lightweight state management without gamification
 */

import { SimpleAppState, createDefaultSimpleState, QuizRecord } from './simple-types';
import { logger } from '@/lib/utils/logger';


type StateListener = (state: SimpleAppState) => void;
type StateUpdater<K extends keyof SimpleAppState> = (
  current: SimpleAppState[K]
) => SimpleAppState[K];

export class SimpleStateManager {
  private static instance: SimpleStateManager;
  private state: SimpleAppState;
  private listeners: Set<StateListener> = new Set();
  private saveTimeout: NodeJS.Timeout | null = null;
  private readonly STORAGE_KEY = 'nato_app_state';
  private readonly SAVE_DELAY = 500; // ms
  
  private constructor() {
    this.state = this.loadState();
  }
  
  static getInstance(): SimpleStateManager {
    if (!SimpleStateManager.instance) {
      SimpleStateManager.instance = new SimpleStateManager();
    }
    return SimpleStateManager.instance;
  }
  
  /**
   * Load state from storage
   */
  private loadState(): SimpleAppState {
    // Check if running on server
    if (typeof window === 'undefined') {
      return createDefaultSimpleState();
    }
    
    // Try to load state
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Validate version and structure
        if (parsed.version === 1 && typeof parsed.progress === 'object') {
          return parsed;
        }
      } catch (e) {
        logger.error('Failed to parse stored state:', e);
      }
    }
    
    // Load user preferences from legacy storage if available
    const defaultState = createDefaultSimpleState();
    const userName = localStorage.getItem('userName');
    const userAvatar = localStorage.getItem('userAvatar');
    
    if (userName) defaultState.user.name = userName;
    if (userAvatar) defaultState.user.avatar = userAvatar;
    
    return defaultState;
  }
  
  /**
   * Get current state
   */
  getState(): Readonly<SimpleAppState> {
    return this.state;
  }
  
  /**
   * Update a specific part of the state
   */
  update<K extends keyof SimpleAppState>(
    key: K,
    updater: StateUpdater<K>
  ): void {
    const newValue = updater(this.state[key]);
    this.state = {
      ...this.state,
      [key]: newValue,
    };
    
    this.notifyListeners();
    this.scheduleSave();
  }
  
  /**
   * Add quiz result
   */
  addQuizResult(result: Omit<QuizRecord, 'id'>): void {
    const newResult: QuizRecord = {
      ...result,
      id: crypto.randomUUID(),
    };
    
    this.update('progress', (progress) => ({
      ...progress,
      quizHistory: [...progress.quizHistory, newResult].slice(-100), // Keep last 100
      totalQuizzesTaken: progress.totalQuizzesTaken + 1,
      totalCorrectAnswers: progress.totalCorrectAnswers + result.correctAnswers,
      totalIncorrectAnswers: progress.totalIncorrectAnswers + (result.totalQuestions - result.correctAnswers),
      lastPlayedDate: new Date().toISOString(),
    }));
  }
  
  /**
   * Update letter statistics
   */
  updateLetterStats(letter: string, correct: boolean): void {
    this.update('progress', (progress) => {
      const currentStats = progress.letterStats[letter] || { attempts: 0, correct: 0 };
      return {
        ...progress,
        letterStats: {
          ...progress.letterStats,
          [letter]: {
            attempts: currentStats.attempts + 1,
            correct: currentStats.correct + (correct ? 1 : 0),
            lastPracticed: new Date().toISOString(),
          },
        },
      };
    });
  }
  
  /**
   * Update flashcard review count
   */
  updateFlashcardReview(letter: string): void {
    this.update('progress', (progress) => ({
      ...progress,
      flashcardReviews: {
        ...progress.flashcardReviews,
        [letter]: (progress.flashcardReviews[letter] || 0) + 1,
      },
    }));
  }
  
  /**
   * Update user profile
   */
  updateUserProfile(updates: Partial<SimpleAppState['user']>): void {
    this.update('user', (user) => ({
      ...user,
      ...updates,
    }));
    
    // Also update localStorage for legacy compatibility
    if (updates.name !== undefined) {
      localStorage.setItem('userName', updates.name);
    }
    if (updates.avatar !== undefined) {
      localStorage.setItem('userAvatar', updates.avatar);
    }
  }
  
  /**
   * Update preferences
   */
  updatePreferences(updates: Partial<SimpleAppState['preferences']>): void {
    this.update('preferences', (prefs) => ({
      ...prefs,
      ...updates,
    }));
  }
  
  /**
   * Subscribe to state changes
   */
  subscribe(listener: StateListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  
  /**
   * Notify all listeners of state change
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.state));
  }
  
  /**
   * Schedule a save operation
   */
  private scheduleSave(): void {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    
    this.saveTimeout = setTimeout(() => {
      this.saveToStorage();
    }, this.SAVE_DELAY);
  }
  
  /**
   * Save state to storage
   */
  private saveToStorage(): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      logger.error('Failed to save state:', e);
    }
  }
  
  /**
   * Reset all progress (preserve user profile)
   */
  reset(): void {
    const { name, avatar } = this.state.user;
    const newState = createDefaultSimpleState();
    
    // Preserve user profile
    newState.user.name = name;
    newState.user.avatar = avatar;
    
    // Clear legacy storage items
    if (typeof window !== 'undefined') {
      localStorage.removeItem('dailyGoals_v2');
      localStorage.removeItem('nato_game_state_v3');
      localStorage.removeItem('phoneticSession');
    }
    
    this.state = newState;
    this.saveToStorage();
    this.notifyListeners();
  }
}

// Export singleton instance
export const simpleStateManager = SimpleStateManager.getInstance();