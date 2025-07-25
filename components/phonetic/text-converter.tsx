'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui';
import { textToPhonetic } from '@/lib/utils/phonetic-converter';
import { cn } from '@/lib/utils/cn';
import { Share2, Volume2 } from 'lucide-react';
import { logger } from '@/lib/utils/logger';
import { speechManager } from '@/lib/utils/speech-synthesis';
import { NATO_ALPHABET } from '@/lib/constants/phonetic-alphabet';


const MAX_CHARACTERS = 1000;

interface HistoryItem {
  id: string;
  input: string;
  output: string;
  timestamp: number;
}

interface TextConverterProps {
  showHistory?: boolean;
}

export function TextConverter({ showHistory = true }: TextConverterProps = {}) {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistoryState, setShowHistoryState] = useState(false);

  useEffect(() => {
    const converted = textToPhonetic(inputText);
    setOutputText(converted);
    
    // Add to history when conversion is complete and not empty
    if (inputText.trim() && converted) {
      const timeoutId = setTimeout(() => {
        const newItem: HistoryItem = {
          id: Date.now().toString(),
          input: inputText,
          output: converted,
          timestamp: Date.now(),
        };
        
        setHistory(prev => {
          // Keep only last 10 items
          const updated = [newItem, ...prev.filter(item => item.input !== inputText)];
          return updated.slice(0, 10);
        });
      }, 1000); // Debounce history updates
      
      return () => clearTimeout(timeoutId);
    }
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
        // User cancelled or error
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
    setInputText('');
    setOutputText('');
  };

  const handleSpeak = async () => {
    if (!inputText.trim()) return;
    
    setIsSpeaking(true);
    
    // First speak the original text
    speechManager.speak(inputText);
    
    // Wait a bit for the original text to finish
    await new Promise(resolve => setTimeout(resolve, inputText.length * 100 + 500));
    
    // Then speak the phonetic version letter by letter
    const letters = inputText.toUpperCase().split('');
    
    for (const char of letters) {
      if (char === ' ') {
        speechManager.speak('space');
        await new Promise(resolve => setTimeout(resolve, 800));
      } else {
        const phoneticItem = NATO_ALPHABET.find(item => item.letter === char);
        if (phoneticItem) {
          speechManager.speak(`${phoneticItem.letter}, for ${phoneticItem.codeWord}`);
          await new Promise(resolve => setTimeout(resolve, 1500));
        }
      }
    }
    
    setIsSpeaking(false);
  };

  const characterCount = inputText.length;
  const characterPercentage = (characterCount / MAX_CHARACTERS) * 100;

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white dark:bg-warmNeutral-800 rounded-xl shadow-lg border border-warmNeutral-200 dark:border-warmNeutral-700 p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-foreground">
            NATO Phonetic Translator
          </h3>
          {inputText && (
            <button
              onClick={handleClear}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Clear
            </button>
          )}
        </div>

        {/* Input Section */}
        <div className="space-y-2">
          <div className="flex justify-between items-center mb-1">
            <label htmlFor="input-text" className="text-sm font-medium text-secondary">
              Enter text to convert
            </label>
            <span
              className={cn(
                'text-sm',
                characterCount > MAX_CHARACTERS * 0.9
                  ? 'text-error'
                  : 'text-muted-foreground'
              )}
            >
              {characterCount} / {MAX_CHARACTERS}
            </span>
          </div>
          <textarea
            id="input-text"
            value={inputText}
            onChange={handleInputChange}
            placeholder="Type or paste your text here..."
            className={cn(
              'w-full min-h-[100px] p-3 rounded-lg border border-warmNeutral-300 dark:border-warmNeutral-600',
              'bg-warmNeutral-50 dark:bg-warmNeutral-900/50 text-foreground',
              'placeholder-muted-foreground',
              'focus:ring-2 focus:ring-coolBlue-500 focus:border-transparent',
              'resize-none transition-all'
            )}
            spellCheck={false}
          />
          {/* Character limit progress bar */}
          <div className="mt-1 h-1 bg-muted rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full transition-all duration-300',
                characterPercentage > 90 ? 'bg-error' : 'bg-primary'
              )}
              style={{ width: `${characterPercentage}%` }}
            />
          </div>
        </div>

        {/* Output Section */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-secondary">
              Phonetic Output
            </label>
            {outputText && (
              <div className="flex gap-2">
                <button
                  onClick={handleSpeak}
                  disabled={isSpeaking}
                  className={cn(
                    'flex items-center gap-1 px-2 py-1 rounded-md',
                    'text-xs font-medium transition-all',
                    isSpeaking
                      ? 'bg-coolBlue-100 text-coolBlue-700 dark:bg-coolBlue-900/30 dark:text-coolBlue-300'
                      : 'bg-warmNeutral-100 text-warmNeutral-700 hover:bg-warmNeutral-200 dark:bg-warmNeutral-700 dark:text-warmNeutral-300 dark:hover:bg-warmNeutral-600'
                  )}
                >
                  <Volume2 className={cn("w-3 h-3", isSpeaking && "animate-pulse")} />
                  {isSpeaking ? 'Speaking...' : 'Speak'}
                </button>
                
                <button
                  onClick={handleCopy}
                  className={cn(
                    'flex items-center gap-1 px-2 py-1 rounded-md',
                    'text-xs font-medium transition-all',
                    isCopied
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                      : 'bg-warmNeutral-100 text-warmNeutral-700 hover:bg-warmNeutral-200 dark:bg-warmNeutral-700 dark:text-warmNeutral-300 dark:hover:bg-warmNeutral-600'
                  )}
                >
                  {isCopied ? (
                    <>
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Copied
                    </>
                  ) : (
                    <>
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                    className={cn(
                      'flex items-center gap-1 px-2 py-1 rounded-md',
                      'text-xs font-medium transition-all',
                      'bg-warmNeutral-100 text-warmNeutral-700 hover:bg-warmNeutral-200',
                      'dark:bg-warmNeutral-700 dark:text-warmNeutral-300 dark:hover:bg-warmNeutral-600'
                    )}
                  >
                    <Share2 className="w-3 h-3" />
                    Share
                  </button>
                )}
              </div>
            )}
          </div>
          <div
            className={cn(
              'w-full p-3 rounded-lg',
              'bg-gradient-to-br from-coolBlue-50 to-warmAmber-50 dark:from-coolBlue-900/20 dark:to-warmAmber-900/20',
              'border border-warmNeutral-200 dark:border-warmNeutral-700',
              'min-h-[100px] max-h-[300px] overflow-y-auto'
            )}
          >
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
        </div>

      </div>

      {/* History Section */}
      {showHistory && history.length > 0 && (
        <div className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Recent Conversions</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowHistoryState(!showHistoryState)}
            >
              {showHistoryState ? 'Hide' : 'Show'} History
            </Button>
          </div>
          
          {showHistoryState && (
            <div className="space-y-2">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-md border border-border bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => setInputText(item.input)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{item.input}</p>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                        {item.output}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground ml-2">
                      {new Date(item.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
              <button
                className="text-xs text-muted-foreground hover:text-foreground"
                onClick={() => setHistory([])}
              >
                Clear History
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}