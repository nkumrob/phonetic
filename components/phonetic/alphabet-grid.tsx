'use client';

import React, { useState, useEffect, useRef } from 'react';
import { NATO_ALPHABET } from '@/lib/constants/phonetic-alphabet';
import { PhoneticCard } from './phonetic-card';
import { PhoneticCardSkeleton } from '@/components/ui/skeleton';

export function AlphabetGrid() {
  const [speakingLetter, setSpeakingLetter] = useState<string | null>(null);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const gridRef = useRef<HTMLDivElement>(null);

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
    
    return () => clearTimeout(timer);
  }, []);

  const handleCardClick = (letter: string, codeWord: string) => {
    // Just play audio on click, don't select
    handleSpeak(letter, codeWord);
  };

  const handleSpeak = (letter: string, codeWord: string) => {
    setSpeakingLetter(letter);
    
    // Use browser's text-to-speech
    if ('speechSynthesis' in window) {
      // Chrome workaround: speak empty string first
      const dummy = new SpeechSynthesisUtterance('');
      window.speechSynthesis.speak(dummy);
      
      // Then speak actual text with a small delay
      setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(codeWord);
        utterance.rate = 0.9; // Slightly slower for clarity
        utterance.pitch = 1;
        utterance.volume = 1;
        
        // Reset speaking state when done
        utterance.onend = () => setSpeakingLetter(null);
        utterance.onerror = () => setSpeakingLetter(null);
        
        // Speak the code word
        window.speechSynthesis.speak(utterance);
      }, 50);
    }
  };

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
  }, [focusedIndex]);

  // Focus the card when focusedIndex changes
  useEffect(() => {
    const cards = gridRef.current?.querySelectorAll('.phonetic-card');
    if (cards && cards[focusedIndex]) {
      (cards[focusedIndex] as HTMLElement).focus();
    }
  }, [focusedIndex]);

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
              ipa={item.ipa}
              isSpeaking={speakingLetter === item.letter}
              isFocused={index === focusedIndex}
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
      
      {/* Keyboard shortcuts guide */}
      <div className="mt-6 text-center text-sm text-muted-foreground keyboard-shortcuts no-print">
        <p>
          <kbd className="px-2 py-1 bg-muted rounded text-xs">←→↑↓</kbd> Navigate • 
          <kbd className="px-2 py-1 bg-muted rounded text-xs ml-2">Enter</kbd> Select • 
          <kbd className="px-2 py-1 bg-muted rounded text-xs ml-2">S</kbd> Speak
        </p>
      </div>
    </div>
  );
}