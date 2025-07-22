'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui';
import { NATO_ALPHABET } from '@/lib/constants/phonetic-alphabet';
import { PHONETIC_MNEMONICS } from '@/lib/constants/mnemonics';
import { cn } from '@/lib/utils/cn';
import { useSession } from '@/lib/contexts/session-context';
import { useXPAnimation, XPProgressBar } from '@/components/gamification';
import { useSoundEffects } from '@/lib/hooks/use-sound-effects';
import { calculateLevelFromTotalXP } from '@/lib/utils/xp-calculations';

interface FlashcardData {
  letter: string;
  codeWord: string;
  pronunciation: string;
  ipa: string;
  mnemonic: string;
  mastery: number; // 0-5 stars
}

export function EnhancedFlashcards() {
  const { session, updateFlashcardProgress, updateProgress } = useSession();
  const { showXPGain, XPGainDisplay } = useXPAnimation();
  const { playCorrect, playClick } = useSoundEffects();
  const [cards, setCards] = useState<FlashcardData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [studyMode, setStudyMode] = useState<'review' | 'test'>('review');
  const [showHints, setShowHints] = useState(true);
  const [cardsStudied, setCardsStudied] = useState(0);
  const [testAnswer, setTestAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Initialize cards with mastery levels
  useEffect(() => {
    const flashcardData = NATO_ALPHABET.map(item => {
      const mnemonic = PHONETIC_MNEMONICS.find(m => m.letter === item.letter);
      const progress = session.flashcardProgress[item.letter] || 0;
      return {
        ...item,
        mnemonic: mnemonic?.mnemonic || '',
        mastery: Math.min(progress, 5)
      };
    });
    setCards(flashcardData);
  }, [session.flashcardProgress]);

  const currentCard = cards[currentIndex];
  const xpInfo = calculateLevelFromTotalXP(session.userProgress.experience);
  
  // Calculate overall progress
  const totalMastery = cards.reduce((sum, card) => sum + card.mastery, 0);
  const maxMastery = cards.length * 5;
  const overallProgress = Math.round((totalMastery / maxMastery) * 100);

  const handleCardInteraction = (knew: boolean) => {
    if (studyMode === 'review') {
      const currentProgress = session.flashcardProgress[currentCard.letter] || 0;
      const newProgress = knew 
        ? Math.min(currentProgress + 1, 5) 
        : Math.max(currentProgress - 1, 0);
      
      updateFlashcardProgress(currentCard.letter, newProgress);
      setCardsStudied(prev => prev + 1);
      
      // Award XP for studying
      if (knew && newProgress > currentProgress) {
        const xpGain = 5 * (currentProgress + 1); // More XP for higher mastery
        updateProgress({ experience: session.userProgress.experience + xpGain });
        showXPGain(xpGain, {
          x: window.innerWidth / 2,
          y: window.innerHeight / 2,
          reason: 'Mastery increased!'
        });
        playCorrect();
      }
      
      // Auto advance after a short delay
      setTimeout(() => handleNext(), 800);
    }
  };

  const handleTestSubmit = () => {
    const correct = testAnswer.trim().toLowerCase() === currentCard.codeWord.toLowerCase();
    setIsCorrect(correct);
    setShowResult(true);
    
    if (correct) {
      playCorrect();
      const xpGain = 10;
      updateProgress({ experience: session.userProgress.experience + xpGain });
      showXPGain(xpGain, {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
        reason: 'Correct answer!'
      });
      
      // Increase mastery
      const currentProgress = session.flashcardProgress[currentCard.letter] || 0;
      updateFlashcardProgress(currentCard.letter, Math.min(currentProgress + 1, 5));
    }
    
    setTimeout(() => {
      setShowResult(false);
      setTestAnswer('');
      handleNext();
    }, 1500);
  };

  const handleNext = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % cards.length);
    }, 200);
  };

  const handlePrevious = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
    }, 200);
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    if (studyMode === 'test' && !showResult) return;
    
    switch (e.key) {
      case 'ArrowLeft':
        handlePrevious();
        break;
      case 'ArrowRight':
        handleNext();
        break;
      case ' ':
        setIsFlipped(!isFlipped);
        break;
      case '1':
        if (studyMode === 'review') handleCardInteraction(false);
        break;
      case '2':
        if (studyMode === 'review') handleCardInteraction(true);
        break;
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentIndex, isFlipped, studyMode, showResult]);

  if (!currentCard) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <XPGainDisplay />
      
      {/* Header with Progress */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-left">
            <h1 className="text-3xl font-bold">Flashcard Practice</h1>
            <p className="text-muted-foreground">
              {studyMode === 'review' ? 'Review mode - Learn at your pace' : 'Test mode - Check your knowledge'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Cards studied today</p>
            <p className="text-2xl font-bold text-primary">{cardsStudied}</p>
          </div>
        </div>
        
        {/* XP Progress */}
        <XPProgressBar
          current={xpInfo.currentLevelXP}
          max={xpInfo.xpForNextLevel}
          level={session.userProgress.level}
          size="small"
        />
      </div>

      {/* Mode Toggle */}
      <div className="flex justify-center gap-2">
        <Button
          variant={studyMode === 'review' ? 'primary' : 'secondary'}
          onClick={() => {
            setStudyMode('review');
            setShowResult(false);
            setTestAnswer('');
          }}
        >
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          Review Mode
        </Button>
        <Button
          variant={studyMode === 'test' ? 'primary' : 'secondary'}
          onClick={() => {
            setStudyMode('test');
            setIsFlipped(false);
            setShowResult(false);
            setTestAnswer('');
          }}
        >
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Test Mode
        </Button>
      </div>

      {/* Progress Overview */}
      <div className="bg-gradient-to-r from-primary/10 to-blue-500/10 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Overall Mastery</h3>
          <span className="text-2xl font-bold text-primary">{overallProgress}%</span>
        </div>
        <div className="bg-background/50 rounded-full h-3 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary to-blue-500 transition-all duration-500"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          Master all 26 letters to become a NATO alphabet expert!
        </p>
      </div>

      {/* Flashcard */}
      <div className="relative">
        {/* Card Counter */}
        <div className="text-center mb-4">
          <span className="text-sm text-muted-foreground">
            Card {currentIndex + 1} of {cards.length}
          </span>
        </div>

        {/* Card Container */}
        <div 
          ref={cardRef}
          className="relative h-[400px] cursor-pointer perspective-1000"
          onClick={() => studyMode === 'review' && setIsFlipped(!isFlipped)}
        >
          <div className={cn(
            "absolute inset-0 w-full h-full transition-transform duration-500 transform-style-preserve-3d",
            isFlipped && "rotate-y-180"
          )}>
            {/* Front of Card */}
            <div className="absolute inset-0 w-full h-full backface-hidden">
              <div className="card h-full flex flex-col items-center justify-center p-8 bg-gradient-to-br from-primary/5 to-blue-500/5">
                <div className="text-center space-y-4">
                  <div className="text-8xl font-black text-primary animate-scale-in">
                    {currentCard.letter}
                  </div>
                  {studyMode === 'test' && !showResult ? (
                    <div className="space-y-4">
                      <p className="text-lg text-muted-foreground">What&apos;s the code word?</p>
                      <input
                        type="text"
                        value={testAnswer}
                        onChange={(e) => setTestAnswer(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleTestSubmit()}
                        className="input text-center text-2xl"
                        placeholder="Type your answer..."
                        autoFocus
                      />
                      <Button onClick={handleTestSubmit} disabled={!testAnswer.trim()}>
                        Submit Answer
                      </Button>
                    </div>
                  ) : showResult ? (
                    <div className={cn(
                      "text-2xl font-bold animate-scale-in",
                      isCorrect ? "text-green-500" : "text-red-500"
                    )}>
                      {isCorrect ? "Correct! 🎉" : `Incorrect. It's ${currentCard.codeWord}`}
                    </div>
                  ) : (
                    <>
                      {showHints && (
                        <p className="text-sm text-muted-foreground">
                          Click card to reveal • Press Space to flip
                        </p>
                      )}
                      {/* Mastery Stars */}
                      <div className="flex justify-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={cn(
                              "w-6 h-6 transition-colors",
                              i < currentCard.mastery ? "text-yellow-500 fill-current" : "text-gray-300"
                            )}
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                          </svg>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Back of Card */}
            <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180">
              <div className="card h-full flex flex-col items-center justify-center p-8 bg-gradient-to-br from-blue-500/5 to-primary/5">
                <div className="text-center space-y-6 max-w-md">
                  <div className="text-6xl font-black text-primary animate-scale-in">
                    {currentCard.codeWord}
                  </div>
                  <div className="space-y-2">
                    <p className="text-2xl font-semibold">{currentCard.pronunciation}</p>
                    <p className="text-lg text-muted-foreground">[{currentCard.ipa}]</p>
                  </div>
                  {currentCard.mnemonic && (
                    <div className="bg-primary/10 rounded-lg p-4">
                      <p className="text-sm font-medium text-primary mb-1">Memory Tip:</p>
                      <p className="text-sm">{currentCard.mnemonic}</p>
                    </div>
                  )}
                  {studyMode === 'review' && (
                    <div className="flex justify-center gap-4 pt-4">
                      <Button
                        variant="secondary"
                        size="lg"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCardInteraction(false);
                        }}
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Need Practice
                      </Button>
                      <Button
                        variant="primary"
                        size="lg"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCardInteraction(true);
                        }}
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Got It!
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-8">
          <Button
            variant="ghost"
            size="lg"
            onClick={handlePrevious}
            className="group"
          >
            <svg className="w-6 h-6 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Previous
          </Button>

          <div className="flex gap-1">
            {cards.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all",
                  index === currentIndex 
                    ? "w-8 bg-primary" 
                    : "bg-gray-300 hover:bg-gray-400"
                )}
              />
            ))}
          </div>

          <Button
            variant="ghost"
            size="lg"
            onClick={handleNext}
            className="group"
          >
            Next
            <svg className="w-6 h-6 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Button>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-muted/50 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showHints}
                onChange={(e) => setShowHints(e.target.checked)}
                className="checkbox"
              />
              <span className="text-sm">Show hints</span>
            </label>
          </div>
          
          <div className="text-sm text-muted-foreground">
            <span className="font-mono bg-muted px-2 py-1 rounded">←→</span> Navigate • 
            <span className="font-mono bg-muted px-2 py-1 rounded ml-2">Space</span> Flip • 
            <span className="font-mono bg-muted px-2 py-1 rounded ml-2">1/2</span> Need Practice/Got It
          </div>
        </div>
      </div>
    </div>
  );
}

// CSS for card flip animation
const styles = `
  .perspective-1000 {
    perspective: 1000px;
  }
  .transform-style-preserve-3d {
    transform-style: preserve-3d;
  }
  .backface-hidden {
    backface-visibility: hidden;
  }
  .rotate-y-180 {
    transform: rotateY(180deg);
  }
`;

// Add styles to document
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}