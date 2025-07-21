'use client';

import React from 'react';
import { cn } from '@/lib/utils/cn';

interface PhoneticCardProps {
  letter: string;
  codeWord: string;
  pronunciation: string;
  ipa: string;
  isActive?: boolean;
  isSpeaking?: boolean;
  isFocused?: boolean;
  onClick?: () => void;
  onSpeak?: () => void;
  onFocus?: () => void;
}

export function PhoneticCard({
  letter,
  codeWord,
  pronunciation,
  ipa,
  isActive = false,
  isSpeaking = false,
  isFocused = false,
  onClick,
  onSpeak,
  onFocus,
}: PhoneticCardProps) {
  return (
    <div
      className={cn(
        'phonetic-card',
        isActive && 'phonetic-card-active',
        isSpeaking && 'ring-2 ring-accent animate-pulse-slow',
        isFocused && 'ring-2 ring-primary ring-offset-2'
      )}
      onClick={onClick}
      onFocus={onFocus}
      role="gridcell"
      tabIndex={isFocused ? 0 : -1}
      aria-label={`${letter} - ${codeWord}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
        // Removed 's' key handling - handled by parent grid
      }}
    >
      {/* Letter */}
      <div className="text-4xl md:text-5xl font-bold text-primary mb-3">
        {letter}
      </div>
      
      {/* Code Word */}
      <div className="text-xl md:text-2xl font-semibold mb-2">
        {codeWord}
      </div>
      
      {/* Pronunciation */}
      <div className="text-sm text-muted-foreground mb-1">
        {pronunciation}
      </div>
      
      {/* IPA */}
      <div className="text-xs text-muted-foreground font-mono opacity-75">
        [{ipa}]
      </div>
      
      {/* Speak Button */}
      <button
        className={cn(
          'mt-3 p-2 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
          isSpeaking && 'bg-accent/20 hover:bg-accent/30'
        )}
        onClick={(e) => {
          e.stopPropagation();
          onSpeak?.();
        }}
        aria-label={`Speak ${codeWord}`}
      >
        {isSpeaking ? (
          // Speaker wave icon (speaking)
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z"
            />
          </svg>
        ) : (
          // Speaker icon (not speaking)
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z"
            />
          </svg>
        )}
      </button>
    </div>
  );
}