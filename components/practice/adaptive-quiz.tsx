'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils/cn';
import { AdaptiveQuizSystem, AdaptiveQuestion } from '@/lib/quiz/adaptive-quiz-system';
import { useUnifiedStateContext } from '@/lib/contexts/unified-state-context';
import { useSoundEffects } from '@/lib/hooks/use-sound-effects';
import { useXPAnimation } from '@/components/gamification';
import { LevelSystem } from '@/lib/core/level-system';
import { CelebrationSystem, CELEBRATION_PRESETS } from '@/components/gamification';

interface AdaptiveQuizProps {
  mode: 'learn' | 'practice' | 'challenge';
  onComplete: () => void;
  onSessionSaved: () => void;
}

export function AdaptiveQuiz({ mode, onComplete, onSessionSaved }: AdaptiveQuizProps) {
  const { state, updateXP, addQuizResult } = useUnifiedStateContext();
  const { showXPGain, XPGainDisplay } = useXPAnimation();
  const { playCorrect, playIncorrect, playStreak } = useSoundEffects();
  
  // Initialize adaptive system
  const [quizSystem] = useState(() => new AdaptiveQuizSystem(state.learning.letterStates));
  
  // Quiz state
  const [currentQuestion, setCurrentQuestion] = useState<AdaptiveQuestion | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [questionNumber, setQuestionNumber] = useState(0);
  const [questionsAnswered, setQuestionsAnswered] = useState({ correct: 0, incorrect: 0 });
  const [sessionStreak, setSessionStreak] = useState(0);
  const [questionStartTime, setQuestionStartTime] = useState<number>(0);
  const [sessionStartTime] = useState(Date.now());
  const [showCelebration, setShowCelebration] = useState<any>(null);
  const [learningStats, setLearningStats] = useState(quizSystem.getStatistics());
  
  const QUESTIONS_PER_SESSION = mode === 'learn' ? 20 : 10;
  
  // Load first question
  useEffect(() => {
    loadNextQuestion();
  }, []);
  
  const loadNextQuestion = () => {
    if (questionNumber >= QUESTIONS_PER_SESSION) {
      endQuiz();
      return;
    }
    
    const question = quizSystem.getNextQuestion(mode);
    setCurrentQuestion(question);
    setSelectedAnswer(null);
    setShowResult(false);
    setQuestionNumber(prev => prev + 1);
    setQuestionStartTime(Date.now());
    
    // Play audio if audio question
    if (question.type === 'audio-to-code' && 'speechSynthesis' in window) {
      setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(question.code);
        utterance.rate = 0.8;
        window.speechSynthesis.speak(utterance);
      }, 500);
    }
  };
  
  const handleAnswer = (answer: string) => {
    if (showResult) return;
    
    const responseTime = Date.now() - questionStartTime;
    const isCorrect = answer === currentQuestion?.correctAnswer;
    
    setSelectedAnswer(answer);
    setShowResult(true);
    
    // Update adaptive system
    if (currentQuestion && currentQuestion.type !== 'spell-word') {
      quizSystem.updatePerformance(
        currentQuestion.letter,
        isCorrect,
        responseTime,
        currentQuestion.type
      );
    }
    
    // Update scores and XP
    if (isCorrect) {
      const newStreak = sessionStreak + 1;
      setSessionStreak(newStreak);
      setQuestionsAnswered(prev => ({ ...prev, correct: prev.correct + 1 }));
      playCorrect();
      
      // Calculate XP with streak bonus
      const baseXP = LevelSystem.calculateXPReward(mode, Math.min(newStreak * 5, 50));
      updateXP(baseXP);
      
      // Show XP animation
      const rect = (document.activeElement as HTMLElement)?.getBoundingClientRect();
      showXPGain(baseXP, {
        x: rect?.left + rect?.width / 2 || window.innerWidth / 2,
        y: rect?.top || window.innerHeight / 2,
      });
      
      // Check for streak milestones
      if (newStreak === 5 || newStreak === 10 || newStreak === 20) {
        triggerCelebration(`streak${newStreak}`);
        playStreak(newStreak);
      }
    } else {
      setSessionStreak(0);
      setQuestionsAnswered(prev => ({ ...prev, incorrect: prev.incorrect + 1 }));
      playIncorrect();
      
      // XP penalty
      const penalty = LevelSystem.calculateXPPenalty(mode);
      updateXP(-penalty);
      
      // Show XP loss
      const rect = (document.activeElement as HTMLElement)?.getBoundingClientRect();
      showXPGain(-penalty, {
        x: rect?.left + rect?.width / 2 || window.innerWidth / 2,
        y: rect?.top || window.innerHeight / 2,
      });
    }
    
    // Update learning stats
    setLearningStats(quizSystem.getStatistics());
    
    // Next question after delay
    setTimeout(() => loadNextQuestion(), 2000);
  };
  
  const triggerCelebration = (type: string) => {
    setShowCelebration(CELEBRATION_PRESETS[type as keyof typeof CELEBRATION_PRESETS]);
    setTimeout(() => setShowCelebration(null), 3000);
  };
  
  const endQuiz = () => {
    const totalTime = Date.now() - sessionStartTime;
    const accuracy = questionsAnswered.correct / (questionsAnswered.correct + questionsAnswered.incorrect) * 100;
    const passRequirement = mode === 'practice' ? 70 : 80;
    const passed = accuracy >= passRequirement;
    
    // Save quiz result
    addQuizResult({
      mode,
      difficulty: 'adaptive',
      correct: questionsAnswered.correct,
      incorrect: questionsAnswered.incorrect,
      score: Math.round(accuracy),
      streak: sessionStreak,
      averageTime: totalTime / QUESTIONS_PER_SESSION / 1000,
      timestamp: new Date().toISOString(),
    });
    
    onSessionSaved();
    
    if (passed && questionsAnswered.incorrect === 0) {
      triggerCelebration('perfectScore');
    }
    
    setTimeout(() => onComplete(), 2000);
  };
  
  if (!currentQuestion) return null;
  
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <XPGainDisplay />
      
      {showCelebration && (
        <CelebrationSystem config={showCelebration} />
      )}
      
      {/* Progress Header */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold">
            {mode === 'learn' ? 'Adaptive Learning' : mode === 'practice' ? 'Smart Practice' : 'Adaptive Challenge'}
          </h2>
          <Button variant="ghost" onClick={onComplete}>
            Exit
          </Button>
        </div>
        
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Question {questionNumber} of {QUESTIONS_PER_SESSION}</span>
            <span>{questionsAnswered.correct} correct, {questionsAnswered.incorrect} incorrect</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all"
              style={{ width: `${(questionNumber / QUESTIONS_PER_SESSION) * 100}%` }}
            />
          </div>
        </div>
        
        {/* Learning Stats */}
        <div className="grid grid-cols-5 gap-4 p-4 rounded-lg bg-muted/50">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{learningStats.mastered}</p>
            <p className="text-xs text-muted-foreground">Mastered</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{learningStats.learning}</p>
            <p className="text-xs text-muted-foreground">Learning</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-600">{learningStats.new}</p>
            <p className="text-xs text-muted-foreground">New</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">{learningStats.averageAccuracy}%</p>
            <p className="text-xs text-muted-foreground">Accuracy</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-amber-600">{sessionStreak}</p>
            <p className="text-xs text-muted-foreground">Streak</p>
          </div>
        </div>
      </div>
      
      {/* Question */}
      <div className="p-8 rounded-2xl bg-gradient-to-br from-background to-muted/20 border-2">
        <div className="space-y-6">
          <div className="text-center">
            <h4 className="text-xl font-medium">{currentQuestion.question}</h4>
            
            {/* Difficulty indicator */}
            <div className="mt-2 flex justify-center gap-1">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "w-2 h-2 rounded-full",
                    i < Math.ceil(currentQuestion.difficulty * 5)
                      ? "bg-amber-500"
                      : "bg-muted"
                  )}
                />
              ))}
            </div>
            
            {currentQuestion.type === 'audio-to-code' && (
              <Button
                variant="ghost"
                size="sm"
                className="mt-3"
                onClick={() => {
                  if ('speechSynthesis' in window) {
                    const utterance = new SpeechSynthesisUtterance(currentQuestion.code);
                    utterance.rate = 0.8;
                    window.speechSynthesis.speak(utterance);
                  }
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
                  ? `Correct! +${LevelSystem.calculateXPReward(mode, Math.min(sessionStreak * 5, 50))} XP`
                  : `Incorrect. -${LevelSystem.calculateXPPenalty(mode)} XP`}
              </p>
              {showResult && learningStats.nextReviewIn !== 'No reviews scheduled' && (
                <p className="text-sm mt-1 opacity-75">
                  Next review: {learningStats.nextReviewIn}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}