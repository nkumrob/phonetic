'use client';

import React, { useState, useEffect } from 'react';
import { useSimpleAppState } from '@/lib/contexts/simple-app-context';
import { cn } from '@/lib/utils/cn';
import { calculateOverallAccuracy, getRecentQuizStats } from '@/lib/state/simple-types';

interface PracticeMode {
  id: 'learn' | 'practice' | 'challenge';
  title: string;
  description: string;
  icon: React.ReactNode;
  stats?: {
    label: string;
    value: string | number;
  }[];
}

interface SimplePracticeHubProps {
  onModeSelect?: (mode: 'learn' | 'practice' | 'challenge') => void;
}

export function SimplePracticeHub({ onModeSelect }: SimplePracticeHubProps = {}) {
  const { state } = useSimpleAppState();
  const overallAccuracy = calculateOverallAccuracy(state);
  const recentStats = getRecentQuizStats(state);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleModeSelect = (mode: 'learn' | 'practice' | 'challenge') => {
    if (onModeSelect) {
      onModeSelect(mode);
    }
  };

  const modes: PracticeMode[] = [
    {
      id: 'learn',
      title: 'Learn',
      description: 'Flashcards with audio - perfect for beginners',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" 
          />
        </svg>
      ),
      stats: [
        { label: 'Mode', value: 'No pressure' },
        { label: 'Learn at', value: 'Your pace' },
      ],
    },
    {
      id: 'practice',
      title: 'Practice',
      description: 'Multiple choice quiz - build your skills',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
          />
        </svg>
      ),
      stats: [
        { label: 'Questions', value: '10' },
        { label: 'Pass', value: '70%' },
      ],
    },
    {
      id: 'challenge',
      title: 'Challenge',
      description: 'Timed quiz - test your skills',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
            d="M13 10V3L4 14h7v7l9-11h-7z" 
          />
        </svg>
      ),
      stats: [
        { label: 'Time limit', value: '30s/Q' },
        { label: 'Pass', value: '80%' },
      ],
    },
  ];

  // Use default values on server, actual values on client
  const userName = mounted ? (state.user.name || 'Learner') : 'Learner';
  const userAvatar = mounted ? (state.user.avatar || '✈️') : '✈️';
  
  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid lg:grid-cols-[1fr,320px] gap-8">
        {/* Main Content */}
        <div className="space-y-8">
          {/* Welcome Section - No AI slop gradients */}
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-foreground tracking-tight">
              Welcome back, {userName}!
            </h1>
            <p className="text-body-lg text-secondary max-w-2xl">
              Choose your training mode and master the NATO phonetic alphabet
            </p>
          </div>

          {/* Practice Modes */}
          <div className="grid md:grid-cols-3 gap-4 md:gap-6">
            {modes.map((mode) => (
              <div
                key={mode.id}
                className="relative group cursor-pointer"
                onClick={() => handleModeSelect(mode.id)}
              >
                <div className={cn(
                  "h-full p-6 md:p-8 rounded-xl border-2 transition-all duration-200",
                  "bg-background",
                  "hover:border-primary hover:shadow-lg hover:-translate-y-1",
                  "border-border"
                )}>
                  <div className="space-y-3 md:space-y-4 text-center">
                    <div className={cn(
                      "w-12 h-12 md:w-16 md:h-16 rounded-lg flex items-center justify-center mx-auto",
                      "border-2",
                      mode.id === 'learn' && "bg-warmAmber-500 border-warmAmber-600 text-white",
                      mode.id === 'practice' && "bg-coolBlue-500 border-coolBlue-600 text-white",
                      mode.id === 'challenge' && "bg-warmNeutral-600 border-warmNeutral-700 text-white"
                    )}>
                      {mode.icon}
                    </div>

                    <div>
                      <h3 className="text-xl md:text-2xl font-bold mb-2">{mode.title}</h3>
                      <p className="text-body text-secondary">{mode.description}</p>
                    </div>

                    {mode.stats && (
                      <div className="flex gap-3 md:gap-4 pt-3 md:pt-4 border-t">
                        {mode.stats.map((stat, i) => (
                          <div key={i} className="text-center flex-1">
                            <p className="text-xl md:text-2xl font-black text-foreground">{stat.value}</p>
                            <p className="text-xs text-secondary uppercase tracking-wide font-medium">{stat.label}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* User Stats */}
          <div className="p-6 rounded-xl bg-warmNeutral-50 dark:bg-warmNeutral-900 border-2 border-border space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{userAvatar}</span>
              <div>
                <h2 className="text-lg font-bold">{userName}</h2>
                <p className="text-sm text-secondary">Keep learning!</p>
              </div>
            </div>
            
            <div className="space-y-3 pt-3 border-t">
              <div className="flex justify-between">
                <span className="text-sm text-secondary">Total Quizzes</span>
                <span className="text-sm font-bold">{mounted ? state.progress.totalQuizzesTaken : 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-secondary">Overall Accuracy</span>
                <span className="text-sm font-bold">{mounted ? overallAccuracy : 0}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-secondary">Recent Performance</span>
                <span className="text-sm font-bold">{mounted ? recentStats.averageAccuracy : 0}%</span>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          {mounted && state.progress.quizHistory.length > 0 && (
            <div className="p-6 rounded-xl bg-warmNeutral-50 dark:bg-warmNeutral-900 border-2 border-border space-y-3">
              <h3 className="text-lg font-bold">Recent Activity</h3>
              <div className="space-y-2">
                {state.progress.quizHistory.slice(-3).reverse().map((quiz) => (
                  <div key={quiz.id} className="flex justify-between text-sm">
                    <span className="text-secondary capitalize">{quiz.mode}</span>
                    <span className={cn(
                      "font-bold",
                      quiz.passed ? "text-green-600" : "text-red-600"
                    )}>
                      {Math.round((quiz.correctAnswers / quiz.totalQuestions) * 100)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tips */}
          <div className="p-6 rounded-xl bg-warmNeutral-50 dark:bg-warmNeutral-900 border-2 border-border space-y-3">
            <h3 className="text-lg font-bold">Learning Tips</h3>
            <ul className="space-y-2 text-sm text-secondary">
              <li>• Start with flashcards to learn</li>
              <li>• Practice regularly for best results</li>
              <li>• Challenge yourself when ready</li>
              <li>• Focus on letters you struggle with</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}