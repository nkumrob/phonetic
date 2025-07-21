'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui';
import { NATO_ALPHABET } from '@/lib/constants/phonetic-alphabet';
import { PHONETIC_MNEMONICS } from '@/lib/constants/mnemonics';
import { cn } from '@/lib/utils/cn';

interface FlashcardData {
  letter: string;
  codeWord: string;
  pronunciation: string;
  ipa: string;
  mnemonic: string;
}

export function Flashcards() {
  const [cards, setCards] = useState<FlashcardData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isStudyMode, setIsStudyMode] = useState(false);
  const [studyProgress, setStudyProgress] = useState<{[key: string]: number}>({});
  const [showMnemonics, setShowMnemonics] = useState(true);

  // Initialize cards
  useEffect(() => {
    const flashcardData = NATO_ALPHABET.map(item => {
      const mnemonic = PHONETIC_MNEMONICS.find(m => m.letter === item.letter);
      return {
        ...item,
        mnemonic: mnemonic?.mnemonic || ''
      };
    });
    setCards(flashcardData);
    
    // Load progress from localStorage
    const saved = localStorage.getItem('flashcardProgress');
    if (saved) {
      setStudyProgress(JSON.parse(saved));
    }
  }, []);

  // Save progress
  useEffect(() => {
    if (Object.keys(studyProgress).length > 0) {
      localStorage.setItem('flashcardProgress', JSON.stringify(studyProgress));
    }
  }, [studyProgress]);

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

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const markAsLearned = () => {
    const currentCard = cards[currentIndex];
    setStudyProgress(prev => ({
      ...prev,
      [currentCard.letter]: (prev[currentCard.letter] || 0) + 1
    }));
    handleNext();
  };

  const resetProgress = () => {
    setStudyProgress({});
    localStorage.removeItem('flashcardProgress');
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowRight':
        handleNext();
        break;
      case 'ArrowLeft':
        handlePrevious();
        break;
      case ' ':
        e.preventDefault();
        handleFlip();
        break;
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, isFlipped]);

  if (cards.length === 0) return null;

  const currentCard = cards[currentIndex];
  const learnedCount = Object.values(studyProgress).filter(v => v >= 3).length;
  const progressPercentage = (learnedCount / cards.length) * 100;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center space-y-4">
        <h3 className="text-2xl font-semibold">Flashcard Study</h3>
        <p className="text-muted-foreground">
          Click the card to flip it. Use arrow keys to navigate.
        </p>
      </div>

      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Progress: {learnedCount}/{cards.length} mastered</span>
          <span>{Math.round(progressPercentage)}%</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Flashcard */}
      <div className="relative h-96 perspective-1000">
        <div
          className={cn(
            "absolute inset-0 w-full h-full transition-transform duration-500 transform-style-preserve-3d cursor-pointer",
            isFlipped && "rotate-y-180"
          )}
          onClick={handleFlip}
        >
          {/* Front of card */}
          <div className="absolute inset-0 w-full h-full backface-hidden">
            <div className="w-full h-full bg-background border-2 border-border rounded-lg shadow-lg flex flex-col items-center justify-center p-8">
              <div className="text-8xl font-bold text-primary mb-4">
                {currentCard.letter}
              </div>
              <p className="text-muted-foreground text-sm">
                Click to see the phonetic code
              </p>
            </div>
          </div>

          {/* Back of card */}
          <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180">
            <div className="w-full h-full bg-background border-2 border-border rounded-lg shadow-lg flex flex-col items-center justify-center p-8 space-y-4">
              <div className="text-6xl font-bold text-primary">
                {currentCard.codeWord}
              </div>
              <div className="text-xl text-muted-foreground">
                {currentCard.pronunciation}
              </div>
              <div className="text-lg text-muted-foreground font-mono">
                [{currentCard.ipa}]
              </div>
              {showMnemonics && currentCard.mnemonic && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <p className="text-sm italic">{currentCard.mnemonic}</p>
                </div>
              )}
              <div className="flex gap-2 mt-4">
                {studyProgress[currentCard.letter] >= 3 ? (
                  <span className="text-green-600 font-semibold">✓ Mastered</span>
                ) : (
                  <span className="text-muted-foreground text-sm">
                    Studied {studyProgress[currentCard.letter] || 0} times
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation controls */}
      <div className="flex justify-between items-center">
        <Button
          variant="secondary"
          onClick={handlePrevious}
          disabled={currentIndex === 0}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-5 h-5 mr-2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Previous
        </Button>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Card {currentIndex + 1} of {cards.length}
          </p>
        </div>

        <Button
          variant="secondary"
          onClick={handleNext}
          disabled={currentIndex === cards.length - 1}
        >
          Next
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-5 h-5 ml-2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </Button>
      </div>

      {/* Study controls */}
      {isStudyMode && (
        <div className="flex justify-center gap-3">
          <Button
            variant="secondary"
            onClick={() => handleNext()}
          >
            Skip
          </Button>
          <Button
            onClick={markAsLearned}
          >
            Mark as Learned
          </Button>
        </div>
      )}

      {/* Settings */}
      <div className="flex justify-center gap-3 text-sm">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsStudyMode(!isStudyMode)}
        >
          {isStudyMode ? 'Exit Study Mode' : 'Study Mode'}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowMnemonics(!showMnemonics)}
        >
          {showMnemonics ? 'Hide' : 'Show'} Mnemonics
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={resetProgress}
        >
          Reset Progress
        </Button>
      </div>

      {/* Keyboard shortcuts */}
      <div className="text-center text-sm text-muted-foreground">
        <p>
          <kbd className="px-2 py-1 bg-muted rounded text-xs">←→</kbd> Navigate • 
          <kbd className="px-2 py-1 bg-muted rounded text-xs ml-2">Space</kbd> Flip card
        </p>
      </div>
    </div>
  );
}