'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui';
import { NATO_ALPHABET } from '@/lib/constants/phonetic-alphabet';
import { cn } from '@/lib/utils/cn';
import { useSession } from '@/lib/contexts/session-context';

type QuestionType = 
  | 'letter-to-code' 
  | 'code-to-letter' 
  | 'audio-to-code' 
  | 'sequence-recall'
  | 'rapid-fire'
  | 'spell-word'
  | 'reverse-spell'
  | 'multi-letter'
  | 'similar-sounds'
  | 'speed-challenge';

type Difficulty = 'easy' | 'medium' | 'hard' | 'expert' | 'nightmare';

interface Question {
  id: string;
  type: QuestionType;
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  timeLimit?: number;
  points: number;
  letter?: string;
  codeWord?: string;
  sequence?: string[];
}

interface QuizMode {
  name: string;
  description: string;
  icon: string;
  unlockLevel: number;
  settings: {
    timePerQuestion?: number;
    livesAllowed?: number;
    mistakePenalty?: number;
    streakMultiplier?: number;
    minCorrectToPass?: number;
  };
}

const QUIZ_MODES: Record<string, QuizMode> = {
  classic: {
    name: 'Classic',
    description: 'Standard quiz with mixed questions',
    icon: '📚',
    unlockLevel: 0,
    settings: {}
  },
  speedRun: {
    name: 'Speed Run',
    description: 'Answer as many as possible in 60 seconds',
    icon: '⚡',
    unlockLevel: 3,
    settings: {
      timePerQuestion: 3,
      streakMultiplier: 2
    }
  },
  survival: {
    name: 'Survival',
    description: 'One mistake and it\'s over!',
    icon: '💀',
    unlockLevel: 5,
    settings: {
      livesAllowed: 1,
      streakMultiplier: 3
    }
  },
  perfectionist: {
    name: 'Perfectionist',
    description: 'Get 10 in a row without mistakes',
    icon: '💯',
    unlockLevel: 7,
    settings: {
      minCorrectToPass: 10,
      livesAllowed: 0
    }
  },
  nightmare: {
    name: 'Nightmare',
    description: 'The ultimate challenge - no mercy!',
    icon: '😈',
    unlockLevel: 15,
    settings: {
      timePerQuestion: 2,
      livesAllowed: 3,
      mistakePenalty: 2,
      streakMultiplier: 5
    }
  }
};

export function EnhancedQuiz() {
  const { session, addQuizResult, updateProgress } = useSession();
  const [selectedMode, setSelectedMode] = useState<string>('classic');
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [isQuizActive, setIsQuizActive] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | string[] | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [questionNumber, setQuestionNumber] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [lives, setLives] = useState(3);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [totalTime, setTotalTime] = useState(0);
  const [comboMultiplier, setComboMultiplier] = useState(1);
  const [questionsAnswered, setQuestionsAnswered] = useState<{correct: number; incorrect: number}>({
    correct: 0,
    incorrect: 0
  });

  const currentMode = QUIZ_MODES[selectedMode];
  const isUnlocked = session.userProgress.level >= currentMode.unlockLevel;

  // Enhanced question generation based on difficulty
  const generateQuestion = useCallback((): Question => {
    const types: QuestionType[] = 
      difficulty === 'easy' ? ['letter-to-code'] :
      difficulty === 'medium' ? ['letter-to-code', 'code-to-letter', 'audio-to-code'] :
      difficulty === 'hard' ? ['letter-to-code', 'code-to-letter', 'audio-to-code', 'spell-word'] :
      difficulty === 'expert' ? ['audio-to-code', 'spell-word', 'reverse-spell', 'sequence-recall', 'multi-letter'] :
      ['sequence-recall', 'reverse-spell', 'multi-letter', 'similar-sounds', 'speed-challenge'];
    
    const type = types[Math.floor(Math.random() * types.length)];
    const randomIndex = Math.floor(Math.random() * NATO_ALPHABET.length);
    const correctItem = NATO_ALPHABET[randomIndex];
    
    let question: Question;
    const basePoints = difficulty === 'easy' ? 10 : 
                      difficulty === 'medium' ? 15 : 
                      difficulty === 'hard' ? 25 : 
                      difficulty === 'expert' ? 40 : 60;
    
    switch (type) {
      case 'letter-to-code':
        const wrongOptions = NATO_ALPHABET
          .filter((_, i) => i !== randomIndex)
          .sort(() => Math.random() - 0.5)
          .slice(0, 3);
        
        question = {
          id: Math.random().toString(36),
          type,
          question: `What is the phonetic code for "${correctItem.letter}"?`,
          options: [correctItem.codeWord, ...wrongOptions.map(o => o.codeWord)].sort(() => Math.random() - 0.5),
          correctAnswer: correctItem.codeWord,
          points: basePoints,
          timeLimit: currentMode.settings.timePerQuestion
        };
        break;
        
      case 'spell-word':
        const words = ['HELP', 'SAVE', 'STOP', 'FIRE', 'CODE', 'BASE', 'ZONE', 'TEAM'];
        const word = words[Math.floor(Math.random() * words.length)];
        const phoneticSpelling = word.split('').map(letter => 
          NATO_ALPHABET.find(item => item.letter === letter)?.codeWord || ''
        ).join(' ');
        
        question = {
          id: Math.random().toString(36),
          type,
          question: `Spell "${word}" using phonetic alphabet`,
          correctAnswer: phoneticSpelling,
          points: basePoints * 2,
          timeLimit: currentMode.settings.timePerQuestion ? currentMode.settings.timePerQuestion * 2 : undefined
        };
        break;
        
      case 'sequence-recall':
        const sequenceLength = difficulty === 'hard' ? 3 : difficulty === 'expert' ? 4 : 5;
        const sequence = Array.from({ length: sequenceLength }, () => 
          NATO_ALPHABET[Math.floor(Math.random() * NATO_ALPHABET.length)].codeWord
        );
        
        question = {
          id: Math.random().toString(36),
          type,
          question: `Remember this sequence: ${sequence.join(' → ')}`,
          correctAnswer: sequence,
          sequence,
          points: basePoints * sequenceLength,
          timeLimit: 5 + sequenceLength
        };
        break;
        
      case 'multi-letter':
        const letterCount = difficulty === 'expert' ? 3 : 4;
        const letters = Array.from({ length: letterCount }, () => 
          NATO_ALPHABET[Math.floor(Math.random() * NATO_ALPHABET.length)]
        );
        const correctCodes = letters.map(l => l.codeWord);
        
        question = {
          id: Math.random().toString(36),
          type,
          question: `What are the codes for: ${letters.map(l => l.letter).join(', ')}?`,
          correctAnswer: correctCodes,
          points: basePoints * letterCount,
          timeLimit: currentMode.settings.timePerQuestion ? currentMode.settings.timePerQuestion * letterCount : undefined
        };
        break;
        
      case 'similar-sounds':
        const similarGroups = [
          ['Mike', 'November', 'Papa'],
          ['Delta', 'Echo', 'Foxtrot'],
          ['Bravo', 'Charlie', 'Victor']
        ];
        const group = similarGroups[Math.floor(Math.random() * similarGroups.length)];
        const correct = group[Math.floor(Math.random() * group.length)];
        const letter = NATO_ALPHABET.find(item => item.codeWord === correct)?.letter || '';
        
        question = {
          id: Math.random().toString(36),
          type,
          question: `Listen carefully: Which code word represents "${letter}"?`,
          options: group.sort(() => Math.random() - 0.5),
          correctAnswer: correct,
          points: basePoints * 1.5,
          timeLimit: currentMode.settings.timePerQuestion
        };
        break;
        
      default:
        return generateQuestion();
    }
    
    return question;
  }, [difficulty, currentMode.settings.timePerQuestion]);

  // Timer logic
  useEffect(() => {
    if (!isQuizActive || showResult) return;
    
    let interval: NodeJS.Timeout;
    
    if (timeLeft !== null && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev === null || prev <= 0) return 0;
          return prev - 1;
        });
      }, 1000);
    } else if (timeLeft === 0) {
      handleTimeout();
    }
    
    return () => clearInterval(interval);
  }, [isQuizActive, showResult, timeLeft]);

  // Global timer
  useEffect(() => {
    if (!isQuizActive) return;
    
    const interval = setInterval(() => {
      setTotalTime(prev => prev + 1);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isQuizActive]);

  const handleTimeout = () => {
    if (!showResult) {
      setShowResult(true);
      setQuestionsAnswered(prev => ({ ...prev, incorrect: prev.incorrect + 1 }));
      setStreak(0);
      setComboMultiplier(1);
      
      if (currentMode.settings.livesAllowed !== undefined) {
        setLives(prev => prev - 1);
        if (lives <= 1) {
          setTimeout(endQuiz, 2000);
        }
      }
    }
  };

  const startQuiz = () => {
    setIsQuizActive(true);
    setQuestionNumber(1);
    setScore(0);
    setStreak(0);
    setLives(currentMode.settings.livesAllowed || 3);
    setComboMultiplier(1);
    setQuestionsAnswered({ correct: 0, incorrect: 0 });
    setTotalTime(0);
    nextQuestion();
  };

  const nextQuestion = () => {
    const question = generateQuestion();
    setCurrentQuestion(question);
    setSelectedAnswer(null);
    setShowResult(false);
    setTimeLeft(question.timeLimit || null);
    
    if (question.type === 'sequence-recall') {
      setTimeout(() => {
        setCurrentQuestion(prev => prev ? { ...prev, question: 'What was the sequence?' } : null);
      }, 3000);
    }
  };

  const handleAnswer = (answer: string | string[]) => {
    if (showResult) return;
    
    setSelectedAnswer(answer);
    setShowResult(true);
    
    const isCorrect = Array.isArray(currentQuestion?.correctAnswer) 
      ? JSON.stringify(answer) === JSON.stringify(currentQuestion.correctAnswer)
      : answer === currentQuestion?.correctAnswer;
    
    if (isCorrect) {
      const points = (currentQuestion?.points || 10) * comboMultiplier;
      setScore(prev => prev + points);
      setStreak(prev => prev + 1);
      setQuestionsAnswered(prev => ({ ...prev, correct: prev.correct + 1 }));
      
      // Update combo multiplier
      if (streak > 0 && streak % 5 === 0) {
        setComboMultiplier(prev => Math.min(prev + 0.5, 5));
      }
    } else {
      setQuestionsAnswered(prev => ({ ...prev, incorrect: prev.incorrect + 1 }));
      setStreak(0);
      setComboMultiplier(1);
      
      if (currentMode.settings.livesAllowed !== undefined) {
        const penalty = currentMode.settings.mistakePenalty || 1;
        setLives(prev => prev - penalty);
        
        if (lives <= penalty) {
          setTimeout(endQuiz, 2000);
        }
      }
    }
    
    setTimeout(() => {
      if (selectedMode === 'speedRun' && totalTime >= 60) {
        endQuiz();
      } else if (selectedMode === 'perfectionist' && questionsAnswered.correct >= 10) {
        endQuiz();
      } else if (lives > 0 || currentMode.settings.livesAllowed === undefined) {
        setQuestionNumber(prev => prev + 1);
        nextQuestion();
      }
    }, 2000);
  };

  const endQuiz = () => {
    setIsQuizActive(false);
    
    const result = {
      mode: selectedMode,
      difficulty,
      correct: questionsAnswered.correct,
      incorrect: questionsAnswered.incorrect,
      score,
      streak,
      averageTime: questionsAnswered.correct > 0 ? totalTime / questionsAnswered.correct : 0,
      timestamp: new Date().toISOString()
    };
    
    addQuizResult(result);
  };

  if (!isQuizActive) {
    return (
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h3 className="text-3xl font-bold">Challenge Yourself</h3>
          <p className="text-muted-foreground text-lg">
            Level {session.userProgress.level} • {session.userProgress.experience} XP
          </p>
        </div>
        
        {/* Game Modes */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(QUIZ_MODES).map(([key, mode]) => {
            const unlocked = session.userProgress.level >= mode.unlockLevel;
            return (
              <button
                key={key}
                onClick={() => unlocked && setSelectedMode(key)}
                disabled={!unlocked}
                className={cn(
                  "p-6 rounded-lg border-2 transition-all text-left",
                  unlocked ? "hover:scale-105 cursor-pointer" : "opacity-50 cursor-not-allowed",
                  selectedMode === key ? "border-primary bg-primary/10" : "border-border"
                )}
              >
                <div className="text-3xl mb-2">{mode.icon}</div>
                <h4 className="font-semibold text-lg">{mode.name}</h4>
                <p className="text-sm text-muted-foreground mb-2">{mode.description}</p>
                {!unlocked && (
                  <p className="text-xs text-orange-600">Unlocks at level {mode.unlockLevel}</p>
                )}
              </button>
            );
          })}
        </div>
        
        {/* Difficulty Selection */}
        <div className="space-y-4">
          <h4 className="text-xl font-semibold text-center">Select Difficulty</h4>
          <div className="flex gap-3 justify-center flex-wrap">
            {(['easy', 'medium', 'hard', 'expert', 'nightmare'] as Difficulty[]).map(diff => {
              const unlocked = session.userProgress.unlockedModes.includes(diff);
              return (
                <Button
                  key={diff}
                  variant={difficulty === diff ? 'primary' : 'secondary'}
                  onClick={() => unlocked && setDifficulty(diff)}
                  disabled={!unlocked}
                  className={cn(!unlocked && "opacity-50")}
                >
                  {diff.charAt(0).toUpperCase() + diff.slice(1)}
                  {!unlocked && " 🔒"}
                </Button>
              );
            })}
          </div>
        </div>
        
        <div className="text-center">
          <Button 
            size="lg" 
            onClick={startQuiz}
            disabled={!isUnlocked}
            className="text-lg px-8"
          >
            Start {currentMode.name} Mode
          </Button>
        </div>
        
        {/* Recent Achievements */}
        <div className="bg-muted/50 rounded-lg p-6">
          <h4 className="font-semibold mb-4">Your Progress</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold">{session.userProgress.totalQuizzesTaken}</p>
              <p className="text-sm text-muted-foreground">Quizzes Taken</p>
            </div>
            <div>
              <p className="text-2xl font-bold">
                {session.userProgress.totalCorrectAnswers > 0 
                  ? Math.round((session.userProgress.totalCorrectAnswers / 
                    (session.userProgress.totalCorrectAnswers + session.userProgress.totalIncorrectAnswers)) * 100)
                  : 0}%
              </p>
              <p className="text-sm text-muted-foreground">Accuracy</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{session.userProgress.bestStreak}</p>
              <p className="text-sm text-muted-foreground">Best Streak</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{session.userProgress.achievements.length}</p>
              <p className="text-sm text-muted-foreground">Achievements</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Quiz Header */}
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{currentMode.icon}</span>
            <h3 className="text-xl font-semibold">{currentMode.name} Mode</h3>
          </div>
          <p className="text-sm text-muted-foreground">Question {questionNumber}</p>
        </div>
        
        <div className="text-right space-y-1">
          <p className="text-2xl font-bold">{score.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground">Score</p>
        </div>
      </div>
      
      {/* Status Bar */}
      <div className="grid grid-cols-4 gap-3 text-center">
        {currentMode.settings.livesAllowed !== undefined && (
          <div>
            <p className="text-lg">{"❤️".repeat(Math.max(0, lives))}</p>
            <p className="text-xs text-muted-foreground">Lives</p>
          </div>
        )}
        <div>
          <p className="text-lg font-bold">{streak}</p>
          <p className="text-xs text-muted-foreground">Streak</p>
        </div>
        <div>
          <p className="text-lg font-bold">{comboMultiplier}x</p>
          <p className="text-xs text-muted-foreground">Combo</p>
        </div>
        {timeLeft !== null && (
          <div>
            <p className={cn("text-lg font-bold", timeLeft <= 3 && "text-red-600 animate-pulse")}>
              {timeLeft}s
            </p>
            <p className="text-xs text-muted-foreground">Time</p>
          </div>
        )}
      </div>
      
      {/* Question */}
      {currentQuestion && (
        <div className="space-y-6">
          <div className="text-center">
            <h4 className="text-xl font-medium">{currentQuestion.question}</h4>
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
                placeholder="Type your answer..."
                className="w-full p-3 border rounded-lg"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.currentTarget.value) {
                    handleAnswer(e.currentTarget.value);
                  }
                }}
                disabled={showResult}
              />
              {showResult && (
                <p className="text-center">
                  Correct answer: <strong>{currentQuestion.correctAnswer}</strong>
                </p>
              )}
            </div>
          ) : null}
          
          {/* Result Feedback */}
          {showResult && (
            <div className={cn(
              "text-center p-4 rounded-lg",
              selectedAnswer === currentQuestion.correctAnswer 
                ? "bg-green-500/20 text-green-600" 
                : "bg-red-500/20 text-red-600"
            )}>
              <p className="text-lg font-semibold">
                {selectedAnswer === currentQuestion.correctAnswer 
                  ? `Correct! +${(currentQuestion.points || 10) * comboMultiplier} points` 
                  : 'Incorrect!'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}