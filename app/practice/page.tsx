'use client';

import { Metadata } from 'next';
import { useState } from 'react';
import { QuizInterface } from '@/components/learning/quiz-interface';
import { EnhancedQuiz } from '@/components/learning/enhanced-quiz';
import { Flashcards } from '@/components/learning/flashcards';
import { ErrorBoundary } from '@/components/error-boundary';
import { generateMetadata as baseGenerateMetadata } from '@/lib/seo/metadata';
import { Button } from '@/components/ui';
import { useSession } from '@/lib/contexts/session-context';

export const metadata: Metadata = baseGenerateMetadata(
  'Practice NATO Phonetic Alphabet',
  'Test your knowledge with interactive quizzes and flashcards',
  '/practice'
);

export default function PracticePage() {
  const [activeTab, setActiveTab] = useState<'standard' | 'enhanced' | 'flashcards'>('enhanced');
  const { session } = useSession();

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center py-8">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Practice & Master
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-4">
          Reinforce your learning with quizzes and flashcards
        </p>
        <p className="text-lg text-primary">
          Level {session.userProgress.level} • {session.userProgress.experience} XP
        </p>
      </section>

      {/* Tab Navigation */}
      <div className="flex justify-center gap-3 mb-8 flex-wrap">
        <Button
          variant={activeTab === 'enhanced' ? 'primary' : 'secondary'}
          onClick={() => setActiveTab('enhanced')}
          className="min-w-[160px]"
        >
          <span className="mr-2">🎮</span>
          Challenge Mode
        </Button>
        <Button
          variant={activeTab === 'standard' ? 'primary' : 'secondary'}
          onClick={() => setActiveTab('standard')}
          className="min-w-[160px]"
        >
          <span className="mr-2">📝</span>
          Classic Quiz
        </Button>
        <Button
          variant={activeTab === 'flashcards' ? 'primary' : 'secondary'}
          onClick={() => setActiveTab('flashcards')}
          className="min-w-[160px]"
        >
          <span className="mr-2">🎴</span>
          Flashcards
        </Button>
      </div>

      {/* Content based on active tab */}
      <section className="min-h-[600px]">
        <ErrorBoundary>
          {activeTab === 'enhanced' && (
            <div className="animate-fade-in">
              <EnhancedQuiz />
            </div>
          )}
          {activeTab === 'standard' && (
            <div className="animate-fade-in">
              <QuizInterface />
            </div>
          )}
          {activeTab === 'flashcards' && (
            <div className="animate-fade-in">
              <Flashcards />
            </div>
          )}
        </ErrorBoundary>
      </section>
    </div>
  );
}