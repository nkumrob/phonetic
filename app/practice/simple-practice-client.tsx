'use client';

import { useState } from 'react';
import { LazySimplePracticeHub, LazySimpleQuiz, LazySimpleFlashcards } from '@/components/lazy';
import { ErrorBoundary } from '@/components/error-boundary';
import { Button } from '@/components/ui';
import { ArrowLeft } from 'lucide-react';

type Mode = 'hub' | 'learn' | 'practice' | 'challenge';

export default function SimplePracticeClient() {
  const [currentMode, setCurrentMode] = useState<Mode>('hub');
  
  const handleModeSelect = (mode: 'learn' | 'practice' | 'challenge') => {
    setCurrentMode(mode);
  };
  
  const handleBack = () => {
    setCurrentMode('hub');
  };
  
  const handleQuizComplete = () => {
    // Add a small delay for better UX
    setTimeout(() => {
      setCurrentMode('hub');
    }, 100);
  };
  
  return (
    <div className="container mx-auto px-4 py-8 mb-24">
      {currentMode !== 'hub' && (
        <div className="mb-4 sm:mb-6">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="flex items-center gap-1 sm:gap-2 text-sm sm:text-base px-2 sm:px-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Practice Hub</span>
            <span className="sm:hidden">Back</span>
          </Button>
        </div>
      )}
      
      <ErrorBoundary>
        {currentMode === 'hub' && (
          <LazySimplePracticeHub onModeSelect={handleModeSelect} />
        )}
        
        {currentMode === 'learn' && (
          <LazySimpleFlashcards onComplete={handleBack} />
        )}
        
        {currentMode === 'practice' && (
          <LazySimpleQuiz mode="practice" onComplete={handleQuizComplete} />
        )}
        
        {currentMode === 'challenge' && (
          <LazySimpleQuiz mode="challenge" onComplete={handleQuizComplete} />
        )}
      </ErrorBoundary>
    </div>
  );
}