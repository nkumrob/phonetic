'use client';

import React, { useState, useRef, useEffect } from 'react';
import { textToPhonetic } from '@/lib/utils/phonetic-converter';
import { cn } from '@/lib/utils/cn';

interface PhoneticTranslatorWidgetProps {
  className?: string;
  placeholder?: string;
  showExample?: boolean;
  compact?: boolean;
  maxHeight?: string;
  onTranslate?: (input: string, output: string) => void;
}

export function PhoneticTranslatorWidget({
  className,
  placeholder = 'Type text to translate...',
  showExample = true,
  compact = false,
  maxHeight = '400px',
  onTranslate,
}: PhoneticTranslatorWidgetProps) {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const translated = textToPhonetic(input);
    setOutput(translated);
    if (onTranslate && input.trim()) {
      onTranslate(input, translated);
    }
  }, [input, onTranslate]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(output);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const widgetStyles = compact
    ? 'p-4 space-y-3'
    : 'p-6 space-y-4';

  return (
    <div
      className={cn(
        'w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700',
        widgetStyles,
        className
      )}
      style={{ maxHeight }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className={cn(
          'font-bold text-gray-900 dark:text-white',
          compact ? 'text-sm' : 'text-lg'
        )}>
          NATO Phonetic Translator
        </h3>
        {input && (
          <button
            onClick={handleClear}
            className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            aria-label="Clear input"
          >
            Clear
          </button>
        )}
      </div>

      {/* Input Area */}
      <div className="space-y-2">
        <label htmlFor="phonetic-input" className="sr-only">
          Enter text to translate
        </label>
        <textarea
          ref={textareaRef}
          id="phonetic-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeholder}
          className={cn(
            'w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600',
            'bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white',
            'placeholder-gray-500 dark:placeholder-gray-400',
            'focus:ring-2 focus:ring-blue-500 focus:border-transparent',
            'resize-none transition-all',
            compact ? 'text-sm min-h-[60px]' : 'min-h-[80px]'
          )}
          spellCheck={false}
        />
      </div>

      {/* Output Area */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className={cn(
            'font-medium text-gray-700 dark:text-gray-300',
            compact ? 'text-xs' : 'text-sm'
          )}>
            Phonetic Output
          </label>
          {output && (
            <button
              onClick={handleCopy}
              className={cn(
                'flex items-center gap-1 px-2 py-1 rounded-md',
                'text-xs font-medium transition-all',
                isCopied
                  ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
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
          )}
        </div>
        <div
          className={cn(
            'w-full p-3 rounded-lg',
            'bg-gradient-to-br from-blue-50 to-amber-50 dark:from-blue-900/20 dark:to-amber-900/20',
            'border border-gray-200 dark:border-gray-700',
            'min-h-[60px] overflow-y-auto',
            compact ? 'text-sm' : 'text-base'
          )}
          style={{ maxHeight: compact ? '120px' : '150px' }}
        >
          {output ? (
            <p className="font-mono text-gray-800 dark:text-gray-200 leading-relaxed">
              {output}
            </p>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 italic">
              Phonetic translation will appear here...
            </p>
          )}
        </div>
      </div>

      {/* Example */}
      {showExample && !compact && (
        <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
            Example: "Hello" → "Hotel Echo Lima Lima Oscar"
          </p>
        </div>
      )}
    </div>
  );
}