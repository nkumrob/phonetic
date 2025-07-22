// Intelligent distractor generation for NATO phonetic alphabet quiz
// Makes the quiz genuinely challenging by including similar options

interface Distractor {
  word: string;
  type: 'phonetic' | 'civilian' | 'similar' | 'common_mistake' | 'random';
  difficulty: number; // 1-5, higher = more confusing
}

// Common civilian alternatives people might know
const CIVILIAN_ALTERNATIVES: Record<string, string[]> = {
  'A': ['Apple', 'Able', 'Adam', 'Andrew', 'America'],
  'B': ['Boy', 'Bob', 'Baker', 'Boston', 'Blue'],
  'C': ['Cat', 'Charles', 'Chicago', 'Canada', 'Car'],
  'D': ['Dog', 'David', 'Denver', 'Dallas', 'Door'],
  'E': ['Easy', 'Edward', 'Eagle', 'England', 'Egg'],
  'F': ['Frank', 'Fox', 'France', 'Fire', 'Fred'],
  'G': ['George', 'Good', 'Green', 'Germany', 'Gun'],
  'H': ['Henry', 'House', 'Harry', 'Happy', 'Horse'],
  'I': ['Item', 'Ice', 'Ivan', 'Italy', 'Island'],
  'J': ['John', 'Jack', 'James', 'Japan', 'Jelly'],
  'K': ['King', 'Kitchen', 'Kevin', 'Kansas', 'Key'],
  'L': ['Love', 'London', 'Larry', 'Lion', 'Lake'],
  'M': ['Mary', 'Mother', 'Monday', 'Mexico', 'Mouse'],
  'N': ['Nancy', 'New York', 'North', 'Night', 'Nora'],
  'O': ['Orange', 'Oliver', 'Ocean', 'October', 'Open'],
  'P': ['Peter', 'Paul', 'Paris', 'Phone', 'Pink'],
  'Q': ['Queen', 'Quick', 'Quiet', 'Question', 'Quail'],
  'R': ['Robert', 'Roger', 'Red', 'Radio', 'Rain'],
  'S': ['Sam', 'Sugar', 'Steve', 'Sun', 'South'],
  'T': ['Tom', 'Thomas', 'Time', 'Texas', 'Tree'],
  'U': ['Uncle', 'Under', 'United', 'Up', 'Umbrella'],
  'V': ['Victory', 'Van', 'Violet', 'Virginia', 'Voice'],
  'W': ['William', 'Water', 'White', 'West', 'Window'],
  'X': ['X-ray', 'Extra', 'Xavier', 'Example', 'Exit'],
  'Y': ['Yellow', 'Yes', 'Young', 'Yesterday', 'Yard'],
  'Z': ['Zebra', 'Zero', 'Zone', 'Zip', 'Zoo']
};

// Phonetically similar words that could confuse
const PHONETIC_SIMILAR: Record<string, string[]> = {
  'Alpha': ['Alfa', 'Alpine', 'Alta', 'Alpaca', 'Alamo'],
  'Bravo': ['Brave', 'Bruno', 'Bronco', 'Brava', 'Brando'],
  'Charlie': ['Charles', 'Charlotte', 'Charley', 'Charter', 'Charly'],
  'Delta': ['Della', 'Denver', 'Delco', 'Dallas', 'Delmar'],
  'Echo': ['Eco', 'Ecko', 'Eagle', 'Ekko', 'Elco'],
  'Foxtrot': ['Fox', 'Foxfire', 'Foxtail', 'Foxboro', 'Foxhunt'],
  'Golf': ['Gulf', 'Gold', 'Gulfport', 'Goff', 'Gull'],
  'Hotel': ['Hostel', 'Hotline', 'Motel', 'Howell', 'Hotal'],
  'India': ['Indiana', 'Indigo', 'Indian', 'Indica', 'Indie'],
  'Juliet': ['Julia', 'Julie', 'Julio', 'Julius', 'Juliette'],
  'Kilo': ['Kilogram', 'Kylo', 'Kello', 'Keto', 'Keno'],
  'Lima': ['Limo', 'Lemon', 'Llama', 'Loma', 'Lina'],
  'Mike': ['Michael', 'Mickey', 'Mick', 'Miguel', 'Mikey'],
  'November': ['December', 'October', 'November', 'Novella', 'Nova'],
  'Oscar': ['Oskar', 'Oslo', 'Osaka', 'Ozcar', 'Asher'],
  'Papa': ['Pappa', 'Paper', 'Papal', 'Popa', 'Poppa'],
  'Quebec': ['Quebec', 'Kubrick', 'Cubic', 'Quebeq', 'Quebeck'],
  'Romeo': ['Roman', 'Romero', 'Roma', 'Romo', 'Romano'],
  'Sierra': ['Cierra', 'Sarah', 'Sera', 'Sienna', 'Siera'],
  'Tango': ['Tongo', 'Tanto', 'Tangle', 'Mango', 'Django'],
  'Uniform': ['Unicorn', 'Union', 'United', 'Universal', 'Unity'],
  'Victor': ['Victoria', 'Vicker', 'Vector', 'Victer', 'Viktor'],
  'Whiskey': ['Whisky', 'Whitney', 'Whisk', 'Wesley', 'Wiskey'],
  'X-ray': ['Xray', 'Ex-ray', 'X-Rey', 'X Ray', 'Exray'],
  'Yankee': ['Yanky', 'Yankies', 'Yank', 'Yankie', 'Yankees'],
  'Zulu': ['Zebra', 'Zeus', 'Zoom', 'Zero', 'Zuzu']
};

// Common mistakes people make
const COMMON_MISTAKES: Record<string, string[]> = {
  'I': ['Igloo', 'Idaho', 'Ivan', 'Italy', 'Indigo'],
  'J': ['Jack', 'James', 'John', 'Japan', 'Jet'],
  'M': ['Mother', 'Michael', 'Mary', 'Monday', 'Mexico'],
  'N': ['Nancy', 'Nora', 'Nick', 'North', 'Navy'],
  'P': ['Peter', 'Paul', 'Patrick', 'Paris', 'Phone'],
  'S': ['Sam', 'Steve', 'Sugar', 'South', 'Simon'],
  'U': ['Uncle', 'Under', 'United', 'Umbrella', 'Utah'],
  'W': ['William', 'Walter', 'Washington', 'Water', 'West']
};

export class DistractorGenerator {
  private static readonly NATO_MAP = new Map([
    ['A', 'Alpha'], ['B', 'Bravo'], ['C', 'Charlie'], ['D', 'Delta'],
    ['E', 'Echo'], ['F', 'Foxtrot'], ['G', 'Golf'], ['H', 'Hotel'],
    ['I', 'India'], ['J', 'Juliet'], ['K', 'Kilo'], ['L', 'Lima'],
    ['M', 'Mike'], ['N', 'November'], ['O', 'Oscar'], ['P', 'Papa'],
    ['Q', 'Quebec'], ['R', 'Romeo'], ['S', 'Sierra'], ['T', 'Tango'],
    ['U', 'Uniform'], ['V', 'Victor'], ['W', 'Whiskey'], ['X', 'X-ray'],
    ['Y', 'Yankee'], ['Z', 'Zulu']
  ]);

  /**
   * Generate intelligent distractors for a letter-to-code question
   */
  static generateForLetterToCode(
    letter: string, 
    correctAnswer: string, 
    difficulty: 'easy' | 'medium' | 'hard' = 'medium'
  ): string[] {
    const distractors: Distractor[] = [];
    
    // Always include some civilian alternatives
    const civilianOptions = CIVILIAN_ALTERNATIVES[letter] || [];
    civilianOptions.forEach(word => {
      distractors.push({ word, type: 'civilian', difficulty: 2 });
    });

    // Add phonetically similar words
    const phoneticSimilar = PHONETIC_SIMILAR[correctAnswer] || [];
    phoneticSimilar.forEach(word => {
      distractors.push({ word, type: 'phonetic', difficulty: 4 });
    });

    // Add common mistakes
    const mistakes = COMMON_MISTAKES[letter] || [];
    mistakes.forEach(word => {
      distractors.push({ word, type: 'common_mistake', difficulty: 3 });
    });

    // Based on difficulty, select different mix
    let selectedDistractors: string[] = [];
    
    switch (difficulty) {
      case 'easy':
        // Mix of obvious wrong answers with 1-2 that start with same letter
        selectedDistractors = this.selectEasyDistractors(letter, correctAnswer, distractors);
        break;
      
      case 'medium':
        // All start with same letter, mix of types
        selectedDistractors = this.selectMediumDistractors(letter, correctAnswer, distractors);
        break;
      
      case 'hard':
        // Very similar options, all plausible
        selectedDistractors = this.selectHardDistractors(letter, correctAnswer, distractors);
        break;
    }

    return this.shuffleArray(selectedDistractors).slice(0, 3);
  }

  /**
   * Generate distractors for code-to-letter questions
   */
  static generateForCodeToLetter(
    codeWord: string,
    correctLetter: string,
    difficulty: 'easy' | 'medium' | 'hard' = 'medium'
  ): string[] {
    const allLetters = Array.from(this.NATO_MAP.keys());
    let candidates: string[] = [];

    switch (difficulty) {
      case 'easy':
        // Random letters, clearly different
        candidates = allLetters
          .filter(l => l !== correctLetter)
          .sort(() => Math.random() - 0.5)
          .slice(0, 3);
        break;

      case 'medium':
        // Letters with similar sounding code words
        candidates = this.getLettersWithSimilarCodeWords(codeWord, correctLetter);
        break;

      case 'hard':
        // Visually similar letters or sequential
        candidates = this.getVisuallySimilarLetters(correctLetter);
        break;
    }

    return candidates.slice(0, 3);
  }

  private static selectEasyDistractors(
    letter: string,
    correctAnswer: string,
    distractors: Distractor[]
  ): string[] {
    const result: string[] = [];
    
    // Add 1-2 that start with the same letter
    const sameLetterOptions = distractors
      .filter(d => d.word.startsWith(letter) && d.word !== correctAnswer)
      .slice(0, 2);
    result.push(...sameLetterOptions.map(d => d.word));

    // Add random NATO words from other letters
    const otherNATOWords = Array.from(this.NATO_MAP.entries())
      .filter(([l]) => l !== letter)
      .map(([, word]) => word)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3 - result.length);
    
    result.push(...otherNATOWords);
    return result;
  }

  private static selectMediumDistractors(
    letter: string,
    correctAnswer: string,
    distractors: Distractor[]
  ): string[] {
    const result: string[] = [];
    
    // Prioritize same starting letter
    const sameLetterOptions = distractors
      .filter(d => d.word.startsWith(letter) && d.word !== correctAnswer)
      .sort((a, b) => b.difficulty - a.difficulty);

    // Take best distractors
    result.push(...sameLetterOptions.slice(0, 3).map(d => d.word));

    // If not enough, add some phonetically similar
    if (result.length < 3) {
      const phoneticOptions = distractors
        .filter(d => d.type === 'phonetic' && !result.includes(d.word))
        .slice(0, 3 - result.length);
      result.push(...phoneticOptions.map(d => d.word));
    }

    return result;
  }

  private static selectHardDistractors(
    letter: string,
    correctAnswer: string,
    distractors: Distractor[]
  ): string[] {
    const result: string[] = [];
    
    // Prioritize most confusing options
    const sorted = distractors
      .filter(d => d.word !== correctAnswer)
      .sort((a, b) => b.difficulty - a.difficulty);

    // Mix of different types for maximum confusion
    const phonetic = sorted.find(d => d.type === 'phonetic');
    const mistake = sorted.find(d => d.type === 'common_mistake');
    const civilian = sorted.find(d => d.type === 'civilian' && d.word.startsWith(letter));

    if (phonetic) result.push(phonetic.word);
    if (mistake) result.push(mistake.word);
    if (civilian) result.push(civilian.word);

    // Fill remaining with highest difficulty
    const remaining = sorted
      .filter(d => !result.includes(d.word))
      .slice(0, 3 - result.length);
    result.push(...remaining.map(d => d.word));

    return result;
  }

  private static getLettersWithSimilarCodeWords(
    codeWord: string,
    correctLetter: string
  ): string[] {
    // Find letters whose code words sound similar
    const similarPatterns: Record<string, string[]> = {
      'Alpha': ['E', 'O'], // Echo, Oscar
      'Bravo': ['D', 'E'], // Delta, Echo  
      'Charlie': ['S', 'T'], // Sierra, Tango
      'Delta': ['A', 'Z'], // Alpha, Zulu
      'Echo': ['B', 'O'], // Bravo, Oscar
      'Mike': ['N', 'K'], // November, Kilo
      'November': ['D', 'M'], // December sound, Mike
      'Oscar': ['A', 'E'], // Alpha, Echo
      'Papa': ['B', 'T'], // Bravo, Tango
      'Sierra': ['C', 'Z'], // Charlie, Zulu
      'Tango': ['C', 'P'], // Charlie, Papa
      'Victor': ['B', 'W'], // Bravo, Whiskey
      'Whiskey': ['V', 'Y'], // Victor, Yankee
      'Yankee': ['W', 'Z'], // Whiskey, Zulu
      'Zulu': ['S', 'Y'] // Sierra, Yankee
    };

    const similar = similarPatterns[codeWord] || [];
    const allLetters = Array.from(this.NATO_MAP.keys());
    
    return [...similar, ...allLetters.filter(l => l !== correctLetter && !similar.includes(l))]
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
  }

  private static getVisuallySimilarLetters(letter: string): string[] {
    const visualGroups: string[][] = [
      ['B', 'D', 'P', 'R'],
      ['C', 'G', 'O', 'Q'],
      ['E', 'F', 'L'],
      ['H', 'N', 'M'],
      ['I', 'J', 'L'],
      ['U', 'V', 'W'],
      ['X', 'Y', 'K']
    ];

    const group = visualGroups.find(g => g.includes(letter)) || [];
    const similar = group.filter(l => l !== letter);
    
    const sequential = [
      String.fromCharCode(letter.charCodeAt(0) - 1),
      String.fromCharCode(letter.charCodeAt(0) + 1)
    ].filter(l => l >= 'A' && l <= 'Z' && l !== letter);

    return [...similar, ...sequential]
      .filter((l, i, arr) => arr.indexOf(l) === i)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
  }

  private static shuffleArray<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
}

// Difficulty adjustment based on user level
export function getQuizDifficulty(userLevel: number): 'easy' | 'medium' | 'hard' {
  if (userLevel < 5) return 'easy';
  if (userLevel < 15) return 'medium';
  return 'hard';
}