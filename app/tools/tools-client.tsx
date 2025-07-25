'use client';

import React, { useState, useEffect, useRef } from 'react';
import { LazyReverseLookup } from '@/components/lazy';
import { ErrorBoundary } from '@/components/error-boundary';
import { Icons } from '@/components/ui/icons';
import { textToPhonetic } from '@/lib/utils/phonetic-converter';
import { cn } from '@/lib/utils/cn';
import { Volume2, Share2 } from 'lucide-react';
import { speechManager } from '@/lib/utils/speech-synthesis';
import { NATO_ALPHABET } from '@/lib/constants/phonetic-alphabet';
import { logger } from '@/lib/utils/logger';

const MAX_CHARACTERS = 1000;

function InlineTextConverter() {
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
          phoneticParts.push(`${phoneticItem.letter}, for ${phoneticItem.codeWord}`);
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
          <div className="w-full p-3 rounded-lg bg-gradient-to-br from-coolBlue-50 to-warmAmber-50 dark:from-coolBlue-900/20 dark:to-warmAmber-900/20 border border-warmNeutral-200 dark:border-warmNeutral-700 min-h-[100px] max-h-[300px] overflow-y-auto">
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

export default function ToolsPageClient() {
  return (
    <div className="min-h-screen">
      {/* Hero Section - Mobile Optimized */}
      <section className="container mx-auto px-4 py-8 sm:py-16">
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-headlines text-center mb-4">
          Phonetic Tools
        </h1>
        <p className="text-lg sm:text-xl text-secondary text-center max-w-2xl mx-auto">
          Convert text and lookup NATO phonetic code words instantly with our professional-grade tools
        </p>
      </section>

      <div className="container max-w-6xl mx-auto px-4">
        {/* Text Converter Section */}
        <section className="mb-16">
          <InlineTextConverter />
        </section>

        {/* Reverse Lookup Section */}
        <section className="mb-16">
          <ErrorBoundary>
            <LazyReverseLookup />
          </ErrorBoundary>
        </section>

        {/* PDF Download Section */}
        <section className="mb-16">
          <div className="bg-white dark:bg-warmNeutral-800 rounded-xl shadow-lg border border-warmNeutral-200 dark:border-warmNeutral-700 p-6 space-y-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-50 dark:bg-green-900/20 rounded-xl mx-auto mb-4 flex items-center justify-center">
                <Icons.download size={32} className="text-green-600" />
              </div>
              <h3 className="text-2xl font-bold tracking-largeText mb-3">Printable PDF & Download</h3>
              <p className="text-base text-secondary max-w-2xl mx-auto mb-6">
                Download a professional NATO phonetic alphabet reference chart for offline use
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <a 
                  href="/api/pdf" 
                  download="nato-phonetic-alphabet.html"
                  className="btn btn-primary btn-lg inline-flex items-center gap-2"
                >
                  <Icons.download size={20} />
                  Download PDF Chart
                </a>
                <div className="text-sm text-secondary">
                  <p>• Professional A4 format</p>
                  <p>• Clear pronunciation guide</p>
                  <p>• Print-ready design</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Additional Features - Mobile Responsive */}
        <section className="grid sm:grid-cols-2 gap-4 sm:gap-8 mb-16">
          <div className="bg-white dark:bg-warmNeutral-800 rounded-xl shadow-lg border border-warmNeutral-200 dark:border-warmNeutral-700 p-6">
            <h3 className="text-xl font-bold tracking-largeText mb-3">Quick Tips</h3>
            <ul className="space-y-2 text-secondary">
              <li className="flex items-start gap-2">
                <Icons.checkCircle size={20} className="text-green-500 mt-0.5 flex-shrink-0" />
                <span>Use uppercase letters for clearer phonetic conversion</span>
              </li>
              <li className="flex items-start gap-2">
                <Icons.checkCircle size={20} className="text-green-500 mt-0.5 flex-shrink-0" />
                <span>Numbers and special characters are spelled out automatically</span>
              </li>
              <li className="flex items-start gap-2">
                <Icons.checkCircle size={20} className="text-green-500 mt-0.5 flex-shrink-0" />
                <span>Copy results with one click for easy sharing</span>
              </li>
            </ul>
          </div>

          <div className="bg-white dark:bg-warmNeutral-800 rounded-xl shadow-lg border border-warmNeutral-200 dark:border-warmNeutral-700 p-6">
            <h3 className="text-xl font-bold tracking-largeText mb-3">Common Uses</h3>
            <ul className="space-y-2 text-secondary">
              <li className="flex items-start gap-2">
                <span className="text-coolBlue-500 mt-1">•</span>
                <span>Spelling names over the phone or radio</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-coolBlue-500 mt-1">•</span>
                <span>Communicating serial numbers clearly</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-coolBlue-500 mt-1">•</span>
                <span>Professional aviation and maritime communications</span>
              </li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}