'use client';

import React, { useCallback } from 'react';
import { cn } from '@/lib/utils/cn';

interface PhoneticCardProps {
  letter: string;
  codeWord: string;
  pronunciation: string;
  ipa: string;
  isSpeaking?: boolean;
  isFocused?: boolean;
  onClick: () => void;
  onSpeak: () => void;
  onFocus?: () => void;
}

export function PhoneticCard({
  letter,
  codeWord,
  pronunciation,
  ipa,
  isSpeaking = false,
  isFocused = false,
  onClick,
  onSpeak,
  onFocus,
}: PhoneticCardProps) {
  const handleClick = useCallback(() => {
    onClick();
  }, [onClick]);

  const handleSpeak = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onSpeak();
    },
    [onSpeak]
  );

  return (
    <article
      className={cn(
        "phonetic-card group",
        isSpeaking && "animate-pulse-slow"
      )}
      onClick={handleClick}
      onFocus={onFocus}
      tabIndex={0}
      role="button"
      aria-label={`${letter} for ${codeWord}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      {/* Background Gradient on Hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 via-blue-500/0 to-amber-500/0 group-hover:from-blue-500/10 group-hover:via-transparent group-hover:to-amber-500/10 rounded-xl transition-all duration-500" />
      
      {/* Letter */}
      <div className="phonetic-letter">
        {letter}
      </div>
      
      {/* Code Word */}
      <div className="phonetic-word">
        {codeWord}
      </div>
      
      {/* Pronunciation */}
      <div className="phonetic-pronunciation">
        {pronunciation}
      </div>
      
      {/* Audio Button */}
      <button
        onClick={handleSpeak}
        className={cn(
          "no-print",
          "absolute top-4 right-4 p-3 rounded-lg",
          "bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm",
          "opacity-0 group-hover:opacity-100",
          "transform translate-y-2 group-hover:translate-y-0",
          "transition-all duration-300",
          "hover:bg-blue-50 dark:hover:bg-blue-900/30",
          "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
          isSpeaking && "opacity-100 bg-blue-50 dark:bg-blue-900/30"
        )}
        aria-label={`Play pronunciation for ${codeWord}`}
      >
        <svg
          className={cn(
            "w-5 h-5 text-primary",
            isSpeaking && "animate-pulse"
          )}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          {isSpeaking ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
            />
          )}
        </svg>
      </button>

    </article>
  );
}