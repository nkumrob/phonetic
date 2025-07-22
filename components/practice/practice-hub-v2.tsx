'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui';
import { useSessionCompat } from '@/lib/contexts/unified-state-context';
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
import { LevelSystem } from '@/lib/core/level-system';
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

export function PracticeHubV2({ onModeSelect }: PracticeHubProps = {}) {
  const { session, updateProgress, getAchievementProgress } = useSessionCompat();
  const [showSaveIndicator, setShowSaveIndicator] = useState(false);
  const { needsOnboarding, completeOnboarding } = useOnboarding();
  const { showXPGain, XPGainDisplay } = useXPAnimation();
  const { showLevelUpCeremony, LevelUpCeremonyDisplay } = useLevelUpCeremony();
  const { playClick, playAchievement } = useSoundEffects();
  const levelUpCheckedRef = useRef(false);
  const [isClient, setIsClient] = useState(false);
  
  // Ensure we only render after hydration to avoid mismatches
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Check for level ups
  useEffect(() => {
    // Skip if already checked in this session
    if (levelUpCheckedRef.current) return;
    
    const lastKnownLevel = localStorage.getItem('lastKnownLevel');
    const currentLevel = session.userProgress.level;
    
    if (lastKnownLevel && parseInt(lastKnownLevel) < currentLevel) {
      levelUpCheckedRef.current = true;
      const unlockInfo = LevelSystem.getUnlockInfo(currentLevel);
      
      showLevelUpCeremony({
        oldLevel: parseInt(lastKnownLevel),
        newLevel: currentLevel,
        unlockedModes: unlockInfo.modes,
      });
      
      playAchievement();
    }
    
    // Always update last known level
    localStorage.setItem('lastKnownLevel', currentLevel.toString());
  }, [session.userProgress.level, showLevelUpCeremony, playAchievement]);

  const handleQuickStart = () => {
    playClick();
    
    // Smart mode selection based on user progress
    const currentLevel = session.userProgress.level;
    const lastQuizAccuracy = session.quizHistory.length > 0 
      ? (session.quizHistory[session.quizHistory.length - 1].correct / 
         (session.quizHistory[session.quizHistory.length - 1].correct + 
          session.quizHistory[session.quizHistory.length - 1].incorrect)) * 100
      : 0;
    
    // Choose mode based on level and recent performance
    let selectedMode: 'learn' | 'practice' | 'challenge' = 'practice';
    
    if (currentLevel < 3) {
      selectedMode = 'learn';
    } else if (currentLevel >= 5 && lastQuizAccuracy >= 80) {
      selectedMode = 'challenge';
    } else {
      selectedMode = 'practice';
    }
    
    if (onModeSelect) {
      onModeSelect(selectedMode);
    }
  };

  const handleModeSelect = (mode: 'learn' | 'practice' | 'challenge') => {
    playClick();
    
    // Check if mode is locked
    if (mode === 'challenge' && !canAccessChallenge()) {
      return;
    }
    
    if (onModeSelect) {
      onModeSelect(mode);
    }
  };

  const achievementProgress = getAchievementProgress();
  const completedAchievements = Object.entries(achievementProgress)
    .filter(([_, progress]) => progress === 100).length;
  const totalAchievements = Object.keys(achievementProgress).length;

  const canAccessChallenge = () => {
    // Challenge mode requirements
    const hasRequiredLevel = session.userProgress.level >= 3;
    const hasRequiredAccuracy = session.quizHistory.length > 0 && 
      session.quizHistory.slice(-5).some(q => 
        (q.correct / (q.correct + q.incorrect)) >= 0.7
      );
    const hasStreakAchievement = achievementProgress.streakMaster >= 25; // 5+ streak
    
    return hasRequiredLevel && hasRequiredAccuracy && hasStreakAchievement;
  };

  const practiceStats = {
    totalQuizzes: session.userProgress.totalQuizzesTaken,
    accuracy: session.userProgress.totalQuizzesTaken > 0
      ? Math.round((session.userProgress.totalCorrectAnswers / 
          (session.userProgress.totalCorrectAnswers + session.userProgress.totalIncorrectAnswers)) * 100)
      : 0,
    bestStreak: session.userProgress.bestStreak,
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
      recommendedLevel: 1,
      stats: [
        { label: 'XP per card', value: '5' },
        { label: 'Mode', value: 'No pressure' },
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
      recommendedLevel: 1,
      stats: [
        { label: 'XP per answer', value: '10' },
        { label: 'Pass', value: '70%' },
      ],
    },
    {
      id: 'challenge',
      title: 'Challenge',
      description: 'Timed quiz with harder questions',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
            d="M13 10V3L4 14h7v7l9-11h-7z" 
          />
        </svg>
      ),
      recommendedLevel: 3,
      requiredAccuracy: 70,
      requiredStreak: 5,
      stats: [
        { label: 'XP per answer', value: '20' },
        { label: 'Pass', value: '80%' },
      ],
    },
  ];

  // Get user display name
  const [userName, setUserName] = useState('Cadet');
  
  useEffect(() => {
    const name = localStorage.getItem('userName') || 'Cadet';
    setUserName(name);
  }, []);
  
  // Use LevelSystem for consistent level calculations
  const levelInfo = LevelSystem.calculateLevel(session.userProgress.experience);
  const unlockInfo = LevelSystem.getUnlockInfo(levelInfo.level);

  return (
    <>
      {needsOnboarding && (
        <OnboardingFlow onComplete={completeOnboarding} />
      )}
      
      <XPGainDisplay />
      <LevelUpCeremonyDisplay />
      
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-[1fr,320px] gap-8">
          {/* Main Content */}
          <div className="space-y-8">
            {/* Welcome Section */}
            <div className="text-center space-y-4">
              <h1 className="text-5xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Welcome back, {userName}!
              </h1>
              <p className="text-xl text-muted-foreground">
                Choose your training mode and master the NATO phonetic alphabet
              </p>
            </div>

            {/* Quick Start */}
            <div className="flex justify-center">
              <Button 
                size="lg" 
                onClick={handleQuickStart}
                className="group relative px-8 py-6 text-lg font-bold bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                <span className="relative z-10 flex items-center gap-3">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M13 10V3L4 14h7v7l9-11h-7z" 
                    />
                  </svg>
                  Quick Start
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-700 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" />
              </Button>
            </div>

            {/* Practice Modes */}
            <div className="grid md:grid-cols-3 gap-6">
              {modes.map((mode) => {
                const isLocked = mode.id === 'challenge' && !canAccessChallenge();
                const isRecommended = levelInfo.level >= mode.recommendedLevel && 
                                   levelInfo.level < (mode.recommendedLevel + 2);
                
                return (
                  <div
                    key={mode.id}
                    className={cn(
                      "relative group cursor-pointer",
                      isLocked && "opacity-50"
                    )}
                    onClick={() => !isLocked && handleModeSelect(mode.id)}
                  >
                    {isRecommended && (
                      <div className="absolute -top-3 left-4 px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold rounded-full z-10">
                        Recommended
                      </div>
                    )}
                    
                    <div className={cn(
                      "h-full p-6 rounded-2xl border-2 transition-all",
                      "bg-gradient-to-br from-background to-muted/20",
                      !isLocked && "hover:border-primary hover:shadow-xl hover:scale-105",
                      isLocked ? "border-muted cursor-not-allowed" : "border-border"
                    )}>
                      <div className="space-y-4">
                        <div className={cn(
                          "w-16 h-16 rounded-xl flex items-center justify-center",
                          "bg-gradient-to-br",
                          mode.id === 'learn' && "from-green-500 to-emerald-600",
                          mode.id === 'practice' && "from-blue-500 to-blue-600",
                          mode.id === 'challenge' && "from-purple-500 to-pink-600"
                        )}>
                          <div className="text-white">{mode.icon}</div>
                        </div>
                        
                        <div>
                          <h3 className="text-xl font-bold mb-2">{mode.title}</h3>
                          <p className="text-sm text-muted-foreground">{mode.description}</p>
                        </div>
                        
                        {isLocked && (
                          <div className="space-y-2 pt-2 border-t">
                            <p className="text-xs font-medium text-destructive">Requirements:</p>
                            <ul className="text-xs text-muted-foreground space-y-1">
                              <li className={cn(
                                "flex items-center gap-1",
                                session.userProgress.level >= 3 && "text-green-600"
                              )}>
                                {session.userProgress.level >= 3 ? '✓' : '✗'} Level 3+
                              </li>
                              <li className={cn(
                                "flex items-center gap-1",
                                practiceStats.accuracy >= 70 && "text-green-600"
                              )}>
                                {practiceStats.accuracy >= 70 ? '✓' : '✗'} 70% accuracy
                              </li>
                              <li className={cn(
                                "flex items-center gap-1",
                                achievementProgress.streakMaster >= 25 && "text-green-600"
                              )}>
                                {achievementProgress.streakMaster >= 25 ? '✓' : '✗'} 5 streak achievement
                              </li>
                            </ul>
                          </div>
                        )}
                        
                        {mode.stats && !isLocked && (
                          <div className="flex gap-4 pt-4 border-t">
                            {mode.stats.map((stat, i) => (
                              <div key={i} className="text-center">
                                <p className="text-2xl font-bold text-primary">{stat.value}</p>
                                <p className="text-xs text-muted-foreground">{stat.label}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Progress Overview */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-background to-muted/20 border-2 space-y-4">
              <h2 className="text-lg font-bold">Your Progress</h2>
              
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium">Level {levelInfo.level}</span>
                    <span className="text-xs text-muted-foreground">
                      {isClient ? `${levelInfo.currentLevelXP}/${levelInfo.xpForNextLevel} XP` : 'Loading...'}
                    </span>
                  </div>
                  <XPProgressBar 
                    current={isClient ? levelInfo.currentLevelXP : 0} 
                    max={isClient ? levelInfo.xpForNextLevel : 100}
                    showLabel={false}
                  />
                </div>
                
                <div className="pt-2 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Best Streak</span>
                    <StreakDisplay count={isClient ? session.userProgress.bestStreak : 0} size="sm" />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Daily Streak</span>
                    <span className="text-sm font-medium">{isClient ? `${session.userProgress.consecutiveDays} days` : '...'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Achievements</span>
                    <span className="text-sm font-medium">{isClient ? `${completedAchievements}/${totalAchievements}` : '...'}</span>
                  </div>
                </div>
              </div>
              
              {unlockInfo.nextUnlock && (
                <div className="pt-3 border-t">
                  <p className="text-xs text-muted-foreground">
                    Next unlock: <span className="font-medium text-primary">
                      {unlockInfo.nextUnlock.mode} mode
                    </span> at level {unlockInfo.nextUnlock.level}
                  </p>
                </div>
              )}
            </div>

            {/* Daily Goals */}
            <DailyGoals 
              onGoalComplete={(goal: DailyGoal) => {
                showXPGain(goal.xpReward, {
                  x: window.innerWidth - 160,
                  y: 200,
                });
                updateProgress({ 
                  experience: session.userProgress.experience + goal.xpReward 
                });
              }}
              onAllGoalsComplete={() => {
                playAchievement();
                const bonusXP = 100;
                showXPGain(bonusXP, {
                  x: window.innerWidth - 160,
                  y: 200,
                });
                updateProgress({ 
                  experience: session.userProgress.experience + bonusXP 
                });
              }}
            />

            {/* Quick Stats */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-background to-muted/20 border-2 space-y-3">
              <h3 className="text-lg font-bold">Quick Stats</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Quizzes</span>
                  <span className="text-sm font-medium">{isClient ? practiceStats.totalQuizzes : '...'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Accuracy</span>
                  <span className="text-sm font-medium">{isClient ? `${practiceStats.accuracy}%` : '...'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Best Streak</span>
                  <span className="text-sm font-medium">{isClient ? practiceStats.bestStreak : '...'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Session Saved Indicator */}
        {showSaveIndicator && (
          <div className="fixed bottom-4 right-4 animate-fade-in">
            <div className="bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Progress Saved
            </div>
          </div>
        )}
      </div>
    </>
  );
}