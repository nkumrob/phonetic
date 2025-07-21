'use client';

import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils/cn';
import { CelebrationSystem, CELEBRATION_PRESETS } from './celebration-system';

interface Unlock {
  type: 'mode' | 'feature' | 'achievement' | 'cosmetic';
  name: string;
  description: string;
  icon: string | React.ReactNode;
}

interface LevelUpCeremonyProps {
  previousLevel: number;
  newLevel: number;
  unlocks?: Unlock[];
  onComplete?: () => void;
}

const RANKS = [
  { min: 1, max: 10, name: 'Cadet', color: 'from-gray-400 to-gray-600' },
  { min: 11, max: 20, name: 'Junior Operator', color: 'from-blue-400 to-blue-600' },
  { min: 21, max: 30, name: 'Operator', color: 'from-green-400 to-green-600' },
  { min: 31, max: 40, name: 'Senior Operator', color: 'from-purple-400 to-purple-600' },
  { min: 41, max: 50, name: 'Master Operator', color: 'from-yellow-400 to-orange-600' },
];

export function LevelUpCeremony({
  previousLevel,
  newLevel,
  unlocks = [],
  onComplete
}: LevelUpCeremonyProps) {
  const [stage, setStage] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);

  const previousRank = RANKS.find(r => previousLevel >= r.min && previousLevel <= r.max);
  const newRank = RANKS.find(r => newLevel >= r.min && newLevel <= r.max);
  const isRankUp = previousRank?.name !== newRank?.name;

  useEffect(() => {
    const stages = [
      { delay: 0, action: () => setShowCelebration(true) },
      { delay: 500, action: () => setStage(1) }, // Show level
      { delay: 1500, action: () => setStage(2) }, // Show rank if applicable
      { delay: 2500, action: () => setStage(3) }, // Show unlocks
      { delay: 4000, action: () => setStage(4) }, // Show continue
    ];

    const timers = stages.map(({ delay, action }) => 
      setTimeout(action, delay)
    );

    return () => timers.forEach(clearTimeout);
  }, []);

  const handleContinue = () => {
    setStage(5);
    setTimeout(() => {
      onComplete?.();
    }, 300);
  };

  if (stage === 5) return null;

  return (
    <div className={cn(
      "fixed inset-0 z-50 flex items-center justify-center",
      "bg-black/80 backdrop-blur-sm animate-fade-in"
    )}>
      {showCelebration && (
        <CelebrationSystem 
          config={{
            ...CELEBRATION_PRESETS.levelUp,
            message: undefined // Don't show message, we have our own
          }}
          onComplete={() => setShowCelebration(false)}
        />
      )}

      <div className={cn(
        "relative max-w-lg w-full mx-4 text-center space-y-8",
        stage >= 1 && "animate-scale-in"
      )}>
        {/* Level Display */}
        {stage >= 1 && (
          <div className="space-y-4">
            <h1 className="text-6xl md:text-8xl font-black text-white animate-bounce-in">
              LEVEL {newLevel}!
            </h1>
            
            {/* Level Progress Bar */}
            <div className="relative h-4 bg-white/20 rounded-full overflow-hidden mx-auto max-w-xs">
              <div 
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-purple-500 animate-fill-right"
                style={{ width: `${(newLevel / 50) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Rank Display */}
        {stage >= 2 && isRankUp && newRank && (
          <div className="space-y-4 animate-slide-up">
            <p className="text-xl text-white/80">You&apos;ve been promoted to</p>
            <div className={cn(
              "inline-block px-8 py-4 rounded-2xl",
              "bg-gradient-to-r text-white font-bold text-3xl",
              newRank.color
            )}>
              {newRank.name}
            </div>
          </div>
        )}

        {/* Unlocks */}
        {stage >= 3 && unlocks.length > 0 && (
          <div className="space-y-4 animate-slide-up">
            <h2 className="text-2xl font-bold text-white">New Unlocks!</h2>
            <div className="grid gap-3 max-w-sm mx-auto">
              {unlocks.map((unlock, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-lg",
                    "bg-white/10 backdrop-blur-sm",
                    "animate-slide-in-right"
                  )}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="text-3xl">{unlock.icon}</div>
                  <div className="text-left">
                    <h3 className="font-semibold text-white">{unlock.name}</h3>
                    <p className="text-sm text-white/70">{unlock.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Continue Button */}
        {stage >= 4 && (
          <button
            onClick={handleContinue}
            className={cn(
              "px-8 py-3 rounded-full",
              "bg-white text-black font-bold text-lg",
              "hover:scale-105 transition-transform",
              "animate-bounce-in"
            )}
          >
            Continue
          </button>
        )}
      </div>
    </div>
  );
}

// Hook to manage level up ceremonies
export function useLevelUpCeremony() {
  const [ceremony, setCeremony] = useState<{
    previousLevel: number;
    newLevel: number;
    unlocks: Unlock[];
  } | null>(null);

  const showLevelUpCeremony = (previousLevel: number, newLevel: number) => {
    // Determine unlocks based on level
    const unlocks: Unlock[] = [];

    // Mode unlocks
    if (newLevel === 3) {
      unlocks.push({
        type: 'mode',
        name: 'Challenge Mode',
        description: 'Test your skills with time pressure',
        icon: '⚡'
      });
    }

    if (newLevel === 5) {
      unlocks.push({
        type: 'feature',
        name: 'Daily Challenges',
        description: 'Complete special missions every day',
        icon: '📅'
      });
    }

    if (newLevel === 10) {
      unlocks.push({
        type: 'mode',
        name: 'Expert Difficulty',
        description: 'For those who seek the ultimate challenge',
        icon: '💀'
      });
    }

    // Achievement unlocks every 5 levels
    if (newLevel % 5 === 0) {
      unlocks.push({
        type: 'achievement',
        name: `Level ${newLevel} Master`,
        description: 'Reached a new milestone',
        icon: '🏆'
      });
    }

    // Cosmetic unlocks
    if (newLevel === 15) {
      unlocks.push({
        type: 'cosmetic',
        name: 'Golden Badge',
        description: 'Show off your expertise',
        icon: '🥇'
      });
    }

    setCeremony({ previousLevel, newLevel, unlocks });
  };

  const hideLevelUpCeremony = () => setCeremony(null);

  const LevelUpCeremonyDisplay = () => ceremony ? (
    <LevelUpCeremony
      previousLevel={ceremony.previousLevel}
      newLevel={ceremony.newLevel}
      unlocks={ceremony.unlocks}
      onComplete={hideLevelUpCeremony}
    />
  ) : null;

  return {
    showLevelUpCeremony,
    LevelUpCeremonyDisplay
  };
}