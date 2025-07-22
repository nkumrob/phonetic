# ACTION PLAN: Fix NATO Phonetic Practice/Quiz System

## Phase 1: Immediate Critical Fixes (Do First)

### 1. Fix XP Calculation and Display

**Problem**: XP bar shows impossible values like 600/500 because it displays total XP instead of current level progress.

**Solution**:
```typescript
// In session-context.tsx updateProgress:
- newProgress.experience = totalXP; // Store total XP, not remaining
+ newProgress.experience = totalXP; // Keep storing total XP

// In practice-hub.tsx:
- const xpForNextLevel = session.userProgress.level * 100;
- const xpProgress = (session.userProgress.experience / xpForNextLevel) * 100;
+ const xpInfo = calculateLevelFromTotalXP(session.userProgress.experience);
+ // xpInfo.currentLevelXP = XP within current level (0-99 for level 1, etc)
+ // xpInfo.xpForNextLevel = XP needed for current level (100, 200, 300...)
```

### 2. Fix Race Conditions in State Updates

**Problem**: Multiple XP updates overwrite each other due to 500ms debouncing.

**Solution**: Create XP update queue
```typescript
// New file: lib/utils/xp-queue.ts
export class XPUpdateQueue {
  private queue: Array<{amount: number, reason: string}> = [];
  private processing = false;
  
  add(amount: number, reason: string) {
    this.queue.push({amount, reason});
    this.process();
  }
  
  private async process() {
    if (this.processing || this.queue.length === 0) return;
    this.processing = true;
    
    while (this.queue.length > 0) {
      const update = this.queue.shift()!;
      // Apply update atomically
      await this.applyUpdate(update);
    }
    
    this.processing = false;
  }
}
```

### 3. Fix Failed Quiz Progress Tracking

**Problem**: Failed quizzes don't save any progress, making it seem like nothing happened.

**Solution**:
```typescript
// In unified-quiz.tsx endQuiz():
if (passed) {
  addQuizResult(result);
  updateQuizGoal();
} else {
  // Still save the attempt but mark as failed
  addQuizResult({...result, passed: false});
  // Don't update daily goals on failure
}
```

### 4. Fix Daily Goals Reset

**Problem**: Goals can reset on page refresh instead of at midnight.

**Solution**:
```typescript
// In daily-goals.tsx:
// Check actual date, not just different day
const lastReset = new Date(parsed.lastResetTime);
const now = new Date();
const shouldReset = (
  now.getDate() !== lastReset.getDate() ||
  now.getMonth() !== lastReset.getMonth() ||
  now.getFullYear() !== lastReset.getFullYear()
);
```

### 5. Fix Onboarding Showing Repeatedly

**Problem**: Onboarding can show again if localStorage fails or is cleared.

**Solution**:
```typescript
// In onboarding-flow.tsx:
// Add try-catch and fallback
try {
  const completed = localStorage.getItem('onboardingCompleted');
  if (!completed) {
    // Also check session data as backup
    const hasProgress = session.userProgress.totalQuizzesTaken > 0;
    setNeedsOnboarding(!hasProgress);
  }
} catch (e) {
  // If localStorage fails, check session
  setNeedsOnboarding(session.userProgress.totalQuizzesTaken === 0);
}
```

## Phase 2: Core System Refactoring

### 1. Centralize Game State Management

**Create new file: lib/game-state/game-state-manager.ts**
```typescript
export class GameStateManager {
  private state: GameState;
  private listeners: Set<(state: GameState) => void> = new Set();
  
  // Single source of truth for all game calculations
  calculateLevel(totalXP: number): LevelInfo { ... }
  calculateStreakBonus(streak: number): number { ... }
  calculateAccuracy(correct: number, total: number): number { ... }
  
  // Atomic updates
  async updateXP(amount: number, reason: string) { ... }
  async completeQuiz(result: QuizResult) { ... }
  async updateDailyGoal(goalId: string, progress: number) { ... }
}
```

### 2. Implement Proper Storage Layer

**Create new file: lib/storage/game-storage.ts**
```typescript
export class GameStorage {
  private VERSION = 2;
  private KEY = 'nato_game_state_v2';
  
  async save(state: GameState): Promise<void> {
    const data = {
      version: this.VERSION,
      state,
      timestamp: Date.now()
    };
    
    try {
      localStorage.setItem(this.KEY, JSON.stringify(data));
      // Also save backup
      localStorage.setItem(this.KEY + '_backup', JSON.stringify(data));
    } catch (e) {
      console.error('Storage failed:', e);
      // Implement IndexedDB fallback
    }
  }
  
  async load(): Promise<GameState | null> {
    try {
      const data = localStorage.getItem(this.KEY);
      if (!data) return null;
      
      const parsed = JSON.parse(data);
      if (parsed.version !== this.VERSION) {
        return this.migrate(parsed);
      }
      
      return parsed.state;
    } catch (e) {
      // Try backup
      return this.loadBackup();
    }
  }
}
```

### 3. Simplify Streak System

**Keep only these streaks:**
1. **Quiz Streak**: Current streak within active quiz (resets each quiz)
2. **Daily Login Streak**: Consecutive days played
3. **Best Quiz Streak**: Highest streak achieved in any quiz

**Remove:**
- `currentStreak` from userProgress (unused)
- Separate goal streaks (use quiz streak)

### 4. Implement Spaced Repetition

**Use existing SM-2 algorithm:**
```typescript
// In question generation:
const weakLetters = getWeakLetters(session.letterPerformance);
if (weakLetters.length > 0 && Math.random() < 0.7) {
  // 70% chance to practice weak letters
  return generateQuestionForLetter(weakLetters[0]);
} else {
  // 30% chance for random letter
  return generateRandomQuestion();
}
```

## Phase 3: UI/UX Improvements

### 1. Fix XP Display Components

**Update all XP displays to use centralized calculation:**
```typescript
// Create reusable hook
export function useXPDisplay() {
  const { session } = useSession();
  const xpInfo = calculateLevelFromTotalXP(session.userProgress.experience);
  
  return {
    level: xpInfo.level,
    currentXP: xpInfo.currentLevelXP,
    requiredXP: xpInfo.xpForNextLevel,
    totalXP: xpInfo.totalXP,
    progress: xpInfo.progressPercent
  };
}
```

### 2. Add State Recovery UI

**Show when state issues detected:**
```typescript
// Component: StateRecoveryBanner
if (stateCorrupted) {
  return (
    <div className="bg-yellow-500/10 border-yellow-500 p-4">
      <p>We detected an issue with your progress data.</p>
      <button onClick={recoverFromBackup}>Restore from backup</button>
      <button onClick={startFresh}>Start fresh</button>
    </div>
  );
}
```

### 3. Improve Level Up Flow

**Queue level-ups to prevent missing them:**
```typescript
// In level-up detection:
const levelUps = [];
for (let l = oldLevel + 1; l <= newLevel; l++) {
  levelUps.push({
    from: l - 1,
    to: l,
    unlocks: getUnlocksForLevel(l)
  });
}
// Show them sequentially
```

## Phase 4: Testing and Validation

### 1. Add Calculation Tests

```typescript
// __tests__/xp-calculations.test.ts
describe('XP Calculations', () => {
  test('level 1 requires 0 total XP', () => {
    expect(calculateLevelFromTotalXP(0).level).toBe(1);
  });
  
  test('level 2 requires 100 total XP', () => {
    expect(calculateLevelFromTotalXP(100).level).toBe(2);
  });
  
  test('600 XP equals level 4 with 0/400 progress', () => {
    const info = calculateLevelFromTotalXP(600);
    expect(info.level).toBe(4);
    expect(info.currentLevelXP).toBe(0);
    expect(info.xpForNextLevel).toBe(400);
  });
});
```

### 2. Add State Validation

```typescript
// In session-context.tsx:
function validateState(state: SessionData): boolean {
  // Check for impossible values
  if (state.userProgress.experience < 0) return false;
  if (state.userProgress.level < 1) return false;
  if (state.userProgress.totalCorrectAnswers < 0) return false;
  
  // Check level matches XP
  const calculated = calculateLevelFromTotalXP(state.userProgress.experience);
  if (calculated.level !== state.userProgress.level) return false;
  
  return true;
}
```

## Phase 5: Migration Plan

### 1. Data Migration

```typescript
function migrateV1ToV2(oldData: any): GameState {
  return {
    version: 2,
    userProgress: {
      ...oldData.userProgress,
      // Ensure experience is total XP
      experience: calculateTotalXPForLevel(oldData.userProgress.level) + 
                  (oldData.userProgress.experience || 0)
    },
    // ... migrate other fields
  };
}
```

### 2. Rollout Strategy

1. **Add migration code first** - Deploy but don't activate
2. **Add state validation** - Log issues but don't break
3. **Deploy fixes** - With feature flags
4. **Monitor for issues** - Check error logs
5. **Remove old code** - After confirmation

## Implementation Priority

1. **Week 1**: Phase 1 - Critical fixes
2. **Week 2**: Phase 2 - Core refactoring
3. **Week 3**: Phase 3 - UI improvements
4. **Week 4**: Phase 4-5 - Testing and migration

## Success Metrics

- XP never shows impossible values (600/500)
- Daily goals reset exactly at midnight
- Failed quizzes still track progress
- Level-ups never missed
- No duplicate onboarding
- State corruption detected and recovered
- 95% of XP updates succeed without race conditions