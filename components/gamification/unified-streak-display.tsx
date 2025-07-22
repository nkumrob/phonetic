'use client';

import React from 'react';
import { cn } from '@/lib/utils/cn';
import { STREAK_DISPLAY, STREAK_MILESTONES } from '@/lib/types/streaks';

interface UnifiedStreakDisplayProps {
  quizStreak?: number;
  bestStreak?: number;
  dailyStreak?: number;
  variant?: 'compact' | 'detailed';
  className?: string;
}

export function UnifiedStreakDisplay({
  quizStreak = 0,
  bestStreak = 0,
  dailyStreak = 0,
  variant = 'compact',
  className
}: UnifiedStreakDisplayProps) {
  const streaks = [
    { type: 'quiz' as const, value: quizStreak, show: quizStreak > 0 },
    { type: 'best' as const, value: bestStreak, show: true },
    { type: 'daily' as const, value: dailyStreak, show: true }
  ].filter(s => s.show);

  if (variant === 'compact') {
    return (
      <div className={cn("flex items-center gap-3", className)}>
        {streaks.map(({ type, value }) => (
          <div key={type} className="flex items-center gap-1">
            <span className="text-lg">{STREAK_DISPLAY[type].icon}</span>
            <span className="font-bold">{value}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {streaks.map(({ type, value }) => {
        const display = STREAK_DISPLAY[type];
        const milestones = STREAK_MILESTONES[type as keyof typeof STREAK_MILESTONES];
        const nextMilestone = milestones?.find(m => m > value);
        const progress = nextMilestone 
          ? Math.round((value / nextMilestone) * 100)
          : 100;

        return (
          <div key={type} className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">{display.icon}</span>
                <div>
                  <p className="font-medium">{display.name}</p>
                  <p className="text-xs text-muted-foreground">{display.description}</p>
                </div>
              </div>
              <span className="text-2xl font-bold">{value}</span>
            </div>
            
            {nextMilestone && (
              <div className="ml-7">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                  <span>Next milestone: {nextMilestone}</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}