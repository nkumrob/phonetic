/**
 * Spaced Repetition Algorithm based on SM-2
 * Optimized for NATO phonetic alphabet learning
 */

export interface LetterMemoryState {
  letter: string;
  firstSeen: string | null;
  lastSeen: string | null;
  timesSeen: number;
  timesCorrect: number;
  timesIncorrect: number;
  currentInterval: number; // hours until next review
  easinessFactor: number; // 1.3 to 2.5
  consecutiveCorrect: number;
  stage: 'new' | 'learning' | 'review' | 'mastered';
  nextReviewDate: string;
  averageResponseTime: number; // milliseconds
  contextsSeen: string[]; // 'letter-to-code', 'code-to-letter', 'audio', 'spell'
}

export type PerformanceRating = 'again' | 'hard' | 'good' | 'easy';

const INITIAL_INTERVALS = {
  again: 0.01, // 36 seconds
  hard: 0.1,   // 6 minutes
  good: 0.5,   // 30 minutes
  easy: 2,     // 2 hours
};

const GRADUATING_INTERVAL = 24; // 1 day
const EASY_BONUS = 1.3;
const MINIMUM_EASE = 1.3;
const MAXIMUM_EASE = 2.5;

export class SpacedRepetitionEngine {
  /**
   * Initialize a new letter in the system
   */
  static createLetterState(letter: string): LetterMemoryState {
    return {
      letter,
      firstSeen: null,
      lastSeen: null,
      timesSeen: 0,
      timesCorrect: 0,
      timesIncorrect: 0,
      currentInterval: 0,
      easinessFactor: 2.5,
      consecutiveCorrect: 0,
      stage: 'new',
      nextReviewDate: new Date().toISOString(),
      averageResponseTime: 0,
      contextsSeen: [],
    };
  }

  /**
   * Calculate the next review interval based on performance
   */
  static calculateNextInterval(
    state: LetterMemoryState,
    performance: PerformanceRating,
    responseTime: number
  ): LetterMemoryState {
    const now = new Date();
    const updatedState = { ...state };

    // Update basic counters
    updatedState.timesSeen++;
    updatedState.lastSeen = now.toISOString();
    
    if (!updatedState.firstSeen) {
      updatedState.firstSeen = now.toISOString();
    }

    // Update response time average
    if (updatedState.averageResponseTime === 0) {
      updatedState.averageResponseTime = responseTime;
    } else {
      updatedState.averageResponseTime = 
        (updatedState.averageResponseTime * (updatedState.timesSeen - 1) + responseTime) / 
        updatedState.timesSeen;
    }

    // Handle performance rating
    switch (performance) {
      case 'again':
        updatedState.timesIncorrect++;
        updatedState.consecutiveCorrect = 0;
        updatedState.currentInterval = INITIAL_INTERVALS.again;
        updatedState.easinessFactor = Math.max(
          MINIMUM_EASE,
          updatedState.easinessFactor - 0.2
        );
        updatedState.stage = 'learning';
        break;

      case 'hard':
        updatedState.timesCorrect++;
        updatedState.consecutiveCorrect++;
        if (updatedState.stage === 'new') {
          updatedState.currentInterval = INITIAL_INTERVALS.hard;
          updatedState.stage = 'learning';
        } else {
          updatedState.currentInterval *= 0.6;
        }
        updatedState.easinessFactor = Math.max(
          MINIMUM_EASE,
          updatedState.easinessFactor - 0.15
        );
        break;

      case 'good':
        updatedState.timesCorrect++;
        updatedState.consecutiveCorrect++;
        
        if (updatedState.stage === 'new') {
          updatedState.currentInterval = INITIAL_INTERVALS.good;
          updatedState.stage = 'learning';
        } else if (updatedState.stage === 'learning') {
          if (updatedState.consecutiveCorrect >= 2) {
            updatedState.currentInterval = GRADUATING_INTERVAL;
            updatedState.stage = 'review';
          } else {
            updatedState.currentInterval *= 2;
          }
        } else {
          updatedState.currentInterval *= updatedState.easinessFactor;
        }
        break;

      case 'easy':
        updatedState.timesCorrect++;
        updatedState.consecutiveCorrect++;
        updatedState.easinessFactor = Math.min(
          MAXIMUM_EASE,
          updatedState.easinessFactor + 0.15
        );
        
        if (updatedState.stage === 'new' || updatedState.stage === 'learning') {
          updatedState.currentInterval = INITIAL_INTERVALS.easy;
          updatedState.stage = 'review';
        } else {
          updatedState.currentInterval *= updatedState.easinessFactor * EASY_BONUS;
        }
        break;
    }

    // Check for mastery
    if (
      updatedState.stage === 'review' &&
      updatedState.consecutiveCorrect >= 5 &&
      updatedState.currentInterval >= 168 && // 7 days
      updatedState.easinessFactor >= 2.0
    ) {
      updatedState.stage = 'mastered';
    }

    // Calculate next review date
    const nextReview = new Date(now.getTime() + updatedState.currentInterval * 60 * 60 * 1000);
    updatedState.nextReviewDate = nextReview.toISOString();

    return updatedState;
  }

  /**
   * Get letters that are due for review
   */
  static getDueLetters(letters: LetterMemoryState[]): LetterMemoryState[] {
    const now = new Date();
    return letters
      .filter(letter => new Date(letter.nextReviewDate) <= now)
      .sort((a, b) => {
        // Prioritize new letters, then by how overdue they are
        if (a.stage === 'new' && b.stage !== 'new') return -1;
        if (b.stage === 'new' && a.stage !== 'new') return 1;
        
        const aOverdue = now.getTime() - new Date(a.nextReviewDate).getTime();
        const bOverdue = now.getTime() - new Date(b.nextReviewDate).getTime();
        return bOverdue - aOverdue;
      });
  }

  /**
   * Get performance rating based on response time and accuracy
   */
  static getPerformanceRating(
    correct: boolean,
    responseTime: number,
    averageTime: number
  ): PerformanceRating {
    if (!correct) return 'again';
    
    const timeRatio = responseTime / averageTime;
    
    if (timeRatio <= 0.6) return 'easy';
    if (timeRatio <= 1.2) return 'good';
    return 'hard';
  }

  /**
   * Calculate letter difficulty score for adaptive learning
   */
  static getLetterDifficulty(state: LetterMemoryState): number {
    if (state.timesSeen === 0) return 0.5; // Unknown difficulty
    
    const accuracy = state.timesCorrect / state.timesSeen;
    const speedFactor = Math.min(state.averageResponseTime / 3000, 1); // 3 seconds as baseline
    
    // Combine accuracy and speed (weighted more towards accuracy)
    return (1 - accuracy) * 0.7 + speedFactor * 0.3;
  }

  /**
   * Get recommended context for next review
   */
  static getRecommendedContext(state: LetterMemoryState): string {
    const contexts = ['letter-to-code', 'code-to-letter', 'audio', 'spell'];
    
    // Find least seen context
    const contextCounts = contexts.map(context => ({
      context,
      count: state.contextsSeen.filter(c => c === context).length
    }));
    
    contextCounts.sort((a, b) => a.count - b.count);
    
    // If struggling, stick with easier contexts
    if (state.consecutiveCorrect < 2) {
      return 'letter-to-code';
    }
    
    // Otherwise, vary the context
    return contextCounts[0].context;
  }

  /**
   * Generate practice session based on due letters and performance
   */
  static generateSession(
    allLetters: LetterMemoryState[],
    sessionLength: number = 10
  ): LetterMemoryState[] {
    const dueLetters = this.getDueLetters(allLetters);
    const session: LetterMemoryState[] = [];
    
    // First, add all overdue letters (up to session length)
    for (let i = 0; i < Math.min(dueLetters.length, sessionLength * 0.7); i++) {
      session.push(dueLetters[i]);
    }
    
    // Then add struggling letters
    if (session.length < sessionLength) {
      const strugglingLetters = allLetters
        .filter(l => !session.includes(l))
        .filter(l => l.stage !== 'mastered')
        .sort((a, b) => this.getLetterDifficulty(b) - this.getLetterDifficulty(a));
      
      for (let i = 0; i < Math.min(strugglingLetters.length, sessionLength - session.length); i++) {
        session.push(strugglingLetters[i]);
      }
    }
    
    // Fill remaining with random review
    if (session.length < sessionLength) {
      const reviewLetters = allLetters
        .filter(l => !session.includes(l))
        .filter(l => l.timesSeen > 0);
      
      while (session.length < sessionLength && reviewLetters.length > 0) {
        const randomIndex = Math.floor(Math.random() * reviewLetters.length);
        session.push(reviewLetters[randomIndex]);
        reviewLetters.splice(randomIndex, 1);
      }
    }
    
    // Shuffle for variety (but keep due letters in first half)
    const firstHalf = session.slice(0, Math.ceil(session.length / 2));
    const secondHalf = session.slice(Math.ceil(session.length / 2));
    
    return [
      ...firstHalf.sort(() => Math.random() - 0.5),
      ...secondHalf.sort(() => Math.random() - 0.5)
    ];
  }
}