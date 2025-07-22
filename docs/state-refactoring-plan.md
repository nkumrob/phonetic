# State Management Refactoring Plan

## Current Issues

### 1. Fragmented State Storage
- **11+ localStorage keys** storing different parts of game state
- Risk of sync issues and race conditions
- Difficult to maintain consistency

### 2. Duplicated Level Calculation Logic
- Level calculation code in 3+ locations
- Different implementations may lead to inconsistencies
- XP to level conversion logic repeated

### 3. Unused Spaced Repetition System
- SM-2 algorithm implemented but never integrated
- Quiz questions are random, not adaptive
- No tracking of which letters users struggle with

### 4. Complex Streak Systems
- 5 different streak types with unclear purposes
- Legacy fields maintained for backwards compatibility
- Confusing for both developers and users

## Proposed Solutions

### Phase 1: Single Source of Truth (Priority: HIGH)

Create a unified state management system:

```typescript
// lib/state/unified-state.ts
interface UnifiedGameState {
  version: number; // For migrations
  user: {
    name: string;
    createdAt: string;
  };
  progress: {
    totalXP: number; // Single XP value
    // level calculated from totalXP
    achievements: string[];
    unlockedModes: string[];
  };
  stats: {
    totalQuizzesTaken: number;
    totalCorrectAnswers: number;
    totalIncorrectAnswers: number;
    globalBestStreak: number;
    dailyPracticeStreak: number;
    lastPlayedDate: string;
  };
  learning: {
    letterStates: { [letter: string]: LetterMemoryState };
    nextReviewDue: string;
  };
  preferences: {
    theme: 'light' | 'dark';
    soundEnabled: boolean;
    soundVolume: number;
  };
  dailyGoals: DailyGoalsState;
  quizHistory: QuizResult[];
}
```

Benefits:
- Single localStorage key: `nato_game_state_v3`
- Atomic updates prevent partial saves
- Easy backup/restore
- Clear migration path

### Phase 2: Centralized Level System (Priority: HIGH)

Remove all duplicate level calculations:

```typescript
// lib/core/level-system.ts
export class LevelSystem {
  static calculateLevel(totalXP: number): LevelInfo {
    // Single implementation
  }
  
  static getXPForLevel(level: number): number {
    // Reverse calculation
  }
  
  static getUnlockedModes(level: number): string[] {
    // Centralized unlock logic
  }
}
```

### Phase 3: Integrate Spaced Repetition (Priority: MEDIUM)

Make the quiz system adaptive:

```typescript
// lib/quiz/adaptive-quiz.ts
export class AdaptiveQuizSystem {
  constructor(private letterStates: LetterMemoryState) {}
  
  getNextQuestion(): Question {
    // Use SM-2 to pick letters that need review
    // Prioritize struggling letters
    // Mix in new letters appropriately
  }
  
  updateMemory(letter: string, correct: boolean) {
    // Update SM-2 memory state
  }
}
```

### Phase 4: Simplify Streaks (Priority: LOW)

Consolidate to 3 clear streak types:

1. **Quiz Streak** - Current quiz session only
2. **Best Streak** - All-time best
3. **Daily Streak** - Consecutive days played

Remove:
- currentStreak (deprecated field)
- Separate daily goal streak tracking

## Implementation Order

1. **Create state migration system** (lib/state/migrations.ts)
2. **Implement unified state manager** (lib/state/unified-state-manager.ts)
3. **Migrate existing components** one by one
4. **Remove old localStorage keys** after migration period
5. **Integrate spaced repetition** into quiz system
6. **Simplify streak tracking**

## Migration Strategy

```typescript
// On app load:
1. Check for new unified state
2. If not found, migrate from old keys:
   - Combine all localStorage data
   - Transform to new structure
   - Save as unified state
   - Mark old keys for deletion
3. After 30 days, remove migration code
```

## Testing Requirements

- Unit tests for all state transformations
- Integration tests for migration scenarios
- E2E tests for critical user flows
- Performance tests for state updates

## Success Metrics

- Zero state-related bug reports
- <50ms state update latency
- 100% successful migrations
- Improved quiz completion rates with adaptive learning