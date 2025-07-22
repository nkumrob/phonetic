# Simplified Streak System Documentation

## Overview

The NATO Phonetic Alphabet app now uses a simplified streak system with only 3 types of streaks:

### 1. Quiz Streak (Temporary)
- **What it tracks**: Consecutive correct answers within a single quiz session
- **When it resets**: On wrong answer or when quiz ends
- **Purpose**: Provides immediate feedback and XP multipliers during quiz
- **Display**: Only shown during active quiz
- **Icon**: 🔥

### 2. Best Streak (Permanent)
- **What it tracks**: Highest quiz streak ever achieved across all sessions
- **When it updates**: Only increases when quiz streak exceeds current best
- **Purpose**: Long-term achievement tracking and goals
- **Display**: Profile, practice hub, achievements
- **Icon**: 🏆

### 3. Daily Streak (Permanent)
- **What it tracks**: Consecutive days with at least one practice session
- **When it updates**: First activity each calendar day
- **When it resets**: After missing a full calendar day
- **Purpose**: Encourages daily practice habit
- **Display**: Profile, practice hub, daily goals
- **Icon**: 📅

## Implementation Details

### Storage
All streaks are stored in the unified state under `stats`:
```typescript
stats: {
  bestStreak: number;      // Highest streak ever
  dailyStreak: number;     // Consecutive days
  lastPlayedDate: string;  // For daily streak calculation
}
```

### Milestones
Each streak type has celebration milestones:
- **Quiz Streaks**: 5, 10, 20, 50
- **Daily Streaks**: 3, 7, 14, 30, 100

### Achievements
- **Streak Master**: Achieve a 20-answer quiz streak
- **Daily Player**: Practice for 7 consecutive days

## Migration from Old System

The previous system had 5 different streak types that caused confusion:
- ❌ Session Streak → ✅ Quiz Streak
- ❌ Global Best Streak → ✅ Best Streak  
- ❌ Daily Practice Streak → ✅ Daily Streak
- ❌ Daily Goal Streak → Removed (redundant)
- ❌ Current Streak → Removed (deprecated)

## Display Components

### UnifiedStreakDisplay
A new component that displays all streaks consistently:
```tsx
<UnifiedStreakDisplay 
  quizStreak={activeQuizStreak}
  bestStreak={stats.bestStreak}
  dailyStreak={stats.dailyStreak}
  variant="detailed" // or "compact"
/>
```

## Benefits of Simplification

1. **Clearer Purpose**: Each streak has a distinct, easy-to-understand purpose
2. **Consistent Naming**: No more confusion between similar terms
3. **Better UX**: Users can focus on meaningful progress metrics
4. **Easier Maintenance**: Less code duplication and clearer logic
5. **Unified Storage**: All streaks in one place with consistent structure