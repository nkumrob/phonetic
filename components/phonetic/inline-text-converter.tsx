'use client';

import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils/cn';
import { Volume2, Share2 } from 'lucide-react';
import { textToPhonetic } from '@/lib/utils/phonetic-converter';
import { speechManager } from '@/lib/utils/speech-synthesis';
import { NATO_ALPHABET } from '@/lib/constants/phonetic-alphabet';
import { logger } from '@/lib/utils/logger';
import { track } from '@/lib/client/track';

const MAX_CHARACTERS = 1000;

export function InlineTextConverter() {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const isSpeakingRef = useRef(false);
  const speakingTimeoutsRef = useRef<NodeJS.Timeout[]>([]);

  useEffect(() => {
    const converted = textToPhonetic(inputText);
    setOutputText(converted);
  }, [inputText]);

  const trackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!inputText.trim()) return;
    if (trackTimer.current) clearTimeout(trackTimer.current);
    trackTimer.current = setTimeout(() => track('converter_use', 'phonetic-converter'), 2000);
    return () => {
      if (trackTimer.current) clearTimeout(trackTimer.current);
    };
  }, [inputText]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    if (text.length <= MAX_CHARACTERS) {
      setInputText(text);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(outputText);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      logger.error('Failed to copy:', err);
    }
  };

  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        setIsSharing(true);
        await navigator.share({
          title: 'NATO Phonetic Spelling',
          text: outputText,
        });
      } catch (err) {
        logger.info('Share cancelled or failed:', {
          context: 'text-converter',
          metadata: { error: err }
        });
      } finally {
        setIsSharing(false);
      }
    } else {
      // Fallback to copy
      handleCopy();
    }
  };

  const handleClear = () => {
    // Stop any ongoing speech
    if (isSpeaking) {
      stopSpeaking();
    }
    setInputText('');
    setOutputText('');
  };

  const stopSpeaking = () => {
    // Cancel all speech
    speechManager.stop();

    // Clear all timeouts
    speakingTimeoutsRef.current.forEach(timeout => clearTimeout(timeout));
    speakingTimeoutsRef.current = [];

    // Reset state
    setIsSpeaking(false);
    isSpeakingRef.current = false;
  };

  const handleSpeak = () => {
    if (!inputText.trim()) return;

    if (isSpeaking) {
      stopSpeaking();
      return;
    }

    setIsSpeaking(true);
    isSpeakingRef.current = true;

    // Clear any existing timeouts
    speakingTimeoutsRef.current = [];

    // Build a single utterance with pauses
    let fullText = inputText + '. ';

    // Add pause
    fullText += '... ... ... ';

    // Build phonetic version
    const letters = inputText.toUpperCase().split('');
    const phoneticParts: string[] = [];

    for (const char of letters) {
      if (char === ' ') {
        phoneticParts.push('space');
      } else {
        const phoneticItem = NATO_ALPHABET.find(item => item.letter === char);
        if (phoneticItem) {
          phoneticParts.push(`"${phoneticItem.letter}" as in "${phoneticItem.codeWord}"`);
        }
      }
    }

    fullText += phoneticParts.join('. ... ');

    // Speak the entire text as one utterance
    speechManager.speak(fullText, {
      rate: 0.8,
      onEnd: () => {
        setIsSpeaking(false);
        isSpeakingRef.current = false;
        speakingTimeoutsRef.current = [];
      }
    });
  };

  const characterCount = inputText.length;

  // Cleanup speech on unmount
  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white dark:bg-warmNeutral-800 rounded-xl shadow-lg border border-warmNeutral-200 dark:border-warmNeutral-700 p-6 space-y-4">
        <h3 className="text-lg font-bold text-foreground">
          NATO Phonetic Translator
        </h3>

        {/* Input Section */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label htmlFor="input-text" className="text-sm font-medium text-secondary">
              Enter text to convert
            </label>
            <span className={cn(
              'text-sm',
              characterCount > MAX_CHARACTERS * 0.9
                ? 'text-error'
                : 'text-muted-foreground'
            )}>
              {characterCount} / {MAX_CHARACTERS}
            </span>
          </div>
          <textarea
            id="input-text"
            value={inputText}
            onChange={handleInputChange}
            placeholder="Type or paste your text here..."
            className="w-full min-h-[100px] p-3 rounded-lg border border-warmNeutral-300 dark:border-warmNeutral-600 bg-warmNeutral-50 dark:bg-warmNeutral-900/50 text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-coolBlue-500 focus:border-transparent resize-none transition-all"
            spellCheck={false}
          />
          {/* Character limit progress bar */}
          <div className="mt-1 h-1 bg-muted rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full transition-all duration-300',
                (characterCount / MAX_CHARACTERS) * 100 > 90 ? 'bg-error' : 'bg-primary'
              )}
              style={{ width: `${(characterCount / MAX_CHARACTERS) * 100}%` }}
            />
          </div>
        </div>

        {/* Output Section */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-secondary">
            Phonetic Output
          </label>
          <div className="w-full p-3 rounded-lg bg-warmNeutral-50 dark:bg-warmNeutral-800 border border-warmNeutral-200 dark:border-warmNeutral-700 min-h-[100px] max-h-[300px] overflow-y-auto">
            {outputText ? (
              <p className="font-mono text-foreground leading-relaxed">
                {outputText}
              </p>
            ) : (
              <p className="text-muted-foreground italic">
                Phonetic translation will appear here...
              </p>
            )}
          </div>

          {/* Action Buttons - Only show when there's content */}
          {(inputText || outputText) && (
            <div className="flex gap-2 pt-2">
              {inputText && (
                <button
                  onClick={handleClear}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Clear
                </button>
              )}
              {outputText && (
                <>
                  <button
                    onClick={handleSpeak}
                    className={cn(
                      'flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-all',
                      isSpeaking
                        ? 'bg-coolBlue-100 text-coolBlue-700 dark:bg-coolBlue-900/30 dark:text-coolBlue-300'
                        : 'bg-warmNeutral-100 text-warmNeutral-700 hover:bg-warmNeutral-200 dark:bg-warmNeutral-700 dark:text-warmNeutral-300 dark:hover:bg-warmNeutral-600'
                    )}
                  >
                    {isSpeaking ? (
                      <>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Stop
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-4 h-4" />
                        Speak
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleCopy}
                    className={cn(
                      'flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-all',
                      isCopied
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                        : 'bg-warmNeutral-100 text-warmNeutral-700 hover:bg-warmNeutral-200 dark:bg-warmNeutral-700 dark:text-warmNeutral-300 dark:hover:bg-warmNeutral-600'
                    )}
                  >
                    {isCopied ? (
                      <>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Copied
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                        </svg>
                        Copy
                      </>
                    )}
                  </button>

                  {typeof navigator !== 'undefined' && 'share' in navigator && (
                    <button
                      onClick={handleShare}
                      disabled={isSharing}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-all bg-warmNeutral-100 text-warmNeutral-700 hover:bg-warmNeutral-200 dark:bg-warmNeutral-700 dark:text-warmNeutral-300 dark:hover:bg-warmNeutral-600"
                    >
                      <Share2 className="w-4 h-4" />
                      Share
                    </button>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
