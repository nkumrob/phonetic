'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui';
import { textToPhonetic } from '@/lib/utils/phonetic-converter';
import { cn } from '@/lib/utils/cn';
import { TextConverterSkeleton } from '@/components/ui/skeleton';

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
  const [isLoading, setIsLoading] = useState(true);

  // Initialize loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);

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
      console.error('Failed to copy:', err);
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
        console.log('Share cancelled or failed:', err);
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

  if (isLoading) {
    return <TextConverterSkeleton />;
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Input Section */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label htmlFor="input-text" className="text-sm font-medium">
            Enter Text to Convert
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
        <div className="relative">
          <textarea
            id="input-text"
            value={inputText}
            onChange={handleInputChange}
            placeholder="Type or paste your text here..."
            className="w-full min-h-[120px] p-4 rounded-md border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 resize-y"
            spellCheck={false}
          />
          {/* Character limit progress bar */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted rounded-b-md overflow-hidden">
            <div
              className={cn(
                'h-full transition-all duration-300',
                characterPercentage > 90 ? 'bg-error' : 'bg-primary'
              )}
              style={{ width: `${characterPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Output Section */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium">
            Phonetic Spelling
          </label>
          <div className="flex gap-2">
            {inputText && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="h-8"
              >
                Clear
              </Button>
            )}
          </div>
        </div>
        <div className="relative">
          <div
            className={cn(
              'min-h-[120px] p-4 rounded-md border bg-muted/50',
              outputText ? 'border-border' : 'border-border/50'
            )}
          >
            {outputText ? (
              <p className="text-lg leading-relaxed font-mono">{outputText}</p>
            ) : (
              <p className="text-muted-foreground italic">
                Your phonetic spelling will appear here...
              </p>
            )}
          </div>
          
          {/* Action Buttons */}
          {outputText && (
            <div className="absolute bottom-4 right-4 flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleCopy}
                className="h-8"
              >
                {isCopied ? (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-4 h-4 mr-1"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4.5 12.75l6 6 9-13.5"
                      />
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-4 h-4 mr-1"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184"
                      />
                    </svg>
                    Copy
                  </>
                )}
              </Button>
              
              {typeof navigator !== 'undefined' && 'share' in navigator && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleShare}
                  disabled={isSharing}
                  className="h-8"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-4 h-4 mr-1"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z"
                    />
                  </svg>
                  Share
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Examples */}
      <div className="text-center text-sm text-muted-foreground">
        <p>Try: &quot;Hello World&quot; → &quot;Hotel Echo Lima Lima Oscar (space) Whiskey Oscar Romeo Lima Delta&quot;</p>
      </div>

      {/* History Section */}
      {history.length > 0 && (
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Recent Conversions</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowHistory(!showHistory)}
            >
              {showHistory ? 'Hide' : 'Show'} History
            </Button>
          </div>
          
          {showHistory && (
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