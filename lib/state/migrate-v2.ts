/**
 * Migration from v1 to v2
 * Updates field names for clarity:
 * - globalBestStreak -> bestStreak
 * - dailyPracticeStreak -> dailyStreak
 */

export function migrateToV2(state: any): any {
  // Check if already v2
  if (state.version === 2) {
    return state;
  }

  // Migrate stats field names
  if (state.stats) {
    if ('globalBestStreak' in state.stats) {
      state.stats.bestStreak = state.stats.globalBestStreak;
      delete state.stats.globalBestStreak;
    }
    
    if ('dailyPracticeStreak' in state.stats) {
      state.stats.dailyStreak = state.stats.dailyPracticeStreak;
      delete state.stats.dailyPracticeStreak;
    }
  }

  // Update version
  state.version = 2;

  return state;
}