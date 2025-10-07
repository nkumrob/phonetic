'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { NATO_ALPHABET } from '@/lib/constants/phonetic-alphabet';
import { PhoneticCard } from './phonetic-card';
import { PhoneticCardSkeleton } from '@/components/ui/skeleton';
import { speechManager } from '@/lib/utils/speech-synthesis';

export function AlphabetGrid() {
  const [speakingLetter, setSpeakingLetter] = useState<string | null>(null);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const gridRef = useRef<HTMLDivElement>(null);
  const speakingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize loading state
  useEffect(() => {
    // Short delay to ensure smooth animation
    const timer = setTimeout(() => {
      setIsLoading(false);
      // Focus the grid after loading for keyboard navigation
      if (gridRef.current) {
        gridRef.current.focus();
      }
    }, 300);
    
    return () => {
      clearTimeout(timer);
      // Cleanup speech on unmount
      speechManager.stop();
    };
  }, []);

  const handleSpeak = useCallback((letter: string, codeWord: string) => {
    // Clear any existing timer first to prevent memory leaks
    if (speakingTimerRef.current) {
      clearTimeout(speakingTimerRef.current);
    }

    setSpeakingLetter(letter);

    // Use centralized speech manager that respects global settings
    // Say "A" as in "Alpha" format for clarity
    speechManager.speak(`"${letter}" as in "${codeWord}"`);

    // Reset speaking state after a reasonable time
    speakingTimerRef.current = setTimeout(() => {
      setSpeakingLetter(null);
      speakingTimerRef.current = null;
    }, 1500);
  }, []);

  const handleCardClick = useCallback((letter: string, codeWord: string) => {
    // Just play audio on click, don't select
    handleSpeak(letter, codeWord);
  }, [handleSpeak]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if we're in the alphabet grid context
      const isInGrid = gridRef.current?.contains(document.activeElement);
      if (!isInGrid) return;

      const currentIndex = focusedIndex;
      const totalItems = NATO_ALPHABET.length;
      const columnsPerRow = window.innerWidth < 640 ? 3 : window.innerWidth < 1024 ? 4 : 6;
      
      switch (e.key) {
        case 'ArrowRight':
          e.preventDefault();
          setFocusedIndex((currentIndex + 1) % totalItems);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          setFocusedIndex((currentIndex - 1 + totalItems) % totalItems);
          break;
        case 'ArrowDown':
          e.preventDefault();
          const nextDown = currentIndex + columnsPerRow;
          setFocusedIndex(nextDown < totalItems ? nextDown : currentIndex);
          break;
        case 'ArrowUp':
          e.preventDefault();
          const nextUp = currentIndex - columnsPerRow;
          setFocusedIndex(nextUp >= 0 ? nextUp : currentIndex);
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          if (currentIndex >= 0 && currentIndex < totalItems) {
            handleCardClick(NATO_ALPHABET[currentIndex].letter, NATO_ALPHABET[currentIndex].codeWord);
          }
          break;
        case 's':
        case 'S':
          e.preventDefault();
          if (currentIndex >= 0 && currentIndex < totalItems) {
            handleSpeak(NATO_ALPHABET[currentIndex].letter, NATO_ALPHABET[currentIndex].codeWord);
          }
          break;
      }
    };

    // Add listener at document level for better keyboard navigation
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [focusedIndex, handleCardClick, handleSpeak]);

  // Focus the card when focusedIndex changes
  useEffect(() => {
    const cards = gridRef.current?.querySelectorAll('.phonetic-card');
    if (cards && cards[focusedIndex]) {
      (cards[focusedIndex] as HTMLElement).focus();
    }
  }, [focusedIndex]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (speakingTimerRef.current) {
        clearTimeout(speakingTimerRef.current);
      }
    };
  }, []);

  return (
    <div className="w-full">
      <div 
        ref={gridRef}
        className="alphabet-grid focus:outline-none"
        tabIndex={0}
        role="grid"
        aria-label="NATO Phonetic Alphabet Grid. Use arrow keys to navigate, Enter to select, S to speak."
      >
        {isLoading ? (
          // Show skeleton cards while loading
          Array.from({ length: 26 }).map((_, index) => (
            <PhoneticCardSkeleton key={index} />
          ))
        ) : (
          // Show actual cards when loaded
          NATO_ALPHABET.map((item, index) => (
            <PhoneticCard
              key={item.letter}
              letter={item.letter}
              codeWord={item.codeWord}
              pronunciation={item.pronunciation}
              isSpeaking={speakingLetter === item.letter}
              onClick={() => {
                setFocusedIndex(index);
                handleCardClick(item.letter, item.codeWord);
              }}
              onSpeak={() => handleSpeak(item.letter, item.codeWord)}
              onFocus={() => setFocusedIndex(index)}
            />
          ))
        )}
      </div>
      
      {/* Keyboard shortcuts guide - Mobile friendly */}
      <div className="mt-6 text-center text-sm text-secondary keyboard-shortcuts no-print">
        <p className="flex flex-wrap justify-center items-center gap-2">
          <span className="flex items-center gap-1">
            <kbd className="px-2 py-1 bg-muted rounded-md text-xs font-mono">←→↑↓</kbd> 
            <span>Navigate</span>
          </span>
          <span className="text-tertiary">•</span>
          <span className="flex items-center gap-1">
            <kbd className="px-2 py-1 bg-muted rounded-md text-xs font-mono">Enter</kbd> 
            <span>Select</span>
          </span>
          <span className="text-tertiary">•</span>
          <span className="flex items-center gap-1">
            <kbd className="px-2 py-1 bg-muted rounded-md text-xs font-mono">S</kbd> 
            <span>Speak</span>
          </span>
        </p>
      </div>
    </div>
  );
}