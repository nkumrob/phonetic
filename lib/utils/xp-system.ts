/**
 * Centralized XP calculation system
 * Single source of truth for all XP calculations
 */

export interface XPCalculation {
  baseXP: number;
  streakBonus: number;
  totalXP: number;
  breakdown: string;
}

export interface XPPenalty {
  amount: number;
  reason: string;
}

/**
 * Calculate XP for a correct answer
 */
export function calculateCorrectAnswerXP(
  mode: 'learn' | 'practice' | 'challenge',
  streakCount: number
): XPCalculation {
  // Base XP by mode
  const baseXP = mode === 'learn' ? 5 : mode === 'practice' ? 10 : 20;
  
  // Streak bonus: 5 XP per streak, max 50
  const streakBonus = Math.min(streakCount * 5, 50);
  
  const totalXP = baseXP + streakBonus;
  
  const breakdown = streakBonus > 0 
    ? `${baseXP} + ${streakBonus} streak`
    : `${baseXP}`;
    
  return {
    baseXP,
    streakBonus,
    totalXP,
    breakdown
  };
}

/**
 * Calculate XP penalty for wrong answer
 */
export function calculateWrongAnswerPenalty(
  mode: 'learn' | 'practice' | 'challenge'
): XPPenalty {
  // No penalty in learn mode
  if (mode === 'learn') {
    return { amount: 0, reason: 'No penalty in learn mode' };
  }
  
  // -3 XP for practice, -5 for challenge
  const amount = mode === 'practice' ? 3 : 5;
  
  return {
    amount,
    reason: `Wrong answer (-${amount} XP)`
  };
}

/**
 * Calculate XP penalty for quiz retry
 */
export function calculateRetryPenalty(
  mode: 'practice' | 'challenge',
  attempt: number
): XPPenalty {
  // First retry: -5 XP, second: -10 XP
  const amount = mode === 'practice' ? 5 : 10;
  const totalPenalty = amount * attempt;
  
  return {
    amount: totalPenalty,
    reason: `Retry penalty (-${totalPenalty} XP)`
  };
}

/**
 * Calculate minimum XP allowed (prevents going too negative)
 */
export function calculateMinimumXP(currentTotalXP: number): number {
  // Allow going negative but not below -50 XP
  return Math.max(currentTotalXP, -50);
}

/**
 * Format XP display string
 */
export function formatXPDisplay(calculation: XPCalculation): {
  animation: string;
  message: string;
} {
  return {
    animation: `+${calculation.totalXP}`,
    message: `Correct! +${calculation.totalXP} XP${
      calculation.streakBonus > 0 ? ` (${calculation.breakdown})` : ''
    }`
  };
}