/**
 * Calculate level and progress from total XP
 * Level 1: 0-99 XP (100 XP needed)
 * Level 2: 100-299 XP (200 XP needed) 
 * Level 3: 300-599 XP (300 XP needed)
 * etc.
 */
export function calculateLevelFromTotalXP(totalXP: number) {
  let level = 1;
  let xpUsed = 0;
  
  // Calculate current level
  while (totalXP >= xpUsed + (level * 100)) {
    xpUsed += level * 100;
    level++;
  }
  
  // XP progress in current level
  const xpInCurrentLevel = totalXP - xpUsed;
  const xpNeededForCurrentLevel = level * 100;
  
  return {
    level,
    currentLevelXP: xpInCurrentLevel,
    xpForNextLevel: xpNeededForCurrentLevel,
    totalXP,
    progressPercent: (xpInCurrentLevel / xpNeededForCurrentLevel) * 100
  };
}

/**
 * Calculate total XP needed to reach a specific level
 * Level 1: 0 XP
 * Level 2: 100 XP
 * Level 3: 300 XP (100 + 200)
 * Level 4: 600 XP (100 + 200 + 300)
 * etc.
 */
export function calculateTotalXPForLevel(level: number): number {
  if (level <= 1) return 0;
  
  let totalXP = 0;
  for (let i = 1; i < level; i++) {
    totalXP += i * 100;
  }
  return totalXP;
}