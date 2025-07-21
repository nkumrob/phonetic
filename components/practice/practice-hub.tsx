'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui';
import { useSession } from '@/lib/contexts/session-context';
import { cn } from '@/lib/utils/cn';
import { 
  DailyGoals, 
  XPProgressBar, 
  StreakDisplay,
  OnboardingFlow,
  useOnboarding,
  useXPAnimation,
  useLevelUpCeremony
} from '@/components/gamification';
import { useSoundEffects } from '@/lib/hooks/use-sound-effects';
import { calculateLevelFromTotalXP } from '@/lib/utils/xp-calculations';
import type { DailyGoal } from '@/components/gamification';

interface PracticeMode {
  id: 'learn' | 'practice' | 'challenge';
  title: string;
  description: string;
  icon: React.ReactNode;
  recommendedLevel: number;
  requiredAccuracy?: number;
  requiredStreak?: number;
  stats?: {
    label: string;
    value: string | number;
  }[];
}

interface PracticeHubProps {
  onModeSelect?: (mode: 'learn' | 'practice' | 'challenge') => void;
}

export function PracticeHub({ onModeSelect }: PracticeHubProps = {}) {
  const { session, updateProgress } = useSession();
  const [showSaveIndicator, setShowSaveIndicator] = useState(false);
  const { needsOnboarding, completeOnboarding } = useOnboarding();
  const { showXPGain, XPGainDisplay } = useXPAnimation();
  const { showLevelUpCeremony, LevelUpCeremonyDisplay } = useLevelUpCeremony();
  const { playClick, playAchievement } = useSoundEffects();
  const levelUpCheckedRef = useRef(false);

  // Check for level ups
  useEffect(() => {
    // Skip if already checked in this session
    if (levelUpCheckedRef.current) return;
    
    const savedLevel = localStorage.getItem('lastKnownLevel');
    const currentLevel = session.userProgress.level;
    
    if (savedLevel && parseInt(savedLevel) < currentLevel) {
      levelUpCheckedRef.current = true;
      showLevelUpCeremony(parseInt(savedLevel), currentLevel);
    }
    
    localStorage.setItem('lastKnownLevel', currentLevel.toString());
  }, [session.userProgress.level, showLevelUpCeremony]);

  const showSessionSaved = () => {
    setShowSaveIndicator(true);
    setTimeout(() => setShowSaveIndicator(false), 3000);
  };
  
  const handleGoalComplete = (goal: DailyGoal) => {
    showXPGain(goal.xpReward, {
      x: window.innerWidth - 200,
      y: 300,
      reason: goal.title
    });
    playAchievement();
    updateProgress({ experience: session.userProgress.experience + goal.xpReward });
  };
  
  const handleAllGoalsComplete = () => {
    showXPGain(50, {
      x: window.innerWidth - 200,
      y: 300,
      reason: 'All Daily Goals!',
      multiplier: 2
    });
    playAchievement();
    updateProgress({ experience: session.userProgress.experience + 50 });
  };

  const getRecommendedMode = (): 'learn' | 'practice' | 'challenge' => {
    const { level, totalQuizzesTaken } = session.userProgress;
    
    if (totalQuizzesTaken === 0) return 'learn';
    if (level < 3) return 'practice';
    if (session.userProgress.bestStreak > 10) return 'challenge';
    
    // Rotate recommendations
    const modes: ('learn' | 'practice' | 'challenge')[] = ['learn', 'practice', 'challenge'];
    return modes[totalQuizzesTaken % 3];
  };

  const handleQuickStart = () => {
    playClick();
    const recommended = getRecommendedMode();
    if (onModeSelect) {
      onModeSelect(recommended);
    }
  };

  // Calculate user's overall accuracy
  const overallAccuracy = session.userProgress.totalCorrectAnswers > 0
    ? Math.round((session.userProgress.totalCorrectAnswers / 
        (session.userProgress.totalCorrectAnswers + session.userProgress.totalIncorrectAnswers)) * 100)
    : 0;

  const practiceModesData: PracticeMode[] = [
    {
      id: 'learn',
      title: 'Learn',
      description: 'Study with flashcards at your own pace',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8">
          <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="2"/>
          <path d="M8 10h8M8 14h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ),
      recommendedLevel: 0,
      stats: [
        { label: 'Letters Mastered', value: Object.values(session.flashcardProgress).filter(v => v >= 3).length },
        { label: 'Study Sessions', value: Object.keys(session.flashcardProgress).length }
      ]
    },
    {
      id: 'practice',
      title: 'Practice',
      description: 'Standard quiz with 70% pass requirement',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8">
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
          <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ),
      recommendedLevel: 0,
      stats: [
        { label: 'Accuracy', value: overallAccuracy + '%' },
        { label: 'Quizzes Taken', value: session.userProgress.totalQuizzesTaken }
      ]
    },
    {
      id: 'challenge',
      title: 'Challenge',
      description: 'Time pressure, 80% pass requirement',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
        </svg>
      ),
      recommendedLevel: 3,
      requiredAccuracy: 70,
      requiredStreak: 5,
      stats: [
        { label: 'Best Quiz Streak', value: session.userProgress.bestStreak },
        { label: 'Daily Streak', value: session.userProgress.consecutiveDays }
      ]
    }
  ];

  // Calculate XP progress correctly using total XP
  const xpInfo = calculateLevelFromTotalXP(session.userProgress.experience);
  const xpForNextLevel = xpInfo.xpForNextLevel;
  const xpProgress = xpInfo.progressPercent;

  // Get user name for personalization - only on client to prevent hydration mismatch
  const [userName, setUserName] = useState<string | null>(null);
  
  useEffect(() => {
    const storedName = localStorage.getItem('userName');
    setUserName(storedName);
  }, []);

  return (
    <div className="min-h-screen">
      {/* Onboarding Flow */}
      {needsOnboarding && (
        <OnboardingFlow onComplete={completeOnboarding} />
      )}
      
      {/* XP Gain Animations */}
      <XPGainDisplay />
      
      {/* Level Up Ceremony */}
      <LevelUpCeremonyDisplay />
      
      {/* Session Saved Indicator */}
      <div className={cn(
        "fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg transition-all duration-300 flex items-center gap-2 z-50",
        showSaveIndicator ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"
      )}>
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        Progress Saved
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-[1fr,320px] gap-8">
          {/* Main Content */}
          <div className="space-y-8">
            {/* Header */}
            <div className="text-center space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold">
                {userName ? `Welcome back, ${userName}!` : 'Practice Hub'}
              </h1>
              <p className="text-xl text-muted-foreground">
                Your personalized learning center
              </p>
              {session.userProgress.consecutiveDays > 0 && (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10">
                  <StreakDisplay 
                    count={session.userProgress.consecutiveDays} 
                    type="daily"
                    size="small"
                    label="Daily Streak"
                  />
                </div>
              )}
            </div>

            {/* Quick Start */}
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-8 text-center space-y-6">
              <h2 className="text-2xl font-semibold">Ready to practice?</h2>
              <p className="text-muted-foreground">
                We&apos;ll start you with the perfect difficulty based on your progress
              </p>
              <Button 
                size="lg" 
                onClick={handleQuickStart}
                className="text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all"
              >
                Quick Start
                <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Button>
              <p className="text-sm text-muted-foreground">
                Recommended: {getRecommendedMode().charAt(0).toUpperCase() + getRecommendedMode().slice(1)} Mode
              </p>
            </div>

            {/* Practice Modes */}
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">Choose Your Mode</h2>
              <div className="grid md:grid-cols-3 gap-4">
                {practiceModesData.map((mode) => {
                  const levelLocked = session.userProgress.level < mode.recommendedLevel;
                  const accuracyLocked = mode.requiredAccuracy && overallAccuracy < mode.requiredAccuracy;
                  const streakLocked = mode.requiredStreak && session.userProgress.bestStreak < mode.requiredStreak;
                  const isLocked = levelLocked || accuracyLocked || streakLocked;
                  
                  const lockReason = levelLocked ? `Level ${mode.recommendedLevel}+` :
                                   accuracyLocked ? `${mode.requiredAccuracy}% Accuracy` :
                                   streakLocked ? `${mode.requiredStreak} Streak` : '';
                  
                  return (
                    <button
                      key={mode.id}
                      onClick={() => {
                        if (!isLocked && onModeSelect) {
                          playClick();
                          onModeSelect(mode.id);
                        }
                      }}
                      disabled={isLocked}
                      className={cn(
                        "relative p-6 rounded-xl border-2 transition-all text-left space-y-4",
                        isLocked 
                          ? "border-border/50 bg-muted/30 opacity-60 cursor-not-allowed" 
                          : "border-border hover:border-primary hover:shadow-lg hover:scale-[1.02] cursor-pointer"
                      )}
                    >
                      {isLocked && (
                        <div className="absolute top-3 right-3 text-xs bg-orange-600 text-white px-2 py-1 rounded">
                          {lockReason}
                        </div>
                      )}
                      
                      <div className="text-primary">{mode.icon}</div>
                      <div>
                        <h3 className="text-lg font-semibold">{mode.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{mode.description}</p>
                      </div>
                      
                      {mode.stats && (
                        <div className="grid grid-cols-2 gap-3 pt-3 border-t">
                          {mode.stats.map((stat, idx) => (
                            <div key={idx} className="text-center">
                              <p className="text-lg font-semibold">{stat.value}</p>
                              <p className="text-xs text-muted-foreground">{stat.label}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Progress Dashboard Sidebar */}
          <div className="space-y-6">
            {/* User Stats */}
            <div className="bg-background border-2 border-border rounded-xl p-6 space-y-4">
              <h3 className="font-semibold text-lg">Your Progress</h3>
              
              {/* Level & XP */}
              <XPProgressBar
                current={xpInfo.currentLevelXP}
                max={xpForNextLevel}
                level={session.userProgress.level}
                size="default"
              />

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-3 pt-3">
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <p className="text-2xl font-bold">
                    {session.userProgress.consecutiveDays}
                  </p>
                  <p className="text-xs text-muted-foreground">Day Streak</p>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <p className="text-2xl font-bold">
                    {session.userProgress.achievements.length}
                  </p>
                  <p className="text-xs text-muted-foreground">Achievements</p>
                </div>
              </div>
            </div>

            {/* Daily Goals */}
            <div className="bg-background border-2 border-border rounded-xl p-6">
              <DailyGoals 
                onGoalComplete={handleGoalComplete}
                onAllGoalsComplete={handleAllGoalsComplete}
              />
            </div>

            {/* Next Achievement */}
            <div className="bg-background border-2 border-border rounded-xl p-6 space-y-3">
              <h3 className="font-semibold">Next Achievement</h3>
              <div className="flex items-center gap-3">
                <span className="text-2xl">📚</span>
                <div className="flex-1">
                  <p className="text-sm font-medium">Quiz Enthusiast</p>
                  <p className="text-xs text-muted-foreground">Complete 10 quizzes</p>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Progress</span>
                  <span>{session.userProgress.totalQuizzesTaken}/10</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(session.userProgress.totalQuizzesTaken / 10) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}