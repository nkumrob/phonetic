/**
 * Single source of truth for game state
 * Prevents race conditions and ensures consistency
 */

import { UserProgress } from '@/lib/types/session';

interface StateUpdate {
  type: 'XP_UPDATE' | 'STREAK_UPDATE' | 'ACHIEVEMENT_UPDATE' | 'GOAL_UPDATE';
  timestamp: number;
  data: any;
}

class GameStateManager {
  private static instance: GameStateManager;
  private updateQueue: StateUpdate[] = [];
  private isProcessing = false;
  private saveTimeout: NodeJS.Timeout | null = null;
  
  // Single storage key for all game state
  private readonly STORAGE_KEY = 'nato_game_state';
  
  private constructor() {}
  
  static getInstance(): GameStateManager {
    if (!GameStateManager.instance) {
      GameStateManager.instance = new GameStateManager();
    }
    return GameStateManager.instance;
  }
  
  /**
   * Queue an update to prevent race conditions
   */
  queueUpdate(update: StateUpdate) {
    this.updateQueue.push(update);
    this.processQueue();
  }
  
  /**
   * Process updates sequentially
   */
  private async processQueue() {
    if (this.isProcessing || this.updateQueue.length === 0) return;
    
    this.isProcessing = true;
    
    while (this.updateQueue.length > 0) {
      const update = this.updateQueue.shift()!;
      await this.applyUpdate(update);
    }
    
    this.isProcessing = false;
    this.scheduleSave();
  }
  
  /**
   * Apply a single update
   */
  private async applyUpdate(update: StateUpdate) {
    const currentState = this.loadState();
    
    switch (update.type) {
      case 'XP_UPDATE':
        currentState.experience = update.data.experience;
        currentState.level = update.data.level;
        break;
      case 'STREAK_UPDATE':
        Object.assign(currentState, update.data);
        break;
      case 'ACHIEVEMENT_UPDATE':
        currentState.achievements = update.data.achievements;
        break;
      case 'GOAL_UPDATE':
        // Goal updates handled separately
        break;
    }
    
    // Update in memory immediately
    this.saveStateToMemory(currentState);
  }
  
  /**
   * Save to localStorage with debouncing
   */
  private scheduleSave() {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    
    this.saveTimeout = setTimeout(() => {
      this.saveToStorage();
    }, 100); // Much shorter debounce - 100ms instead of 500ms
  }
  
  /**
   * Load state from localStorage
   */
  loadState(): UserProgress {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load game state:', error);
    }
    
    // Return default state
    return {
      level: 1,
      experience: 0,
      bestStreak: 0,
      currentStreak: 0,
      totalCorrect: 0,
      totalAttempted: 0,
      unlockedModes: ['easy'],
      achievements: [],
      lastPlayedDate: new Date().toISOString(),
      consecutiveDays: 0,
      quizHistory: [],
      completedLetters: [],
      flashcardProgress: {}
    };
  }
  
  /**
   * Save state to memory (for immediate updates)
   */
  private memoryState: UserProgress | null = null;
  
  private saveStateToMemory(state: UserProgress) {
    this.memoryState = state;
  }
  
  /**
   * Get current state (from memory or storage)
   */
  getCurrentState(): UserProgress {
    return this.memoryState || this.loadState();
  }
  
  /**
   * Save to localStorage
   */
  private saveToStorage() {
    if (!this.memoryState) return;
    
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.memoryState));
      
      // Also update legacy keys for backward compatibility
      this.updateLegacyStorage(this.memoryState);
    } catch (error) {
      console.error('Failed to save game state:', error);
    }
  }
  
  /**
   * Update legacy storage keys for backward compatibility
   */
  private updateLegacyStorage(state: UserProgress) {
    try {
      localStorage.setItem('userProgress', JSON.stringify(state));
      localStorage.setItem('lastKnownLevel', state.level.toString());
      
      // Clean up old keys that cause conflicts
      const oldKeys = [
        'nato_quiz_session',
        'nato_session_backup',
        'streak_data',
        'achievement_progress'
      ];
      
      oldKeys.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.error('Failed to update legacy storage:', error);
    }
  }
  
  /**
   * Force immediate save (for critical updates)
   */
  forceSave() {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    this.saveToStorage();
  }
}

export const gameStateManager = GameStateManager.getInstance();