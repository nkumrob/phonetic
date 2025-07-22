/**
 * Unified State Manager
 * Single source of truth for all game state
 */

import { UnifiedGameState, createDefaultState } from './types';
import { StateMigration } from './migrations';
import { LevelSystem } from '@/lib/core/level-system';
import { migrateToV2 } from './migrate-v2';

type StateListener = (state: UnifiedGameState) => void;
type StateUpdater<K extends keyof UnifiedGameState> = (
  current: UnifiedGameState[K]
) => UnifiedGameState[K];

export class UnifiedStateManager {
  private static instance: UnifiedStateManager;
  private state: UnifiedGameState;
  private listeners: Set<StateListener> = new Set();
  private saveTimeout: NodeJS.Timeout | null = null;
  private readonly STORAGE_KEY = 'nato_game_state_v3';
  private readonly SAVE_DELAY = 100; // ms
  
  private constructor() {
    this.state = this.loadState();
  }
  
  static getInstance(): UnifiedStateManager {
    if (!UnifiedStateManager.instance) {
      UnifiedStateManager.instance = new UnifiedStateManager();
    }
    return UnifiedStateManager.instance;
  }
  
  /**
   * Load state from storage or migrate from legacy
   */
  private loadState(): UnifiedGameState {
    // Check if running on server
    if (typeof window === 'undefined') {
      return createDefaultState();
    }
    
    // Try to load unified state
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      try {
        let parsed = JSON.parse(stored);
        // Apply migrations if needed
        if (parsed.version === 1) {
          parsed = migrateToV2(parsed);
          // Save migrated state immediately
          localStorage.setItem(this.STORAGE_KEY, JSON.stringify(parsed));
        }
        // Validate version and structure
        if (parsed.version && typeof parsed.progress === 'object') {
          return parsed;
        }
      } catch (e) {
        console.error('Failed to parse stored state:', e);
      }
    }
    
    // Check if migration is needed
    if (StateMigration.needsMigration()) {
      const migrated = StateMigration.migrate();
      this.saveImmediately(migrated);
      StateMigration.cleanupLegacyKeys();
      return migrated;
    }
    
    // Return default state
    return createDefaultState();
  }
  
  /**
   * Get current state
   */
  getState(): Readonly<UnifiedGameState> {
    return this.state;
  }
  
  /**
   * Update a specific part of the state
   */
  update<K extends keyof UnifiedGameState>(
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
   * Update XP and calculate level changes
   */
  updateXP(xpChange: number): void {
    const currentXP = this.state.progress.totalXP;
    const newXP = Math.max(-50, currentXP + xpChange); // Floor of -50
    
    const oldLevel = LevelSystem.calculateLevel(currentXP).level;
    const newLevel = LevelSystem.calculateLevel(newXP).level;
    
    this.update('progress', (progress) => ({
      ...progress,
      totalXP: newXP,
      unlockedModes: LevelSystem.getUnlockedModes(newLevel),
    }));
    
    // Check for level up
    if (newLevel > oldLevel) {
      this.onLevelUp(oldLevel, newLevel);
    }
    
    // Save XP changes immediately
    this.saveImmediately();
  }
  
  /**
   * Add quiz result
   */
  addQuizResult(result: UnifiedGameState['quizHistory'][0]): void {
    this.update('quizHistory', (history) => {
      const newHistory = [...history, result];
      // Keep only last 50 results
      return newHistory.slice(-50);
    });
    
    this.update('stats', (stats) => ({
      ...stats,
      totalQuizzesTaken: stats.totalQuizzesTaken + 1,
      totalCorrectAnswers: stats.totalCorrectAnswers + result.correct,
      totalIncorrectAnswers: stats.totalIncorrectAnswers + result.incorrect,
      bestStreak: Math.max(stats.bestStreak, result.streak),
    }));
  }
  
  /**
   * Update daily practice streak
   */
  updateDailyStreak(): void {
    const today = new Date().toISOString().split('T')[0];
    const lastPlayed = new Date(this.state.stats.lastPlayedDate);
    const lastPlayedDate = lastPlayed.toISOString().split('T')[0];
    
    if (today === lastPlayedDate) {
      // Already played today
      return;
    }
    
    const daysDiff = Math.floor(
      (new Date().getTime() - lastPlayed.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    this.update('stats', (stats) => ({
      ...stats,
      dailyStreak: daysDiff === 1 ? stats.dailyStreak + 1 : 1,
      lastPlayedDate: new Date().toISOString(),
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
   * Save immediately (for critical updates like XP)
   */
  private saveImmediately(state: UnifiedGameState = this.state): void {
    if (typeof window === 'undefined') return;
    
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
      this.saveTimeout = null;
    }
    
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Failed to save state:', e);
    }
  }
  
  /**
   * Save state to storage
   */
  private saveToStorage(): void {
    this.saveImmediately();
  }
  
  /**
   * Handle level up event
   */
  private onLevelUp(oldLevel: number, newLevel: number): void {
    // Could trigger celebrations, achievements, etc.
    console.log(`Level up! ${oldLevel} -> ${newLevel}`);
    
    // Check for level-based achievements
    if (newLevel >= 10 && !this.state.progress.achievements.includes('level10')) {
      this.update('progress', (progress) => ({
        ...progress,
        achievements: [...progress.achievements, 'level10'],
      }));
    }
  }
  
  /**
   * Reset all state
   */
  reset(): void {
    this.state = createDefaultState();
    this.saveImmediately();
    this.notifyListeners();
  }
}

// Export singleton instance
export const unifiedStateManager = UnifiedStateManager.getInstance();