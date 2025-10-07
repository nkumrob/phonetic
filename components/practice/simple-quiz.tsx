'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui';
import { NATO_ALPHABET } from '@/lib/constants/phonetic-alphabet';
import { cn } from '@/lib/utils/cn';
import { useSimpleAppState } from '@/lib/contexts/simple-app-context';
import { speechManager } from '@/lib/utils/speech-synthesis';

type QuizMode = 'practice' | 'challenge';
type QuestionType = 'letter-to-code' | 'code-to-letter' | 'audio-to-code' | 'spell-word';

interface Question {
  id: string;
  type: QuestionType;
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  letter: string; // Track which letter for stats
}

interface SimpleQuizProps {
  mode: QuizMode;
  onComplete: () => void;
}

export function SimpleQuiz({ mode, onComplete }: SimpleQuizProps) {
  const { state, addQuizResult, updateLetterStats } = useSimpleAppState();
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [questionNumber, setQuestionNumber] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [timer, setTimer] = useState(0);
  const [questionTimer, setQuestionTimer] = useState<number | null>(null);
  const [isQuizActive, setIsQuizActive] = useState(false);
  const [quizStartTime] = useState(Date.now());
  // const [answeredLetters, setAnsweredLetters] = useState<Record<string, boolean>>({});

  const totalQuestions = 10;
  const timePerQuestion = mode === 'challenge' ? 30 : null;
  const passingScore = mode === 'challenge' ? 80 : 70;

  // Create challenging distractors that are phonetically similar or commonly confused
  const generateDistractors = (correct: string, correctLetter: string, count: number = 3): string[] => {
    const distractors: string[] = [];
    
    // Define phonetically similar groups and commonly confused pairs
    const phoneticGroups: Record<string, string[]> = {
      // Similar sounding words
      'Alpha': ['Alfa', 'Echo', 'Delta'],
      'Bravo': ['Charlie', 'Delta', 'Papa'],
      'Charlie': ['Bravo', 'Sierra', 'Tango'],
      'Delta': ['Alpha', 'Echo', 'Bravo'],
      'Echo': ['Alpha', 'Delta', 'X-ray'],
      'Foxtrot': ['Fox', 'Golf', 'Victor'],
      'Golf': ['Gulf', 'Foxtrot', 'Juliet'],
      'Hotel': ['Hostel', 'Echo', 'Alpha'],
      'India': ['Indiana', 'Juliet', 'Lima'],
      'Juliet': ['Julia', 'India', 'Golf'],
      'Kilo': ['Kilogram', 'Quebec', 'Lima'],
      'Lima': ['Limo', 'India', 'Kilo'],
      'Mike': ['Michael', 'November', 'Papa'],
      'November': ['October', 'Mike', 'Oscar'],
      'Oscar': ['October', 'November', 'Papa'],
      'Papa': ['Pappa', 'Bravo', 'Mike'],
      'Quebec': ['Queen', 'Kilo', 'Romeo'],
      'Romeo': ['Roman', 'Quebec', 'Sierra'],
      'Sierra': ['Sarah', 'Charlie', 'Tango'],
      'Tango': ['Tangle', 'Charlie', 'Sierra'],
      'Uniform': ['Unity', 'Victor', 'Yankee'],
      'Victor': ['Victory', 'Foxtrot', 'Uniform'],
      'Whiskey': ['Whisky', 'X-ray', 'Yankee'],
      'X-ray': ['Ex-ray', 'Echo', 'Whiskey'],
      'Yankee': ['Yankie', 'Uniform', 'Whiskey'],
      'Zulu': ['Zebra', 'Sierra', 'Alpha']
    };
    
    // Common misspellings and variations
    const commonMistakes: Record<string, string[]> = {
      'Alpha': ['Alfa'],
      'Juliet': ['Juliett', 'Julliette'],
      'Papa': ['Pappa'],
      'Whiskey': ['Whisky'],
      'Yankee': ['Yankie']
    };
    
    // First, add phonetically similar options if available
    if (phoneticGroups[correct]) {
      for (const similar of phoneticGroups[correct]) {
        if (distractors.length < count && NATO_ALPHABET.some(item => item.codeWord === similar)) {
          distractors.push(similar);
        }
      }
    }
    
    // Add common mistakes if they exist
    if (commonMistakes[correct] && distractors.length < count) {
      for (const mistake of commonMistakes[correct]) {
        if (distractors.length < count && !distractors.includes(mistake)) {
          distractors.push(mistake);
        }
      }
    }
    
    // Add words that start with the same first letter
    const firstLetter = correct[0].toLowerCase();
    const sameStartOptions = NATO_ALPHABET
      .filter(item => 
        item.codeWord !== correct && 
        item.codeWord[0].toLowerCase() === firstLetter &&
        !distractors.includes(item.codeWord)
      )
      .map(item => item.codeWord);
    
    for (const option of sameStartOptions) {
      if (distractors.length < count) {
        distractors.push(option);
      }
    }
    
    // Fill remaining slots with random options
    const allOptions = NATO_ALPHABET.map(item => item.codeWord);
    while (distractors.length < count) {
      const randomOption = allOptions[Math.floor(Math.random() * allOptions.length)];
      if (randomOption !== correct && !distractors.includes(randomOption)) {
        distractors.push(randomOption);
      }
    }
    
    return distractors.slice(0, count);
  };

  // Generate question
  const generateQuestion = useCallback((): Question => {
    // For simplicity, use basic question types
    const types: QuestionType[] = ['letter-to-code', 'code-to-letter'];
    if (state.preferences.soundEnabled) {
      types.push('audio-to-code');
    }
    
    const type = types[Math.floor(Math.random() * types.length)];
    const randomIndex = Math.floor(Math.random() * NATO_ALPHABET.length);
    const correctItem = NATO_ALPHABET[randomIndex];
    
    let question: Question;
    
    switch (type) {
      case 'letter-to-code':
        question = {
          id: crypto.randomUUID(),
          type,
          question: `What is the phonetic code for "${correctItem.letter}"?`,
          options: [correctItem.codeWord, ...generateDistractors(correctItem.codeWord, correctItem.letter)].sort(() => Math.random() - 0.5),
          correctAnswer: correctItem.codeWord,
          letter: correctItem.letter,
        };
        break;
        
      case 'code-to-letter':
        const letterOptions = [correctItem.letter];
        
        // Add similar looking letters or common confusions
        const similarLetters: Record<string, string[]> = {
          'A': ['H', 'R', 'E'],
          'B': ['D', 'P', 'E'],
          'C': ['K', 'S', 'G'],
          'D': ['B', 'P', 'T'],
          'E': ['F', 'I', 'A'],
          'F': ['E', 'S', 'P'],
          'G': ['C', 'J', 'Q'],
          'H': ['A', 'N', 'M'],
          'I': ['J', 'L', 'E'],
          'J': ['I', 'G', 'Y'],
          'K': ['C', 'X', 'Q'],
          'L': ['I', 'T', 'J'],
          'M': ['N', 'W', 'V'],
          'N': ['M', 'H', 'U'],
          'O': ['Q', 'D', 'C'],
          'P': ['B', 'D', 'R'],
          'Q': ['O', 'G', 'C'],
          'R': ['P', 'K', 'B'],
          'S': ['C', 'F', 'Z'],
          'T': ['I', 'L', 'F'],
          'U': ['V', 'Y', 'W'],
          'V': ['U', 'W', 'Y'],
          'W': ['M', 'V', 'U'],
          'X': ['K', 'Z', 'Y'],
          'Y': ['V', 'U', 'I'],
          'Z': ['S', 'X', 'N']
        };
        
        // First add similar letters if available
        if (similarLetters[correctItem.letter]) {
          for (const similar of similarLetters[correctItem.letter]) {
            if (letterOptions.length < 4 && !letterOptions.includes(similar)) {
              letterOptions.push(similar);
            }
          }
        }
        
        // Fill remaining with random letters
        while (letterOptions.length < 4) {
          const randomLetter = NATO_ALPHABET[Math.floor(Math.random() * NATO_ALPHABET.length)].letter;
          if (!letterOptions.includes(randomLetter)) {
            letterOptions.push(randomLetter);
          }
        }
        
        question = {
          id: crypto.randomUUID(),
          type,
          question: `Which letter does "${correctItem.codeWord}" represent?`,
          options: letterOptions.sort(() => Math.random() - 0.5),
          correctAnswer: correctItem.letter,
          letter: correctItem.letter,
        };
        break;
        
      case 'audio-to-code':
        // Play the letter sound
        setTimeout(() => {
          speechManager.speak(`"${correctItem.letter}" as in "${correctItem.codeWord}"`);
        }, 500);
        
        question = {
          id: crypto.randomUUID(),
          type,
          question: 'What phonetic code did you hear?',
          options: [correctItem.codeWord, ...generateDistractors(correctItem.codeWord, correctItem.letter)].sort(() => Math.random() - 0.5),
          correctAnswer: correctItem.codeWord,
          letter: correctItem.letter,
        };
        break;
        
      default:
        // Fallback to letter-to-code
        question = {
          id: crypto.randomUUID(),
          type: 'letter-to-code',
          question: `What is the phonetic code for "${correctItem.letter}"?`,
          options: [correctItem.codeWord, ...generateDistractors(correctItem.codeWord, correctItem.letter)].sort(() => Math.random() - 0.5),
          correctAnswer: correctItem.codeWord,
          letter: correctItem.letter,
        };
    }
    
    return question;
  }, [state.preferences.soundEnabled]);

  // Start quiz
  const startQuiz = useCallback(() => {
    setIsQuizActive(true);
    setQuestionNumber(1);
    setCorrectAnswers(0);
    setTimer(0);
    // setAnsweredLetters({});
    setSelectedAnswer(null);  // Reset selected answer
    setShowResult(false);     // Reset show result
    const firstQuestion = generateQuestion();
    setCurrentQuestion(firstQuestion);
    
    if (timePerQuestion) {
      setQuestionTimer(timePerQuestion);
    }
  }, [generateQuestion, timePerQuestion]);

  // Handle answer selection
  const handleAnswer = useCallback((answer: string) => {
    if (!currentQuestion || showResult) return;
    
    setSelectedAnswer(answer);
    setShowResult(true);
    
    const isCorrect = answer === currentQuestion.correctAnswer;
    
    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1);
      if (state.preferences.soundEnabled) {
        const audio = new Audio('/sounds/correct.mp3');
        audio.volume = state.preferences.soundVolume;
        audio.play().catch(() => {});
      }
    } else {
      if (state.preferences.soundEnabled) {
        const audio = new Audio('/sounds/incorrect.mp3');
        audio.volume = state.preferences.soundVolume;
        audio.play().catch(() => {});
      }
    }
    
    // Update letter stats
    updateLetterStats(currentQuestion.letter, isCorrect);
    // setAnsweredLetters(prev => ({ ...prev, [currentQuestion.letter]: isCorrect }));
    
    // Clear question timer
    setQuestionTimer(null);
  }, [currentQuestion, showResult, state.preferences, updateLetterStats]);

  // End quiz
  const endQuiz = useCallback(() => {
    setIsQuizActive(false);
    const duration = Math.round((Date.now() - quizStartTime) / 1000);
    const accuracy = Math.round((correctAnswers / totalQuestions) * 100);
    const passed = accuracy >= passingScore;
    
    // Save quiz result
    addQuizResult({
      date: new Date().toISOString(),
      mode,
      totalQuestions,
      correctAnswers,
      duration,
      passed,
    });
  }, [correctAnswers, totalQuestions, passingScore, mode, quizStartTime, addQuizResult]);

  // Next question
  const nextQuestion = useCallback(() => {
    if (questionNumber >= totalQuestions) {
      endQuiz();
      return;
    }
    
    setQuestionNumber(prev => prev + 1);
    setSelectedAnswer(null);
    setShowResult(false);
    const newQuestion = generateQuestion();
    setCurrentQuestion(newQuestion);
    
    if (timePerQuestion) {
      setQuestionTimer(timePerQuestion);
    }
  }, [questionNumber, totalQuestions, generateQuestion, timePerQuestion, endQuiz]);

  // Timer effects
  useEffect(() => {
    if (!isQuizActive) return;
    
    const interval = setInterval(() => {
      setTimer(prev => prev + 1);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isQuizActive]);

  // Question timer effect
  useEffect(() => {
    if (questionTimer === null || questionTimer <= 0) return;
    
    const interval = setInterval(() => {
      setQuestionTimer(prev => {
        if (prev === null || prev <= 1) {
          handleAnswer(''); // Time&apos;s up, count as wrong
          return null;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [questionTimer, handleAnswer]);

  // Replay audio for audio questions
  const replayAudio = () => {
    if (currentQuestion?.type === 'audio-to-code') {
      const item = NATO_ALPHABET.find(item =>
        item.codeWord === currentQuestion.correctAnswer
      );
      if (item) {
        speechManager.speak(`"${item.letter}" as in "${item.codeWord}"`);
      }
    }
  };

  // Format time
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isQuizActive && questionNumber === 0) {
    return (
      <div className="max-w-2xl mx-auto space-y-8">
        <h2 className="text-5xl font-black tracking-headlines">
          {mode === 'practice' ? 'Practice Quiz' : 'Challenge Quiz'}
        </h2>
        
        <div className="space-y-4">
          <div className="p-6 bg-background border-2 border-border rounded-xl">
            <h3 className="font-semibold mb-2">Quiz Rules:</h3>
            <ul className="space-y-1 text-sm">
              <li>• {totalQuestions} questions</li>
              <li>• {passingScore}% required to pass</li>
              {timePerQuestion && <li>• {timePerQuestion} seconds per question</li>}
              <li>• No penalties for wrong answers</li>
            </ul>
          </div>
        </div>
        
        <Button size="xl" onClick={startQuiz} className="mt-8">
          Start Quiz
        </Button>
      </div>
    );
  }

  if (!isQuizActive && questionNumber > 0) {
    const accuracy = Math.round((correctAnswers / totalQuestions) * 100);
    const passed = accuracy >= passingScore;
    const duration = Math.round((Date.now() - quizStartTime) / 1000);
    
    return (
      <div className="max-w-2xl mx-auto space-y-8">
        <h2 className="text-5xl font-black tracking-headlines text-center">Quiz Complete!</h2>
        
        <div className={cn(
          "text-8xl font-black text-center tracking-headlines",
          passed ? "text-success" : "text-error"
        )}>
          {accuracy}%
        </div>
        
        <div className="text-2xl font-bold text-center">
          {passed ? 'PASSED' : 'FAILED'}
        </div>
        
        <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
          <div className="p-6 bg-background border-2 border-border rounded-xl">
            <div className="text-3xl font-black">{correctAnswers}/{totalQuestions}</div>
            <div className="text-base text-secondary">Correct</div>
          </div>
          <div className="p-6 bg-background border-2 border-border rounded-xl">
            <div className="text-3xl font-black">{formatTime(duration)}</div>
            <div className="text-base text-secondary">Time</div>
          </div>
        </div>
        
        {!passed && (
          <div className="p-6 bg-warmAmber-50 dark:bg-warmAmber-900/20 border-2 border-warmAmber-200 rounded-xl max-w-md mx-auto">
            <p className="text-base text-secondary">
              You need {passingScore}% to pass. Keep practicing!
            </p>
          </div>
        )}
        
        <div className="flex gap-4 justify-center">
          <Button variant="secondary" onClick={onComplete}>
            Back to Practice
          </Button>
          <Button onClick={startQuiz}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!currentQuestion) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Question {questionNumber} of {totalQuestions}</span>
          <span>{formatTime(timer)}</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all"
            style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
          />
        </div>
      </div>
      
      {/* Question Timer */}
      {questionTimer !== null && (
        <div className="text-center">
          <div className={cn(
            "text-2xl font-bold",
            questionTimer <= 5 ? "text-red-600 animate-pulse" : ""
          )}>
            {questionTimer}s
          </div>
        </div>
      )}
      
      {/* Question */}
      <div className="text-center space-y-4">
        <h3 className="text-2xl font-semibold">{currentQuestion.question}</h3>
        
        {currentQuestion.type === 'audio-to-code' && (
          <Button
            variant="secondary"
            size="sm"
            onClick={replayAudio}
            disabled={showResult}
          >
            🔊 Replay Audio
          </Button>
        )}
      </div>
      
      {/* Options */}
      {currentQuestion.options && (
        <div className="grid grid-cols-2 gap-4">
          {currentQuestion.options.map((option) => {
            const isSelected = selectedAnswer === option;
            const isCorrect = option === currentQuestion.correctAnswer;
            const showCorrect = showResult && isCorrect;
            const showIncorrect = showResult && isSelected && !isCorrect;
            
            return (
              <Button
                key={option}
                variant="secondary"
                size="lg"
                className={cn(
                  "py-6 text-lg transition-all",
                  showCorrect && "bg-green-500 hover:bg-green-500 text-white",
                  showIncorrect && "bg-red-500 hover:bg-red-500 text-white",
                  isSelected && !showResult && "ring-2 ring-primary"
                )}
                onClick={() => handleAnswer(option)}
                disabled={showResult}
              >
                {option}
              </Button>
            );
          })}
        </div>
      )}
      
      {/* Result and Next Button */}
      {showResult && (
        <div className="text-center space-y-4">
          <div className={cn(
            "text-xl font-semibold",
            selectedAnswer === currentQuestion.correctAnswer ? "text-green-600" : "text-red-600"
          )}>
            {selectedAnswer === currentQuestion.correctAnswer ? "Correct! ✅" : "Incorrect ❌"}
          </div>
          
          <Button onClick={nextQuestion}>
            {questionNumber >= totalQuestions ? 'See Results' : 'Next Question'}
          </Button>
        </div>
      )}
    </div>
  );
}