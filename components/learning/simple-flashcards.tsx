'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui';
import { NATO_ALPHABET } from '@/lib/constants/phonetic-alphabet';
import { useSimpleAppState } from '@/lib/contexts/simple-app-context';
import { cn } from '@/lib/utils/cn';
import { speechManager } from '@/lib/utils/speech-synthesis';

interface SimpleFlashcardsProps {
  onComplete?: () => void;
}

export function SimpleFlashcards({ onComplete }: SimpleFlashcardsProps) {
  const { state, updateFlashcardReview } = useSimpleAppState();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [reviewedLetters, setReviewedLetters] = useState<Set<string>>(new Set());
  const [mode, setMode] = useState<'sequential' | 'random'>('sequential');

  const currentCard = NATO_ALPHABET[currentIndex];
  const totalCards = NATO_ALPHABET.length;
  const reviewedCount = reviewedLetters.size;

  // Play sound for current letter
  const playSound = () => {
    if (state.preferences.soundEnabled) {
      // Speak the full phrase: "A" as in "Alpha" for clarity
      speechManager.speak(`"${currentCard.letter}" as in "${currentCard.codeWord}"`);
    }
  };

  // Handle card flip
  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    
    // Track review on first flip
    if (!isFlipped && !reviewedLetters.has(currentCard.letter)) {
      updateFlashcardReview(currentCard.letter);
      setReviewedLetters(prev => new Set(prev).add(currentCard.letter));
    }
  };

  // Navigate to next card
  const nextCard = () => {
    setIsFlipped(false);
    
    if (mode === 'sequential') {
      setCurrentIndex((prev) => (prev + 1) % totalCards);
    } else {
      // Random mode
      let newIndex;
      do {
        newIndex = Math.floor(Math.random() * totalCards);
      } while (newIndex === currentIndex && totalCards > 1);
      setCurrentIndex(newIndex);
    }
  };

  // Navigate to previous card
  const previousCard = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + totalCards) % totalCards);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case ' ':
        case 'Enter':
          e.preventDefault();
          handleFlip();
          break;
        case 'ArrowRight':
          e.preventDefault();
          nextCard();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          previousCard();
          break;
        case 'p':
        case 'P':
          e.preventDefault();
          playSound();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      // Cleanup speech on unmount
      speechManager.stop();
    };
  }, [currentIndex, isFlipped, handleFlip, nextCard, playSound, previousCard]);

  return (
    <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="text-center space-y-1 sm:space-y-2">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-headlines">Flashcards</h2>
        <p className="text-xs sm:text-base text-secondary px-4">
          Click the card to flip • Use arrow keys to navigate
        </p>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm font-medium">
          <span>Card {currentIndex + 1} of {totalCards}</span>
          <span>{reviewedCount} reviewed</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all"
            style={{ width: `${((currentIndex + 1) / totalCards) * 100}%` }}
          />
        </div>
      </div>

      {/* Mode Toggle */}
      <div className="flex justify-center gap-2">
        <Button
          variant={mode === 'sequential' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setMode('sequential')}
        >
          Sequential
        </Button>
        <Button
          variant={mode === 'random' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setMode('random')}
        >
          Random
        </Button>
      </div>

      {/* Flashcard */}
      <div className="relative h-80 sm:h-96 perspective-1000">
        <div
          className={cn(
            "absolute inset-0 w-full h-full transition-transform duration-500 transform-style-preserve-3d cursor-pointer",
            isFlipped && "rotate-y-180"
          )}
          onClick={handleFlip}
        >
          {/* Front of card */}
          <div className="absolute inset-0 w-full h-full backface-hidden">
            <div className="h-full p-4 sm:p-8 rounded-xl bg-coolBlue-500 text-white shadow-lg flex flex-col items-center justify-center">
              <div className="text-6xl sm:text-8xl font-black mb-4 tracking-headlines">{currentCard.letter}</div>
              <p className="text-base sm:text-lg">Click to reveal</p>
            </div>
          </div>

          {/* Back of card */}
          <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180">
            <div className="h-full p-4 sm:p-8 rounded-xl bg-warmAmber-600 text-white shadow-lg flex flex-col items-center justify-center">
              <div className="text-4xl sm:text-6xl font-black mb-2 sm:mb-4 tracking-headlines">{currentCard.codeWord}</div>
              <div className="text-xl sm:text-3xl mb-1 sm:mb-2">&quot;{currentCard.letter}&quot; as in &quot;{currentCard.codeWord}&quot;</div>
              <div className="text-lg sm:text-xl mb-1 sm:mb-2">{currentCard.pronunciation}</div>
              <div className="text-base sm:text-lg">IPA: {currentCard.ipa}</div>
              
              <Button
                variant="secondary"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  playSound();
                }}
                className="bg-warmNeutral-900 text-white hover:bg-warmNeutral-800 border-2 border-warmNeutral-700 mt-6"
              >
                🔊 Play Sound
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex justify-center gap-2 sm:gap-4">
        <Button
          variant="secondary"
          onClick={previousCard}
          disabled={mode === 'random'}
          className="text-sm sm:text-base px-3 sm:px-4"
        >
          <span className="hidden sm:inline">← Previous</span>
          <span className="sm:hidden">←</span>
        </Button>
        
        <Button
          variant="secondary"
          onClick={handleFlip}
          className="text-sm sm:text-base px-3 sm:px-4"
        >
          {isFlipped ? (
            <>
              <span className="hidden sm:inline">Show Letter</span>
              <span className="sm:hidden">Letter</span>
            </>
          ) : (
            <>
              <span className="hidden sm:inline">Show Code</span>
              <span className="sm:hidden">Code</span>
            </>
          )}
        </Button>
        
        <Button
          variant="secondary"
          onClick={nextCard}
          className="text-sm sm:text-base px-3 sm:px-4"
        >
          <span className="hidden sm:inline">Next →</span>
          <span className="sm:hidden">→</span>
        </Button>
      </div>

      {/* Review Summary */}
      {reviewedCount === totalCards && (
        <div className="text-center p-8 bg-warmNeutral-50 dark:bg-warmNeutral-900/20 border-2 border-warmNeutral-200 rounded-xl">
          <h3 className="text-2xl font-bold text-foreground mb-2">
            Great job! You&apos;ve reviewed all cards.
          </h3>
          <div className="flex gap-4 justify-center mt-4">
            <Button
              variant="secondary"
              onClick={() => {
                setReviewedLetters(new Set());
                setCurrentIndex(0);
              }}
            >
              Review Again
            </Button>
            {onComplete && (
              <Button onClick={onComplete}>
                Back to Practice
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts - Hidden on mobile */}
      <div className="hidden sm:block text-center text-sm text-secondary">
        <p>Keyboard shortcuts: Space/Enter = Flip • ← → = Navigate • P = Play sound</p>
      </div>
    </div>
  );
}

// Add CSS for 3D card flip effect
const cardStyles = `
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

// Inject styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = cardStyles;
  document.head.appendChild(style);
}