/**
 * Centralized Level System
 * Single source of truth for all level calculations
 */

export interface LevelInfo {
  level: number;
  currentLevelXP: number; // XP within current level
  xpForNextLevel: number; // XP needed to reach next level
  totalXPForCurrentLevel: number; // Total XP needed to reach current level from 0
  progressPercentage: number; // Progress within current level (0-100)
}

export interface UnlockInfo {
  modes: string[];
  nextUnlock: {
    level: number;
    mode: string;
  } | null;
}

export class LevelSystem {
  // XP required per level: Level 1 = 100 XP, Level 2 = 200 XP, etc.
  private static readonly XP_PER_LEVEL_MULTIPLIER = 100;
  
  // Mode unlocks
  private static readonly MODE_UNLOCKS: Record<number, string> = {
    1: 'easy',
    3: 'medium',
    5: 'hard',
    10: 'expert',
    15: 'nightmare',
  };
  
  /**
   * Calculate level information from total XP
   */
  static calculateLevel(totalXP: number): LevelInfo {
    if (totalXP < 0) totalXP = 0;
    
    let level = 1;
    let remainingXP = totalXP;
    let totalXPForCurrentLevel = 0;
    
    // Calculate current level
    while (remainingXP >= level * this.XP_PER_LEVEL_MULTIPLIER) {
      remainingXP -= level * this.XP_PER_LEVEL_MULTIPLIER;
      totalXPForCurrentLevel += level * this.XP_PER_LEVEL_MULTIPLIER;
      level++;
    }
    
    const xpForNextLevel = level * this.XP_PER_LEVEL_MULTIPLIER;
    const progressPercentage = (remainingXP / xpForNextLevel) * 100;
    
    return {
      level,
      currentLevelXP: remainingXP,
      xpForNextLevel,
      totalXPForCurrentLevel,
      progressPercentage: Math.round(progressPercentage),
    };
  }
  
  /**
   * Calculate total XP needed to reach a specific level
   */
  static getXPForLevel(targetLevel: number): number {
    if (targetLevel <= 1) return 0;
    
    let totalXP = 0;
    for (let level = 1; level < targetLevel; level++) {
      totalXP += level * this.XP_PER_LEVEL_MULTIPLIER;
    }
    
    return totalXP;
  }
  
  /**
   * Get unlocked modes for a given level
   */
  static getUnlockedModes(level: number): string[] {
    const unlockedModes: string[] = [];
    
    for (const [unlockLevel, mode] of Object.entries(this.MODE_UNLOCKS)) {
      if (level >= parseInt(unlockLevel)) {
        unlockedModes.push(mode);
      }
    }
    
    return unlockedModes;
  }
  
  /**
   * Get unlock information including next unlock
   */
  static getUnlockInfo(level: number): UnlockInfo {
    const unlockedModes = this.getUnlockedModes(level);
    
    // Find next unlock
    let nextUnlock: UnlockInfo['nextUnlock'] = null;
    for (const [unlockLevel, mode] of Object.entries(this.MODE_UNLOCKS)) {
      const lvl = parseInt(unlockLevel);
      if (lvl > level) {
        nextUnlock = { level: lvl, mode };
        break;
      }
    }
    
    return { modes: unlockedModes, nextUnlock };
  }
  
  /**
   * Calculate XP penalty for wrong answers
   */
  static calculateXPPenalty(mode: 'learn' | 'practice' | 'challenge'): number {
    switch (mode) {
      case 'learn':
        return 2;
      case 'practice':
        return 3;
      case 'challenge':
        return 5;
      default:
        return 3;
    }
  }
  
  /**
   * Calculate XP reward for correct answers
   */
  static calculateXPReward(
    mode: 'learn' | 'practice' | 'challenge',
    streakBonus: number = 0
  ): number {
    const baseXP = mode === 'learn' ? 5 : mode === 'practice' ? 10 : 20;
    return baseXP + streakBonus;
  }
}