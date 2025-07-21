'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui';
import { NATO_ALPHABET } from '@/lib/constants/phonetic-alphabet';
import { cn } from '@/lib/utils/cn';

type QuestionType = 'letter-to-code' | 'code-to-letter' | 'audio-to-code' | 'mixed';
type Difficulty = 'easy' | 'medium' | 'hard';

interface Question {
  id: string;
  type: QuestionType;
  question: string;
  options: string[];
  correctAnswer: string;
  letter?: string;
  codeWord?: string;
}

interface QuizStats {
  correct: number;
  incorrect: number;
  streak: number;
  bestStreak: number;
  totalTime: number;
}

export function QuizInterface() {
  const [isQuizActive, setIsQuizActive] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [stats, setStats] = useState<QuizStats>({
    correct: 0,
    incorrect: 0,
    streak: 0,
    bestStreak: 0,
    totalTime: 0
  });
  const [timer, setTimer] = useState(0);
  const [questionNumber, setQuestionNumber] = useState(0);
  const totalQuestions = 10;

  // Generate random question
  const generateQuestion = (): Question => {
    const types: QuestionType[] = 
      difficulty === 'easy' ? ['letter-to-code'] :
      difficulty === 'medium' ? ['letter-to-code', 'code-to-letter'] :
      ['letter-to-code', 'code-to-letter', 'audio-to-code'];
    
    const type = types[Math.floor(Math.random() * types.length)];
    const randomIndex = Math.floor(Math.random() * NATO_ALPHABET.length);
    const correctItem = NATO_ALPHABET[randomIndex];
    
    // Generate wrong options
    const wrongOptions = NATO_ALPHABET
      .filter((_, i) => i !== randomIndex)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    
    let question: Question;
    
    switch (type) {
      case 'letter-to-code':
        question = {
          id: Math.random().toString(36),
          type,
          question: `What is the phonetic code for the letter "${correctItem.letter}"?`,
          options: [correctItem.codeWord, ...wrongOptions.map(o => o.codeWord)].sort(() => Math.random() - 0.5),
          correctAnswer: correctItem.codeWord,
          letter: correctItem.letter,
          codeWord: correctItem.codeWord
        };
        break;
        
      case 'code-to-letter':
        question = {
          id: Math.random().toString(36),
          type,
          question: `Which letter does "${correctItem.codeWord}" represent?`,
          options: [correctItem.letter, ...wrongOptions.map(o => o.letter)].sort(() => Math.random() - 0.5),
          correctAnswer: correctItem.letter,
          letter: correctItem.letter,
          codeWord: correctItem.codeWord
        };
        break;
        
      case 'audio-to-code':
        question = {
          id: Math.random().toString(36),
          type,
          question: `Listen to the pronunciation and select the correct code word`,
          options: [correctItem.codeWord, ...wrongOptions.map(o => o.codeWord)].sort(() => Math.random() - 0.5),
          correctAnswer: correctItem.codeWord,
          letter: correctItem.letter,
          codeWord: correctItem.codeWord
        };
        break;
        
      default:
        question = generateQuestion(); // Fallback
    }
    
    return question;
  };

  // Start quiz
  const startQuiz = () => {
    setIsQuizActive(true);
    setQuestionNumber(1);
    setStats({
      correct: 0,
      incorrect: 0,
      streak: 0,
      bestStreak: 0,
      totalTime: 0
    });
    setTimer(0);
    setCurrentQuestion(generateQuestion());
  };

  // Handle answer selection
  const handleAnswer = (answer: string) => {
    if (showResult) return;
    
    setSelectedAnswer(answer);
    setShowResult(true);
    
    const isCorrect = answer === currentQuestion?.correctAnswer;
    
    setStats(prev => ({
      ...prev,
      correct: isCorrect ? prev.correct + 1 : prev.correct,
      incorrect: isCorrect ? prev.incorrect : prev.incorrect + 1,
      streak: isCorrect ? prev.streak + 1 : 0,
      bestStreak: isCorrect ? Math.max(prev.bestStreak, prev.streak + 1) : prev.bestStreak,
    }));
  };

  // Next question
  const nextQuestion = () => {
    if (questionNumber >= totalQuestions) {
      endQuiz();
    } else {
      setQuestionNumber(prev => prev + 1);
      setCurrentQuestion(generateQuestion());
      setSelectedAnswer(null);
      setShowResult(false);
    }
  };

  // End quiz
  const endQuiz = () => {
    setIsQuizActive(false);
    setStats(prev => ({ ...prev, totalTime: timer }));
    // Save to localStorage
    const savedStats = JSON.parse(localStorage.getItem('phoneticQuizStats') || '[]');
    savedStats.push({
      date: new Date().toISOString(),
      ...stats,
      totalTime: timer,
      difficulty
    });
    localStorage.setItem('phoneticQuizStats', JSON.stringify(savedStats));
  };

  // Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isQuizActive && !showResult) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isQuizActive, showResult]);

  // Play audio for audio questions
  useEffect(() => {
    if (currentQuestion?.type === 'audio-to-code' && !showResult) {
      // Speak the code word
      if ('speechSynthesis' in window && currentQuestion.codeWord) {
        const utterance = new SpeechSynthesisUtterance(currentQuestion.codeWord);
        utterance.rate = 0.8;
        window.speechSynthesis.speak(utterance);
      }
    }
  }, [currentQuestion, showResult]);

  if (!isQuizActive) {
    return (
      <div className="max-w-2xl mx-auto text-center space-y-6">
        <div className="space-y-4">
          <h3 className="text-2xl font-semibold">Test Your Knowledge</h3>
          <p className="text-muted-foreground">
            Challenge yourself with our phonetic alphabet quiz. Choose your difficulty level and see how well you know the NATO codes!
          </p>
        </div>
        
        <div className="flex gap-3 justify-center mb-6">
          <Button
            variant={difficulty === 'easy' ? 'primary' : 'secondary'}
            onClick={() => setDifficulty('easy')}
          >
            Easy
          </Button>
          <Button
            variant={difficulty === 'medium' ? 'primary' : 'secondary'}
            onClick={() => setDifficulty('medium')}
          >
            Medium
          </Button>
          <Button
            variant={difficulty === 'hard' ? 'primary' : 'secondary'}
            onClick={() => setDifficulty('hard')}
          >
            Hard
          </Button>
        </div>
        
        <div className="bg-muted p-4 rounded-lg text-sm">
          <p><strong>Easy:</strong> Letter to code word only</p>
          <p><strong>Medium:</strong> Letter to code & code to letter</p>
          <p><strong>Hard:</strong> All types including audio recognition</p>
        </div>
        
        <Button size="lg" onClick={startQuiz}>
          Start Quiz
        </Button>
        
        {/* Previous scores */}
        <div className="mt-8">
          <h4 className="text-lg font-semibold mb-3">Recent Scores</h4>
          <RecentScores />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-muted-foreground">
            Question {questionNumber} of {totalQuestions}
          </span>
          <span className="text-sm text-muted-foreground">
            Time: {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
          </span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
          />
        </div>
      </div>
      
      {/* Question */}
      {currentQuestion && (
        <div className="space-y-6">
          <div className="text-center space-y-4">
            <h3 className="text-xl font-semibold">{currentQuestion.question}</h3>
            
            {currentQuestion.type === 'audio-to-code' && (
              <Button
                variant="secondary"
                onClick={() => {
                  if ('speechSynthesis' in window && currentQuestion.codeWord) {
                    const utterance = new SpeechSynthesisUtterance(currentQuestion.codeWord);
                    utterance.rate = 0.8;
                    window.speechSynthesis.speak(utterance);
                  }
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5 mr-2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z"
                  />
                </svg>
                Play Again
              </Button>
            )}
          </div>
          
          {/* Options */}
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
                  'py-4 text-lg',
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
          
          {/* Result */}
          {showResult && (
            <div className="text-center space-y-4">
              <p className={cn(
                'text-lg font-semibold',
                selectedAnswer === currentQuestion.correctAnswer ? 'text-green-600' : 'text-red-600'
              )}>
                {selectedAnswer === currentQuestion.correctAnswer ? 'Correct!' : 'Incorrect'}
              </p>
              
              {selectedAnswer !== currentQuestion.correctAnswer && (
                <p className="text-muted-foreground">
                  The correct answer is: <strong>{currentQuestion.correctAnswer}</strong>
                </p>
              )}
              
              <Button onClick={nextQuestion}>
                {questionNumber >= totalQuestions ? 'Finish Quiz' : 'Next Question'}
              </Button>
            </div>
          )}
        </div>
      )}
      
      {/* Stats */}
      <div className="mt-8 flex justify-center gap-6 text-sm">
        <div className="text-center">
          <p className="text-2xl font-bold text-green-600">{stats.correct}</p>
          <p className="text-muted-foreground">Correct</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-red-600">{stats.incorrect}</p>
          <p className="text-muted-foreground">Incorrect</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-primary">{stats.streak}</p>
          <p className="text-muted-foreground">Streak</p>
        </div>
      </div>
    </div>
  );
}

interface Score {
  date: string;
  correct: number;
  incorrect: number;
  difficulty: string;
  totalTime: number;
  streak: number;
  bestStreak: number;
}

function RecentScores() {
  const [scores, setScores] = useState<Score[]>([]);
  
  useEffect(() => {
    const savedStats = JSON.parse(localStorage.getItem('phoneticQuizStats') || '[]');
    setScores(savedStats.slice(-5).reverse());
  }, []);
  
  if (scores.length === 0) {
    return <p className="text-muted-foreground">No previous scores yet</p>;
  }
  
  return (
    <div className="space-y-2">
      {scores.map((score, i) => (
        <div key={i} className="flex justify-between items-center bg-muted p-3 rounded">
          <span className="text-sm">
            {new Date(score.date).toLocaleDateString()}
          </span>
          <span className="text-sm font-medium">
            {score.correct}/{score.correct + score.incorrect} ({Math.round((score.correct / (score.correct + score.incorrect)) * 100)}%)
          </span>
          <span className="text-sm text-muted-foreground">
            {score.difficulty}
          </span>
        </div>
      ))}
    </div>
  );
}