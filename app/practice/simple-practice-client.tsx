'use client';

import { useState } from 'react';
import { SimplePracticeHub } from '@/components/practice/simple-practice-hub';
import { SimpleQuiz } from '@/components/practice/simple-quiz';
import { SimpleFlashcards } from '@/components/learning/simple-flashcards';
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
    <div className="container mx-auto px-4 py-8">
      {currentMode !== 'hub' && (
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Practice Hub
          </Button>
        </div>
      )}
      
      <ErrorBoundary>
        {currentMode === 'hub' && (
          <SimplePracticeHub onModeSelect={handleModeSelect} />
        )}
        
        {currentMode === 'learn' && (
          <SimpleFlashcards onComplete={handleBack} />
        )}
        
        {currentMode === 'practice' && (
          <SimpleQuiz mode="practice" onComplete={handleQuizComplete} />
        )}
        
        {currentMode === 'challenge' && (
          <SimpleQuiz mode="challenge" onComplete={handleQuizComplete} />
        )}
      </ErrorBoundary>
    </div>
  );
}