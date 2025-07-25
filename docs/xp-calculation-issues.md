# XP Calculation Issues Analysis

## Problems Identified

1. **Level-up XP Deduction**: When leveling up, XP is being subtracted instead of being properly carried over
   - Current: `currentXP -= currentLevel * 100` (This reduces XP!)
   - Should track total XP separately from level progress

2. **Multiple XP Updates**: Several components are updating XP directly:
   - `unified-quiz.tsx`: Adds XP for correct answers and streak bonuses
   - `practice-hub.tsx`: Adds XP for daily goals and all goals completion
   - Each update calls `updateProgress({ experience: session.userProgress.experience + amount })`

3. **Race Conditions**: 
   - localStorage saves are debounced by 500ms
   - Multiple rapid XP updates could overwrite each other
   - Animation manager has 50ms debounce, but actual XP updates don't

4. **Inconsistent XP Storage**:
   - XP is stored as "remaining XP after level-ups" not total XP
   - This makes it hard to track actual progress

## Example Scenario
- Level 1, 25 XP
- Gain 15 XP = 40 XP total
- No level up (need 100 XP for level 2)
- Should show: Level 1, 40/100 XP
- But if multiple updates happen, race conditions could cause wrong values

## Recommended Fixes

1. **Store Total XP**: Track totalExperience and calculate level/progress from that
2. **Atomic Updates**: Use a single update function that handles all XP changes
3. **Queue XP Updates**: Implement a queue system to prevent race conditions
4. **Fix Level Calculation**: Don't subtract XP during level-ups