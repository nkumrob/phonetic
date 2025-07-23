'use client';

import { useState, useRef, useEffect } from 'react';
import { Icons } from '@/components/ui/icons';

interface PronunciationPlayerProps {
  text: string;
  code: string;
  className?: string;
  autoPlay?: boolean;
}

export function PronunciationPlayer({ 
  text, 
  code, 
  className = '',
  autoPlay = false 
}: PronunciationPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Use Web Speech API for pronunciation
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      audioRef.current = new Audio();
    }
  }, []);

  const speak = () => {
    if (!window.speechSynthesis) {
      setError(true);
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(code);
    utterance.rate = 0.8; // Slower for clarity
    utterance.pitch = 1;
    utterance.volume = 1;
    
    // Try to use a native English voice
    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(voice => 
      voice.lang.startsWith('en') && voice.localService
    ) || voices.find(voice => voice.lang.startsWith('en'));
    
    if (englishVoice) {
      utterance.voice = englishVoice;
    }

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => {
      setIsPlaying(false);
      setError(true);
    };

    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if (autoPlay && !error) {
      // Small delay to ensure voices are loaded
      const timer = setTimeout(() => speak(), 100);
      return () => clearTimeout(timer);
    }
  }, [autoPlay]);

  if (error) {
    return null;
  }

  return (
    <button
      onClick={speak}
      disabled={isPlaying}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 
        text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 
        transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      aria-label={`Play pronunciation for ${text}`}
    >
      <Icons.volume size={16} />
      <span className="text-sm font-medium">
        {isPlaying ? 'Playing...' : 'Listen'}
      </span>
    </button>
  );
}