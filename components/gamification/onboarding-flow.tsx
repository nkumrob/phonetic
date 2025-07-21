'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils/cn';
import { NATO_ALPHABET } from '@/lib/constants/phonetic-alphabet';
import { CelebrationSystem, CELEBRATION_PRESETS } from './celebration-system';
import { useSoundEffects } from '@/lib/hooks/use-sound-effects';

interface OnboardingStep {
  id: string;
  title: string;
  content: React.ReactNode;
  action?: () => void;
  showSkip?: boolean;
}

export function OnboardingFlow({ onComplete }: { onComplete: () => void }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [userName, setUserName] = useState('');
  const [showCelebration, setShowCelebration] = useState(false);
  const { playCorrect, playClick, playAchievement } = useSoundEffects();

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to NATO Radio Training',
      content: (
        <div className="space-y-6 text-center">
          <div className="text-6xl animate-bounce">📻</div>
          <p className="text-lg text-muted-foreground">
            Learn the NATO phonetic alphabet used by pilots, sailors, and emergency responders worldwide.
          </p>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="What's your name?"
              className="w-full max-w-xs mx-auto px-4 py-2 rounded-lg border bg-background"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && userName && handleNext()}
            />
            <p className="text-sm text-muted-foreground">
              We&apos;ll use this to personalize your experience
            </p>
          </div>
        </div>
      ),
      showSkip: false,
    },
    {
      id: 'mission',
      title: `Welcome aboard, ${userName || 'Cadet'}!`,
      content: (
        <div className="space-y-6">
          <div className="text-center space-y-4">
            <div className="text-5xl">🎯</div>
            <h3 className="text-2xl font-bold">Your Mission</h3>
            <p className="text-lg text-muted-foreground">
              Master all 26 letters of the NATO phonetic alphabet in just 14 days.
            </p>
          </div>
          
          <div className="grid gap-4 max-w-md mx-auto">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
              <span className="text-2xl">✈️</span>
              <div className="text-left">
                <p className="font-medium">Aviation</p>
                <p className="text-sm text-muted-foreground">Communicate with air traffic control</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
              <span className="text-2xl">🚢</span>
              <div className="text-left">
                <p className="font-medium">Maritime</p>
                <p className="text-sm text-muted-foreground">Radio communications at sea</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
              <span className="text-2xl">🚨</span>
              <div className="text-left">
                <p className="font-medium">Emergency</p>
                <p className="text-sm text-muted-foreground">Clear communication saves lives</p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'first-letter',
      title: "Let's start with your first letter",
      content: (
        <div className="space-y-6">
          <div className="text-center space-y-4">
            <div className="inline-block p-8 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20">
              <div className="text-8xl font-bold">A</div>
            </div>
            <div className="space-y-2">
              <h3 className="text-3xl font-bold">Alpha</h3>
              <p className="text-xl text-muted-foreground italic">AL-fah</p>
            </div>
            <Button
              variant="ghost"
              onClick={() => {
                if ('speechSynthesis' in window) {
                  const utterance = new SpeechSynthesisUtterance('Alpha');
                  utterance.rate = 0.8;
                  speechSynthesis.speak(utterance);
                }
              }}
              className="mx-auto"
            >
              <svg className="w-6 h-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" 
                />
              </svg>
              Listen to pronunciation
            </Button>
          </div>
          
          <div className="p-4 rounded-lg bg-muted text-center">
            <p className="text-sm">
              <strong>Memory tip:</strong> &quot;A&quot; is for &quot;Alpha&quot; - the first letter, the leader of the pack!
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'first-quiz',
      title: "Quick test!",
      content: (
        <FirstQuizStep 
          onCorrect={() => {
            playCorrect();
            setShowCelebration(true);
            setTimeout(() => {
              setShowCelebration(false);
              handleNext();
            }, 2000);
          }}
        />
      ),
      showSkip: false,
    },
    {
      id: 'features',
      title: "How you'll learn",
      content: (
        <div className="space-y-6">
          <div className="grid gap-4">
            <FeatureCard
              icon="🔥"
              title="Build Streaks"
              description="Answer correctly to build streaks and earn bonus points"
            />
            <FeatureCard
              icon="🏆"
              title="Unlock Achievements"
              description="Complete challenges and earn badges"
            />
            <FeatureCard
              icon="📈"
              title="Track Progress"
              description="Watch your skills improve day by day"
            />
            <FeatureCard
              icon="🎯"
              title="Daily Goals"
              description="Complete 3 goals each day for bonus XP"
            />
          </div>
          
          <div className="text-center text-sm text-muted-foreground">
            <p>Your progress saves automatically</p>
            <p>Practice anytime, anywhere</p>
          </div>
        </div>
      ),
    },
    {
      id: 'ready',
      title: "You're all set!",
      content: (
        <div className="space-y-6 text-center">
          <div className="text-6xl animate-bounce">🚀</div>
          <div className="space-y-2">
            <h3 className="text-2xl font-bold">Ready to begin your training?</h3>
            <p className="text-lg text-muted-foreground">
              Start with Learn mode to master the basics
            </p>
          </div>
          
          <div className="p-6 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-3xl font-bold">26</p>
                <p className="text-sm text-muted-foreground">Letters</p>
              </div>
              <div>
                <p className="text-3xl font-bold">14</p>
                <p className="text-sm text-muted-foreground">Days</p>
              </div>
              <div>
                <p className="text-3xl font-bold">∞</p>
                <p className="text-sm text-muted-foreground">Practice</p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
  ];

  const handleNext = () => {
    playClick();
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeOnboarding();
    }
  };

  const handleSkip = () => {
    playClick();
    completeOnboarding();
  };

  const completeOnboarding = () => {
    // Save onboarding completion
    localStorage.setItem('onboardingCompleted', 'true');
    if (userName) {
      localStorage.setItem('userName', userName);
    }
    
    playAchievement();
    onComplete();
  };

  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      {showCelebration && (
        <CelebrationSystem 
          config={{
            ...CELEBRATION_PRESETS.correctAnswer,
            message: 'Excellent!',
          }}
        />
      )}
      
      <div className="bg-background rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden animate-scale-in">
        {/* Progress bar */}
        <div className="h-2 bg-muted">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        <div className="p-8 space-y-6">
          {/* Step indicator */}
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Step {currentStep + 1} of {steps.length}
            </p>
            {currentStepData.showSkip !== false && (
              <button
                onClick={handleSkip}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Skip tutorial
              </button>
            )}
          </div>
          
          {/* Content */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-center">
              {currentStepData.title}
            </h2>
            {currentStepData.content}
          </div>
          
          {/* Navigation */}
          <div className="flex justify-center">
            <Button
              size="lg"
              onClick={handleNext}
              disabled={currentStep === 0 && !userName}
              className="min-w-[200px]"
            >
              {currentStep === steps.length - 1 ? 'Start Learning!' : 'Continue'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function FirstQuizStep({ onCorrect }: { onCorrect: () => void }) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  
  const options = ['Alpha', 'Bravo', 'Charlie', 'Delta'];
  
  const handleAnswer = (answer: string) => {
    setSelectedAnswer(answer);
    setShowResult(true);
    
    if (answer === 'Alpha') {
      setTimeout(onCorrect, 1000);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-xl">What is the phonetic code for the letter &quot;A&quot;?</p>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {options.map(option => (
          <Button
            key={option}
            variant={
              !showResult ? 'secondary' :
              option === 'Alpha' ? 'primary' :
              option === selectedAnswer ? 'secondary' :
              'secondary'
            }
            onClick={() => !showResult && handleAnswer(option)}
            disabled={showResult}
            className={cn(
              'py-4',
              showResult && option === 'Alpha' && 'ring-2 ring-green-500',
              showResult && option === selectedAnswer && option !== 'Alpha' && 'ring-2 ring-red-500'
            )}
          >
            {option}
          </Button>
        ))}
      </div>
      
      {showResult && selectedAnswer !== 'Alpha' && (
        <p className="text-center text-sm text-muted-foreground">
          Try again! Remember: A is for Alpha
        </p>
      )}
    </div>
  );
}

function FeatureCard({ icon, title, description }: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-muted">
      <span className="text-2xl">{icon}</span>
      <div className="flex-1">
        <h4 className="font-medium">{title}</h4>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

// Hook to manage onboarding state
export function useOnboarding() {
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  
  useEffect(() => {
    const completed = localStorage.getItem('onboardingCompleted');
    setNeedsOnboarding(!completed);
  }, []);
  
  const resetOnboarding = () => {
    localStorage.removeItem('onboardingCompleted');
    localStorage.removeItem('userName');
    setNeedsOnboarding(true);
  };
  
  const completeOnboarding = () => {
    setNeedsOnboarding(false);
  };
  
  return {
    needsOnboarding,
    resetOnboarding,
    completeOnboarding,
  };
}