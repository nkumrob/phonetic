# Core Features to Preserve (Without Gamification)

## 1. Essential Learning Components

### Alphabet Grid (`/components/phonetic/alphabet-grid.tsx`)
- **Purpose**: Visual display of all 26 NATO phonetic letters
- **Core Features**:
  - Letter display with phonetic code words
  - Pronunciation guides
  - Audio playback for each letter
  - Keyboard navigation (arrow keys, Enter, S for speak)
  - Responsive grid layout
- **Keep**: All functionality except any XP/points references

### Phonetic Cards (`/components/phonetic/phonetic-card.tsx`)
- **Purpose**: Individual letter cards with interactive features
- **Core Features**:
  - Letter, code word, and pronunciation display
  - Audio playback button
  - Click/tap interaction
  - Visual hover effects
  - Keyboard accessibility
- **Keep**: All visual and interactive features

### Flashcards (`/components/learning/flashcards.tsx`)
- **Purpose**: Traditional flashcard study mode
- **Core Features**:
  - Flip animation between letter and code word
  - Navigation between cards (previous/next)
  - Keyboard shortcuts (arrows, space to flip)
  - Mnemonic display toggle
  - Study progress tracking (times reviewed per letter)
- **Keep**: Basic progress tracking without XP/achievements
- **Remove**: "Mastered" status, study mode rewards

## 2. Core Quiz/Practice Functionality

### Basic Quiz System
- **Purpose**: Test knowledge with multiple-choice questions
- **Essential Features**:
  - Question types:
    - Letter to code word
    - Code word to letter
    - Audio to code word
    - Spell words phonetically
  - Answer validation (correct/incorrect)
  - Quiz progress tracking (current question number)
  - Basic statistics (correct/incorrect count)
  - Pass/fail based on accuracy percentage
- **Keep**: Core quiz mechanics without XP system
- **Remove**: Streaks, XP gains, level-based difficulty, celebrations

### Practice Modes (Simplified)
1. **Learn Mode**: Flashcard-based learning
2. **Practice Mode**: Standard quiz (70% to pass)
3. **Challenge Mode**: Timed quiz (80% to pass)

## 3. Essential Navigation and UI Components

### Header (`/components/layout/header.tsx`)
- **Keep**:
  - Main navigation (Learn, Practice, Tools)
  - Settings link
  - Theme toggle
  - Mobile menu
- **Remove**: 
  - Level display
  - XP counter
  - Profile avatar with stats

### Basic UI Components
- Cards, buttons, inputs
- Loading states and skeletons
- Error boundaries
- Theme system (light/dark mode)

## 4. Basic Progress Tracking

### Quiz History (Simplified)
- **Data to Track**:
  - Quiz date/time
  - Mode (practice/challenge)
  - Questions answered (correct/incorrect)
  - Overall accuracy percentage
  - Average time per question
- **Storage**: Local storage or state management
- **No**: XP, levels, achievements, streaks

### Learning Progress
- **Flashcard Progress**: Times each letter has been reviewed
- **Quiz Performance**: Historical accuracy by letter
- **Last Practice Date**: For simple "days since last practice" metric

## 5. Essential Tools

### Text Converter (`/components/phonetic/text-converter.tsx`)
- **Purpose**: Convert regular text to NATO phonetic spelling
- **Features**:
  - Text input with character limit
  - Real-time conversion
  - Copy to clipboard
  - Share functionality
  - Conversion history
- **Keep**: All features as-is

### Reverse Lookup (`/components/phonetic/reverse-lookup.tsx`)
- **Purpose**: Search phonetic words to find letters
- **Features**:
  - Search with fuzzy matching
  - Autocomplete suggestions
  - Common misspelling support
  - Letter details display
  - Audio playback
- **Keep**: All features as-is

### Download Chart (`/components/phonetic/download-chart.tsx`)
- **Purpose**: Generate PDF reference chart
- **Keep**: As-is for offline reference

## 6. Settings (Simplified)

### Sound Settings
- Enable/disable sound effects
- Volume control
- Test sound button

### Theme Settings
- Light/dark/system theme selection

### Data Management
- Clear quiz history
- Reset learning progress
- Export/import data (if implemented)

## 7. Core Data Structure (Simplified)

```typescript
interface SimplifiedState {
  // Learning progress
  flashcardProgress: Record<string, number>; // letter -> review count
  letterAccuracy: Record<string, { correct: number; incorrect: number }>;
  
  // Quiz history
  quizHistory: Array<{
    date: string;
    mode: 'practice' | 'challenge';
    correct: number;
    incorrect: number;
    duration: number;
  }>;
  
  // User preferences
  preferences: {
    theme: 'light' | 'dark' | 'system';
    soundEnabled: boolean;
    soundVolume: number;
  };
  
  // Basic stats
  stats: {
    totalQuizzes: number;
    totalCorrect: number;
    totalIncorrect: number;
    lastPracticeDate: string;
  };
}
```

## 8. Features to Completely Remove

- XP system and calculations
- Level system and progression
- Achievements and badges
- Daily goals and challenges
- Streak tracking and bonuses
- Gamification animations (celebrations, fireworks)
- Level-up ceremonies
- XP gain animations
- Multipliers and combo systems
- Unlockable content based on levels
- Competitive elements
- Reward systems
- Profile customization (avatars, titles)
- Leaderboards or rankings

## 9. UI Simplifications

- Remove all progress bars related to XP/levels
- Simplify quiz results to show only accuracy
- Remove motivational messages about XP/streaks
- Clean up empty spaces from removed gamification elements
- Focus on clear, educational feedback