'use client';

import React, { useState, useEffect } from 'react';
import { textToPhonetic } from '@/lib/utils/phonetic-converter';
import { cn } from '@/lib/utils/cn';
import { logger } from '@/lib/utils/logger';


const MAX_CHARACTERS = 1000;

interface HistoryItem {
  id: string;
  input: string;
  output: string;
  timestamp: number;
}

export function TextConverter() {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);

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
          context: 'text-converter-fixed',
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

  const characterCount = inputText.length;
  const characterPercentage = (characterCount / MAX_CHARACTERS) * 100;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      {/* Input Section */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <label htmlFor="input-text" className="text-sm font-medium text-primary">
            Enter Text to Convert
          </label>
          <span
            className={cn(
              'text-sm font-mono',
              characterCount > MAX_CHARACTERS * 0.9
                ? 'text-red-500'
                : 'text-secondary'
            )}
          >
            {characterCount} / {MAX_CHARACTERS}
          </span>
        </div>
        <div className="relative">
          <textarea
            id="input-text"
            value={inputText}
            onChange={handleInputChange}
            placeholder="Type or paste your text here..."
            className="input w-full min-h-[140px] resize-none font-mono"
            spellCheck={false}
          />
          {/* Character limit progress bar */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700 rounded-b-lg overflow-hidden">
            <div
              className={cn(
                'h-full transition-all duration-300',
                characterPercentage > 90 ? 'bg-red-500' : 'bg-gradient-to-r from-blue-500 to-amber-500'
              )}
              style={{ width: `${characterPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Output Section */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium text-primary">
            Phonetic Spelling
          </label>
          <div className="flex gap-2">
            {inputText && (
              <button
                onClick={handleClear}
                className="btn btn-sm text-secondary hover:text-primary"
              >
                Clear
              </button>
            )}
          </div>
        </div>
        <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-lg p-6 min-h-[140px]">
          {outputText ? (
            <p className="text-lg leading-relaxed font-mono pr-24">{outputText}</p>
          ) : (
            <p className="text-secondary italic">
              Your phonetic spelling will appear here...
            </p>
          )}
          
          {/* Action Buttons - Fixed positioning */}
          {outputText && (
            <div className="flex gap-2 mt-4">
              <button
                onClick={handleCopy}
                className="btn btn-secondary btn-sm"
              >
                {isCopied ? (
                  <>
                    <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                  className="btn btn-secondary btn-sm"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m9.237 8.662a3 3 0 11-5.405 1.866m4.495-10.371a3 3 0 11-5.462-2.86" />
                  </svg>
                  Share
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Example */}
      <div className="text-center">
        <p className="text-sm text-secondary">
          Try: <span className="font-mono text-primary">&quot;Hello World&quot;</span> → 
          <span className="font-mono text-primary ml-2">&quot;Hotel Echo Lima Lima Oscar (space) Whiskey Oscar Romeo Lima Delta&quot;</span>
        </p>
      </div>

      {/* History Section */}
      {history.length > 0 && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Recent Conversions</h3>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="text-sm text-secondary hover:text-primary"
            >
              {showHistory ? 'Hide' : 'Show'} History
            </button>
          </div>
          
          {showHistory && (
            <div className="space-y-2">
              {history.map((item) => (
                <button
                  key={item.id}
                  className="w-full text-left p-4 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  onClick={() => setInputText(item.input)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium">{item.input}</p>
                      <p className="text-sm text-secondary mt-1 line-clamp-1">
                        {item.output}
                      </p>
                    </div>
                    <span className="text-xs text-secondary ml-4">
                      {new Date(item.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </button>
              ))}
              <button
                className="text-xs text-secondary hover:text-primary mt-2"
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