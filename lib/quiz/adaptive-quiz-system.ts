/**
 * Adaptive Quiz System using Spaced Repetition
 * Intelligently selects questions based on user's learning progress
 */

import { NATO_ALPHABET } from '@/lib/constants/phonetic-alphabet';
import { SpacedRepetitionEngine, LetterMemoryState as SpacedLetterMemoryState } from '@/lib/algorithms/spaced-repetition';

export interface AdaptiveQuestion {
  type: 'letter-to-code' | 'code-to-letter' | 'audio-to-code' | 'spell-word';
  letter: string;
  code: string;
  question: string;
  correctAnswer: string;
  options?: string[];
  difficulty: number;
}

export class AdaptiveQuizSystem {
  private letterStates: Map<string, SpacedLetterMemoryState>;
  
  constructor(existingStates?: Record<string, SpacedLetterMemoryState>) {
    this.letterStates = new Map();
    
    // Initialize all letters
    NATO_ALPHABET.forEach(({ letter }) => {
      if (existingStates && existingStates[letter]) {
        this.letterStates.set(letter, existingStates[letter]);
      } else {
        this.letterStates.set(letter, SpacedRepetitionEngine.createLetterState(letter));
      }
    });
  }
  
  /**
   * Get the next question based on spaced repetition algorithm
   */
  getNextQuestion(mode: 'learn' | 'practice' | 'challenge'): AdaptiveQuestion {
    const allStates = Array.from(this.letterStates.values());
    const dueLetters = SpacedRepetitionEngine.getDueLetters(allStates);
    
    // Select letter based on mode
    let selectedLetter: SpacedLetterMemoryState;
    
    if (mode === 'learn') {
      // Focus on new and learning letters
      const newLetters = allStates.filter(l => l.stage === 'new' || l.stage === 'learning');
      selectedLetter = newLetters.length > 0 
        ? newLetters[Math.floor(Math.random() * newLetters.length)]
        : dueLetters[0] || allStates[0];
    } else if (dueLetters.length > 0) {
      // Prioritize due letters
      selectedLetter = dueLetters[0];
    } else {
      // Random selection weighted by difficulty
      selectedLetter = this.selectWeightedByDifficulty(allStates);
    }
    
    // Get recommended context
    const context = SpacedRepetitionEngine.getRecommendedContext(selectedLetter);
    
    // Generate question
    return this.generateQuestion(selectedLetter.letter, context as AdaptiveQuestion['type'], mode);
  }
  
  /**
   * Generate a session of questions
   */
  generateSession(mode: 'learn' | 'practice' | 'challenge', length: number = 10): AdaptiveQuestion[] {
    const allStates = Array.from(this.letterStates.values());
    const sessionLetters = SpacedRepetitionEngine.generateSession(allStates, length);
    
    return sessionLetters.map(letterState => {
      const context = SpacedRepetitionEngine.getRecommendedContext(letterState);
      return this.generateQuestion(letterState.letter, context as AdaptiveQuestion['type'], mode);
    });
  }
  
  /**
   * Update letter state based on quiz performance
   */
  updatePerformance(
    letter: string,
    correct: boolean,
    responseTime: number,
    questionType: AdaptiveQuestion['type']
  ): void {
    const state = this.letterStates.get(letter);
    if (!state) return;
    
    // Calculate performance rating
    const avgTime = state.averageResponseTime || 3000; // Default 3 seconds
    const rating = SpacedRepetitionEngine.getPerformanceRating(correct, responseTime, avgTime);
    
    // Update state
    const updatedState = SpacedRepetitionEngine.calculateNextInterval(state, rating, responseTime);
    
    // Track context
    updatedState.contextsSeen.push(questionType);
    
    // Update in memory
    this.letterStates.set(letter, updatedState);
    
    // Persist to unified state
    this.persistToUnifiedState();
  }
  
  /**
   * Generate a specific question for a letter
   */
  private generateQuestion(
    letter: string,
    type: AdaptiveQuestion['type'],
    mode: 'learn' | 'practice' | 'challenge'
  ): AdaptiveQuestion {
    const natoEntry = NATO_ALPHABET.find(n => n.letter === letter)!;
    const difficulty = SpacedRepetitionEngine.getLetterDifficulty(this.letterStates.get(letter)!);
    
    switch (type) {
      case 'letter-to-code':
        return {
          type,
          letter,
          code: natoEntry.codeWord,
          question: `What is the NATO phonetic code for "${letter}"?`,
          correctAnswer: natoEntry.codeWord,
          options: this.generateOptions(natoEntry.codeWord, 'code', mode),
          difficulty,
        };
        
      case 'code-to-letter':
        return {
          type,
          letter,
          code: natoEntry.codeWord,
          question: `Which letter does "${natoEntry.codeWord}" represent?`,
          correctAnswer: letter,
          options: this.generateOptions(letter, 'letter', mode),
          difficulty,
        };
        
      case 'audio-to-code':
        return {
          type,
          letter,
          code: natoEntry.codeWord,
          question: `Listen and identify the NATO code word`,
          correctAnswer: natoEntry.codeWord,
          options: this.generateOptions(natoEntry.codeWord, 'code', mode),
          difficulty,
        };
        
      case 'spell-word':
        const word = this.generateRandomWord(mode);
        const phonetic = word.split('').map(l => 
          NATO_ALPHABET.find(n => n.letter === l.toUpperCase())?.codeWord || l
        ).join(' ');
        
        return {
          type,
          letter: word, // Using letter field for the word
          code: phonetic,
          question: `Spell "${word}" using NATO phonetic alphabet`,
          correctAnswer: phonetic,
          difficulty,
        };
    }
  }
  
  /**
   * Generate distractor options
   */
  private generateOptions(
    correct: string,
    type: 'code' | 'letter',
    mode: 'learn' | 'practice' | 'challenge'
  ): string[] {
    const optionCount = mode === 'challenge' ? 6 : 4;
    const options = [correct];
    
    if (type === 'code') {
      // Get similar sounding codes based on difficulty
      const allCodes = NATO_ALPHABET.map(n => n.codeWord).filter(c => c !== correct);
      const similarCodes = this.getSimilarCodes(correct);
      
      // Add similar codes first (harder)
      while (options.length < optionCount && similarCodes.length > 0) {
        const idx = Math.floor(Math.random() * similarCodes.length);
        options.push(similarCodes[idx]);
        similarCodes.splice(idx, 1);
      }
      
      // Fill with random codes
      while (options.length < optionCount && allCodes.length > 0) {
        const idx = Math.floor(Math.random() * allCodes.length);
        if (!options.includes(allCodes[idx])) {
          options.push(allCodes[idx]);
        }
        allCodes.splice(idx, 1);
      }
    } else {
      // Letter options
      const allLetters = NATO_ALPHABET.map(n => n.letter).filter(l => l !== correct);
      
      while (options.length < optionCount && allLetters.length > 0) {
        const idx = Math.floor(Math.random() * allLetters.length);
        options.push(allLetters[idx]);
        allLetters.splice(idx, 1);
      }
    }
    
    // Shuffle options
    return options.sort(() => Math.random() - 0.5);
  }
  
  /**
   * Get phonetically similar codes for harder distractors
   */
  private getSimilarCodes(code: string): string[] {
    const similarGroups = [
      ['Alpha', 'Delta'],
      ['Bravo', 'Charlie'],
      ['Echo', 'X-ray'],
      ['Foxtrot', 'Golf'],
      ['Hotel', 'Juliet'],
      ['Mike', 'November'],
      ['Oscar', 'Papa'],
      ['Quebec', 'Kilo'],
      ['Sierra', 'Tango'],
      ['Victor', 'Whiskey'],
    ];
    
    const group = similarGroups.find(g => g.includes(code));
    return group ? group.filter(c => c !== code) : [];
  }
  
  /**
   * Generate a random word for spelling challenges
   */
  private generateRandomWord(mode: 'learn' | 'practice' | 'challenge'): string {
    const words = {
      learn: ['CAT', 'DOG', 'SUN', 'BAT'],
      practice: ['RADIO', 'PILOT', 'TOWER', 'CLEAR'],
      challenge: ['AVIATION', 'NAVIGATE', 'EMERGENCY', 'BROADCAST'],
    };
    
    const wordList = words[mode];
    return wordList[Math.floor(Math.random() * wordList.length)];
  }
  
  /**
   * Select letter weighted by difficulty
   */
  private selectWeightedByDifficulty(states: SpacedLetterMemoryState[]): SpacedLetterMemoryState {
    // Calculate weights based on difficulty
    const weights = states.map(state => ({
      state,
      weight: SpacedRepetitionEngine.getLetterDifficulty(state) + 0.1, // +0.1 to ensure positive
    }));
    
    // Calculate cumulative weights
    let totalWeight = 0;
    const cumulative = weights.map(w => {
      totalWeight += w.weight;
      return { state: w.state, cumWeight: totalWeight };
    });
    
    // Random selection
    const random = Math.random() * totalWeight;
    const selected = cumulative.find(c => c.cumWeight >= random);
    
    return selected?.state || states[0];
  }
  
  /**
   * Persist letter states to unified state
   */
  private persistToUnifiedState(): void {
    // TODO: Convert SpacedLetterMemoryState to LetterMemoryState for persistence
    // Currently these are different types and not compatible
    // const letterStatesObj: Record<string, LetterMemoryState> = {};
    // this.letterStates.forEach((state, letter) => {
    //   letterStatesObj[letter] = state;
    // });
    
    // unifiedStateManager.update('learning', (learning) => ({
    //   ...learning,
    //   letterStates: letterStatesObj,
    // }));
  }
  
  /**
   * Get learning statistics
   */
  getStatistics(): {
    mastered: number;
    learning: number;
    new: number;
    averageAccuracy: number;
    nextReviewIn: string;
  } {
    const states = Array.from(this.letterStates.values());
    
    const mastered = states.filter(s => s.stage === 'mastered').length;
    const learning = states.filter(s => s.stage === 'learning' || s.stage === 'review').length;
    const newLetters = states.filter(s => s.stage === 'new').length;
    
    const totalAttempts = states.reduce((sum, s) => sum + s.timesSeen, 0);
    const totalCorrect = states.reduce((sum, s) => sum + s.timesCorrect, 0);
    const averageAccuracy = totalAttempts > 0 ? (totalCorrect / totalAttempts) * 100 : 0;
    
    // Find next review
    const now = new Date();
    const nextReview = states
      .map(s => new Date(s.nextReviewDate))
      .filter(d => d > now)
      .sort((a, b) => a.getTime() - b.getTime())[0];
    
    const nextReviewIn = nextReview 
      ? this.formatTimeUntil(nextReview)
      : 'No reviews scheduled';
    
    return {
      mastered,
      learning,
      new: newLetters,
      averageAccuracy: Math.round(averageAccuracy),
      nextReviewIn,
    };
  }
  
  /**
   * Format time until date
   */
  private formatTimeUntil(date: Date): string {
    const diff = date.getTime() - new Date().getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''}`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''}`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''}`;
    return 'Now';
  }
}