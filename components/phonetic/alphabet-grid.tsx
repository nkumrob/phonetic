'use client';

import React, { useState } from 'react';
import { NATO_ALPHABET } from '@/lib/constants/phonetic-alphabet';
import { PhoneticCard } from './phonetic-card';

export function AlphabetGrid() {
  const [activeLetters, setActiveLetters] = useState<Set<string>>(new Set());
  const [speakingLetter, setSpeakingLetter] = useState<string | null>(null);

  const handleCardClick = (letter: string) => {
    setActiveLetters(prev => {
      const newSet = new Set(prev);
      if (newSet.has(letter)) {
        newSet.delete(letter);
      } else {
        newSet.add(letter);
      }
      return newSet;
    });
  };

  const handleSpeak = (letter: string, codeWord: string) => {
    setSpeakingLetter(letter);
    
    // Use browser's text-to-speech
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      // Create utterance with the code word
      const utterance = new SpeechSynthesisUtterance(codeWord);
      utterance.rate = 0.9; // Slightly slower for clarity
      utterance.pitch = 1;
      utterance.volume = 1;
      
      // Reset speaking state when done
      utterance.onend = () => setSpeakingLetter(null);
      utterance.onerror = () => setSpeakingLetter(null);
      
      // Speak the code word
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="w-full">
      <div className="alphabet-grid">
        {NATO_ALPHABET.map((item) => (
          <PhoneticCard
            key={item.letter}
            letter={item.letter}
            codeWord={item.codeWord}
            pronunciation={item.pronunciation}
            ipa={item.ipa}
            isActive={activeLetters.has(item.letter)}
            isSpeaking={speakingLetter === item.letter}
            onClick={() => handleCardClick(item.letter)}
            onSpeak={() => handleSpeak(item.letter, item.codeWord)}
          />
        ))}
      </div>
    </div>
  );
}