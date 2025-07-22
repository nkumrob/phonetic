'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui';
import { NATO_ALPHABET } from '@/lib/constants/phonetic-alphabet';
import { cn } from '@/lib/utils/cn';
import { useSession } from '@/lib/contexts/session-context';
import { 
  CelebrationSystem, 
  CELEBRATION_PRESETS,
  useXPAnimation,
  StreakDisplay 
} from '@/components/gamification';
import { useSoundEffects } from '@/lib/hooks/use-sound-effects';
import { useDailyGoals } from '@/components/gamification/daily-goals';
import { speechManager } from '@/lib/utils/speech-synthesis';
import { DistractorGenerator, getQuizDifficulty } from '@/lib/quiz/distractor-generator';
import { calculateCorrectAnswerXP, calculateWrongAnswerPenalty, formatXPDisplay } from '@/lib/utils/xp-system';

type QuizMode = 'practice' | 'challenge';
type QuestionType = 'letter-to-code' | 'code-to-letter' | 'audio-to-code' | 'spell-word';

interface Question {
  id: string;
  type: QuestionType;
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  points: number;
}

interface UnifiedQuizProps {
  mode: QuizMode;
  onComplete: () => void;
  onSessionSaved: () => void;
}

export function UnifiedQuiz({ mode, onComplete, onSessionSaved }: UnifiedQuizProps) {
  const { session, addQuizResult, updateProgress } = useSession();
  const { showXPGain, XPGainDisplay } = useXPAnimation();
  const { playCorrect, playIncorrect, playStreak } = useSoundEffects();
  const { updateQuizGoal, updateStreakGoal } = useDailyGoals();
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [questionNumber, setQuestionNumber] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [questionsAnswered, setQuestionsAnswered] = useState({ correct: 0, incorrect: 0 });
  const [timer, setTimer] = useState(0);
  const [questionTimer, setQuestionTimer] = useState<number | null>(null);
  const [isQuizActive, setIsQuizActive] = useState(false);
  const [showCelebration, setShowCelebration] = useState<{
    type: 'sparkle' | 'stars' | 'confetti' | 'fireworks' | 'rainbow';
    duration: number;
    intensity: 'light' | 'medium' | 'heavy';
    color?: string;
    message?: string;
    sound?: string;
  } | null>(null);
  const [showFailureScreen, setShowFailureScreen] = useState(false);
  const [retryAttempt, setRetryAttempt] = useState(1);

  const totalQuestions = mode === 'practice' ? 10 : 20;
  const timePerQuestion = mode === 'challenge' ? 5 : null;

  // Generate question based on user level and mode
  const generateQuestion = useCallback((): Question => {
    const level = session.userProgress.level;
    const types: QuestionType[] = 
      level < 3 ? ['letter-to-code'] :
      level < 5 ? ['letter-to-code', 'code-to-letter'] :
      level < 10 ? ['letter-to-code', 'code-to-letter', 'audio-to-code'] :
      ['letter-to-code', 'code-to-letter', 'audio-to-code', 'spell-word'];
    
    const type = types[Math.floor(Math.random() * types.length)];
    const randomIndex = Math.floor(Math.random() * NATO_ALPHABET.length);
    const correctItem = NATO_ALPHABET[randomIndex];
    
    let question: Question;
    
    switch (type) {
      case 'letter-to-code':
        const difficulty = getQuizDifficulty(level);
        const distractors = DistractorGenerator.generateForLetterToCode(
          correctItem.letter,
          correctItem.codeWord,
          difficulty
        );
        
        question = {
          id: Math.random().toString(36),
          type,
          question: `What is the phonetic code for "${correctItem.letter}"?`,
          options: [correctItem.codeWord, ...distractors].sort(() => Math.random() - 0.5),
          correctAnswer: correctItem.codeWord,
          points: 10 // Not used anymore, but keeping for interface compatibility
        };
        break;
        
      case 'code-to-letter':
        const letterDifficulty = getQuizDifficulty(level);
        const letterDistractors = DistractorGenerator.generateForCodeToLetter(
          correctItem.codeWord,
          correctItem.letter,
          letterDifficulty
        );
        
        question = {
          id: Math.random().toString(36),
          type,
          question: `Which letter does "${correctItem.codeWord}" represent?`,
          options: [correctItem.letter, ...letterDistractors].sort(() => Math.random() - 0.5),
          correctAnswer: correctItem.letter,
          points: 10 // Not used anymore, but keeping for interface compatibility
        };
        break;
        
      case 'audio-to-code':
        const audioDifficulty = getQuizDifficulty(level);
        const audioDistractors = DistractorGenerator.generateForLetterToCode(
          correctItem.letter,
          correctItem.codeWord,
          audioDifficulty
        );
        
        question = {
          id: Math.random().toString(36),
          type,
          question: `Listen and select the correct code word`,
          options: [correctItem.codeWord, ...audioDistractors].sort(() => Math.random() - 0.5),
          correctAnswer: correctItem.codeWord,
          points: 15 // Not used anymore, but keeping for interface compatibility
        };
        
        // Play audio using centralized speech manager
        setTimeout(() => {
          speechManager.speak(correctItem.codeWord, { rate: 0.8 });
        }, 500);
        break;
        
      case 'spell-word':
        const words = ['HELP', 'SAVE', 'STOP', 'FIRE', 'CODE'];
        const word = words[Math.floor(Math.random() * words.length)];
        const phoneticSpelling = word.split('').map(letter => 
          NATO_ALPHABET.find(item => item.letter === letter)?.codeWord || ''
        ).join(' ');
        
        question = {
          id: Math.random().toString(36),
          type,
          question: `Spell "${word}" using phonetic alphabet`,
          correctAnswer: phoneticSpelling,
          points: 20 // Not used anymore, but keeping for interface compatibility
        };
        break;
        
      default:
        return generateQuestion();
    }
    
    return question;
  }, [session.userProgress.level, mode]);

  // Start quiz
  useEffect(() => {
    if (!isQuizActive) {
      setIsQuizActive(true);
      setQuestionNumber(1);
      setScore(0);
      setStreak(0);
      setQuestionsAnswered({ correct: 0, incorrect: 0 });
      setTimer(0);
      nextQuestion();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Timer for challenge mode
  useEffect(() => {
    if (mode === 'challenge' && isQuizActive && !showResult && questionTimer !== null) {
      const interval = setInterval(() => {
        setQuestionTimer(prev => {
          if (prev === null || prev <= 0) return 0;
          if (prev === 1) {
            handleTimeout();
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [mode, isQuizActive, showResult, questionTimer]);

  // Overall timer
  useEffect(() => {
    if (isQuizActive) {
      const interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [isQuizActive]);

  const handleTimeout = () => {
    if (!showResult) {
      setShowResult(true);
      setQuestionsAnswered(prev => ({ ...prev, incorrect: prev.incorrect + 1 }));
      setStreak(0);
      setTimeout(() => nextQuestion(), 1500);
    }
  };

  const nextQuestion = () => {
    if (questionNumber >= totalQuestions) {
      endQuiz();
    } else {
      const question = generateQuestion();
      setCurrentQuestion(question);
      setSelectedAnswer(null);
      setShowResult(false);
      setQuestionTimer(timePerQuestion);
      
      if (questionNumber > 0) {
        setQuestionNumber(prev => prev + 1);
      }
    }
  };

  const handleAnswer = (answer: string) => {
    if (showResult) return;
    
    setSelectedAnswer(answer);
    setShowResult(true);
    
    const isCorrect = answer === currentQuestion?.correctAnswer;
    
    if (isCorrect) {
      // Use centralized XP calculation
      const xpCalc = calculateCorrectAnswerXP(mode, streak);
      
      setScore(prev => prev + xpCalc.totalXP);
      setStreak(prev => prev + 1);
      setQuestionsAnswered(prev => ({ ...prev, correct: prev.correct + 1 }));
      
      // Play sound with pitch based on streak
      playCorrect(streak);
      
      // Show XP gain animation with the TOTAL XP
      const rect = (document.activeElement as HTMLElement)?.getBoundingClientRect();
      showXPGain(xpCalc.totalXP, {
        x: rect?.left + rect?.width / 2 || window.innerWidth / 2,
        y: rect?.top || window.innerHeight / 2,
        multiplier: streak >= 5 ? 1 + Math.floor(streak / 5) * 0.5 : undefined
      });
      
      // Update XP immediately with TOTAL XP
      updateProgress({ experience: session.userProgress.experience + xpCalc.totalXP });
      
      // Check for streak milestones
      const newStreak = streak + 1;
      if (newStreak === 5) {
        triggerCelebration('streak5');
        playStreak(5);
      } else if (newStreak === 10) {
        triggerCelebration('streak10');
        playStreak(10);
      } else if (newStreak === 20) {
        triggerCelebration('streak20');
        playStreak(20);
      }
      
      // Update daily goal for streaks
      updateStreakGoal(newStreak);
    } else {
      setQuestionsAnswered(prev => ({ ...prev, incorrect: prev.incorrect + 1 }));
      setStreak(0);
      playIncorrect();
      
      // Use centralized penalty calculation
      const penalty = calculateWrongAnswerPenalty(mode);
      
      // Allow negative XP but with a floor of -50
      const newXP = Math.max(-50, session.userProgress.experience - penalty.amount);
      updateProgress({ experience: newXP });
      
      // Show XP loss animation
      const rect = (document.activeElement as HTMLElement)?.getBoundingClientRect();
      showXPGain(-penalty.amount, {
        x: rect?.left + rect?.width / 2 || window.innerWidth / 2,
        y: rect?.top || window.innerHeight / 2,
      });
    }
    
    setTimeout(() => nextQuestion(), 2000);
  };

  const triggerCelebration = (type: string) => {
    setShowCelebration(CELEBRATION_PRESETS[type as keyof typeof CELEBRATION_PRESETS]);
    setTimeout(() => setShowCelebration(null), 3000);
  };

  const endQuiz = () => {
    setIsQuizActive(false);
    
    // Calculate pass percentage
    const totalAnswered = questionsAnswered.correct + questionsAnswered.incorrect;
    const accuracy = totalAnswered > 0 ? Math.round((questionsAnswered.correct / totalAnswered) * 100) : 0;
    const passRequirement = mode === 'practice' ? 70 : 80;
    const passed = accuracy >= passRequirement;
    
    
    const result = {
      mode: mode === 'practice' ? 'practice' : 'challenge',
      difficulty: 'adaptive',
      correct: questionsAnswered.correct,
      incorrect: questionsAnswered.incorrect,
      score,
      streak,
      averageTime: questionsAnswered.correct > 0 ? timer / questionsAnswered.correct : 0,
      timestamp: new Date().toISOString()
    };
    
    // Always save quiz results for tracking
    addQuizResult(result);
    onSessionSaved();
    
    if (passed) {
      // Update daily quiz goal only if passed
      updateQuizGoal();
      
      // Check for perfect score
      if (questionsAnswered.incorrect === 0) {
        triggerCelebration('perfectScore');
      }
      
      setTimeout(() => onComplete(), 2000);
    } else {
      // Show failure screen
      setShowFailureScreen(true);
    }
  };

  const handleRetry = () => {
    // Apply XP penalty for retry
    const retryPenalty = mode === 'practice' ? 5 : 10;
    const newXP = Math.max(0, session.userProgress.experience - retryPenalty);
    updateProgress({ experience: newXP });
    
    // Reset quiz state
    setShowFailureScreen(false);
    setQuestionNumber(1);
    setScore(0);
    setStreak(0);
    setQuestionsAnswered({ correct: 0, incorrect: 0 });
    setTimer(0);
    setIsQuizActive(true);
    setRetryAttempt(prev => prev + 1);
    nextQuestion();
  };

  if (showFailureScreen) {
    const totalAnswered = questionsAnswered.correct + questionsAnswered.incorrect;
    const accuracy = totalAnswered > 0 ? Math.round((questionsAnswered.correct / totalAnswered) * 100) : 0;
    const passRequirement = mode === 'practice' ? 70 : 80;
    
    return (
      <div className="max-w-2xl mx-auto space-y-6 text-center">
        <div className="p-8 rounded-2xl bg-red-500/10 border-2 border-red-500/20 space-y-6">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-red-600 dark:text-red-400">
              Quiz Failed
            </h2>
            <p className="text-lg text-muted-foreground">
              You need {passRequirement}% accuracy to pass
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto">
              <div className="p-4 rounded-lg bg-background border">
                <p className="text-2xl font-bold">{accuracy}%</p>
                <p className="text-sm text-muted-foreground">Accuracy</p>
              </div>
              <div className="p-4 rounded-lg bg-background border">
                <p className="text-2xl font-bold">{passRequirement}%</p>
                <p className="text-sm text-muted-foreground">Required</p>
              </div>
              <div className="p-4 rounded-lg bg-background border">
                <p className="text-2xl font-bold">{questionsAnswered.incorrect}</p>
                <p className="text-sm text-muted-foreground">Wrong</p>
              </div>
            </div>
            
            <div className="text-sm text-muted-foreground space-y-1">
              <p>✓ {questionsAnswered.correct} correct answers</p>
              <p>✗ {questionsAnswered.incorrect} incorrect answers</p>
              <p>🏆 {score} XP earned this quiz</p>
              {retryAttempt > 1 && (
                <p className="text-orange-600">Attempt #{retryAttempt} (-{mode === 'practice' ? 5 : 10} XP penalty)</p>
              )}
            </div>
          </div>
          
          <div className="flex gap-3 justify-center">
            <Button
              variant="secondary"
              onClick={() => onComplete()}
            >
              Exit Quiz
            </Button>
            <Button
              onClick={handleRetry}
              className="min-w-[120px]"
            >
              Try Again
              <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground">
            💡 Tip: Take your time to think about each answer. Check the first letter carefully!
          </p>
        </div>
      </div>
    );
  }

  if (!currentQuestion) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* XP Animations */}
      <XPGainDisplay />
      
      {/* Celebration System */}
      {showCelebration && (
        <CelebrationSystem 
          config={showCelebration}
          onComplete={() => setShowCelebration(null)}
        />
      )}
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h3 className="text-xl font-semibold">
            {mode === 'practice' ? 'Practice Mode' : 'Challenge Mode'}
          </h3>
          <p className="text-sm text-muted-foreground">
            Question {questionNumber} of {totalQuestions}
          </p>
        </div>
        
        <div className="text-right space-y-1">
          <p className={cn(
            "text-2xl font-bold",
            (() => {
              const passThreshold = Math.ceil(totalQuestions * (mode === 'practice' ? 0.7 : 0.8));
              if (questionsAnswered.correct >= passThreshold) return "text-green-600";
              if (questionsAnswered.correct + (totalQuestions - questionNumber + 1) < passThreshold) return "text-red-600";
              return "text-primary";
            })()
          )}>
            {questionsAnswered.correct}/{totalQuestions}
          </p>
          <p className="text-sm text-muted-foreground">
            Correct (need {Math.ceil(totalQuestions * (mode === 'practice' ? 0.7 : 0.8))})
          </p>
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
          />
        </div>
        
        {/* Stats Bar */}
        <div className="flex justify-between text-sm">
          <div className="flex gap-4 items-center">
            <span className="text-green-600">✓ {questionsAnswered.correct}</span>
            <span className="text-red-600">✗ {questionsAnswered.incorrect}</span>
            {streak > 0 && (
              <StreakDisplay 
                count={streak} 
                type="quiz" 
                size="small" 
                showAnimation={true}
              />
            )}
          </div>
          {mode === 'challenge' && questionTimer !== null && !showResult && (
            <span className={cn(
              "font-bold",
              questionTimer <= 2 ? "text-red-600 animate-pulse" : "text-primary"
            )}>
              {questionTimer}s
            </span>
          )}
        </div>
      </div>
      
      {/* Question */}
      <div className="space-y-6">
        <div className="text-center">
          <h4 className="text-xl font-medium">{currentQuestion.question}</h4>
          
          {currentQuestion.type === 'audio-to-code' && (
            <Button
              variant="ghost"
              size="sm"
              className="mt-3"
              onClick={() => {
                speechManager.speak(currentQuestion.correctAnswer as string, { rate: 0.8 });
              }}
            >
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" 
                />
              </svg>
              Play Again
            </Button>
          )}
        </div>
        
        {/* Answer Options */}
        {currentQuestion.options ? (
          <div className="grid grid-cols-2 gap-3">
            {currentQuestion.options.map((option) => (
              <Button
                key={option}
                variant={
                  !showResult ? 'secondary' :
                  option === currentQuestion.correctAnswer ? 'primary' :
                  option === selectedAnswer ? 'secondary' :
                  'secondary'
                }
                className={cn(
                  'py-4',
                  showResult && option === currentQuestion.correctAnswer && 'ring-2 ring-green-500',
                  showResult && option === selectedAnswer && option !== currentQuestion.correctAnswer && 'ring-2 ring-red-500'
                )}
                onClick={() => handleAnswer(option)}
                disabled={showResult}
              >
                {option}
              </Button>
            ))}
          </div>
        ) : currentQuestion.type === 'spell-word' ? (
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Type your answer (e.g., Alpha Bravo Charlie)"
              className="w-full p-3 border rounded-lg"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.currentTarget.value) {
                  handleAnswer(e.currentTarget.value.toUpperCase());
                }
              }}
              disabled={showResult}
              autoFocus
            />
            {showResult && selectedAnswer !== currentQuestion.correctAnswer && (
              <p className="text-center text-sm">
                Correct answer: <strong>{currentQuestion.correctAnswer}</strong>
              </p>
            )}
          </div>
        ) : null}
        
        {/* Result Feedback */}
        {showResult && (
          <div className={cn(
            "text-center p-4 rounded-lg animate-fade-in",
            selectedAnswer === currentQuestion.correctAnswer 
              ? "bg-green-500/20 text-green-600" 
              : "bg-red-500/20 text-red-600"
          )}>
            <p className="text-lg font-semibold">
              {selectedAnswer === currentQuestion.correctAnswer 
                ? (() => {
                    const xpCalc = calculateCorrectAnswerXP(mode, streak - 1); // streak-1 because we already incremented
                    return formatXPDisplay(xpCalc).message;
                  })()
                : (() => {
                    const penalty = calculateWrongAnswerPenalty(mode);
                    return penalty.reason;
                  })()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}