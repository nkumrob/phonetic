'use client';

import { useState } from 'react';
import { PracticeHub } from '@/components/practice/practice-hub';
import { UnifiedQuiz } from '@/components/practice/unified-quiz';
import { Flashcards } from '@/components/learning/flashcards';
import { ErrorBoundary } from '@/components/error-boundary';

export default function PracticeClient() {
  const [activeMode, setActiveMode] = useState<'hub' | 'learn' | 'practice' | 'challenge'>('hub');

  const handleModeSelect = (mode: 'learn' | 'practice' | 'challenge') => {
    setActiveMode(mode);
  };

  const handleComplete = () => {
    setActiveMode('hub');
  };

  const handleSessionSaved = () => {
    // Session saved indicator is handled within components
  };

  // Route to PracticeHub which handles mode selection
  if (activeMode === 'hub') {
    return (
      <ErrorBoundary>
        <PracticeHub onModeSelect={handleModeSelect} />
      </ErrorBoundary>
    );
  }

  return (
    <div className="min-h-screen">
      <ErrorBoundary>
        {activeMode === 'learn' && (
          <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="mb-8">
              <button
                onClick={() => setActiveMode('hub')}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Practice Hub
              </button>
            </div>
            <Flashcards />
          </div>
        )}
        
        {(activeMode === 'practice' || activeMode === 'challenge') && (
          <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="mb-8">
              <button
                onClick={() => setActiveMode('hub')}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Practice Hub
              </button>
            </div>
            <UnifiedQuiz 
              mode={activeMode as 'practice' | 'challenge'} 
              onComplete={handleComplete}
              onSessionSaved={handleSessionSaved}
            />
          </div>
        )}
      </ErrorBoundary>
    </div>
  );
}