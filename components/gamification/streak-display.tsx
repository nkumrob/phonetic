'use client';

import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils/cn';

interface StreakDisplayProps {
  count: number;
  type?: 'quiz' | 'daily' | 'global';
  size?: 'small' | 'default' | 'large';
  showAnimation?: boolean;
  label?: string;
}

export function StreakDisplay({ 
  count, 
  type = 'quiz',
  size = 'default',
  showAnimation = true,
  label
}: StreakDisplayProps) {
  const [previousCount, setPreviousCount] = useState(count);
  const [isIncreasing, setIsIncreasing] = useState(false);
  const [showFlame, setShowFlame] = useState(count > 0);

  useEffect(() => {
    if (count > previousCount) {
      setIsIncreasing(true);
      const timer = setTimeout(() => setIsIncreasing(false), 600);
      return () => clearTimeout(timer);
    }
    setPreviousCount(count);
    setShowFlame(count > 0);
  }, [count, previousCount]);

  const sizeClasses = {
    small: 'text-lg',
    default: 'text-2xl',
    large: 'text-4xl'
  };

  const flameIntensity = 
    count >= 20 ? 'flame-legendary' :
    count >= 10 ? 'flame-intense' :
    count >= 5 ? 'flame-medium' :
    'flame-small';

  if (count === 0 && type !== 'daily') return null;

  return (
    <div className={cn(
      "flex items-center gap-2",
      isIncreasing && showAnimation && "animate-bounce-in"
    )}>
      {showFlame && (
        <div className={cn(
          "relative",
          sizeClasses[size]
        )}>
          {/* Fire emoji with CSS animation */}
          <span className={cn(
            "block",
            flameIntensity,
            isIncreasing && "animate-pulse"
          )}>
            🔥
          </span>
          
          {/* Particle effects for high streaks */}
          {count >= 10 && showAnimation && (
            <div className="absolute inset-0 pointer-events-none">
              <div className="fire-particles" />
            </div>
          )}
        </div>
      )}
      
      <div className="flex flex-col">
        <span className={cn(
          "font-bold",
          sizeClasses[size],
          count >= 20 && "text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500",
          count >= 10 && count < 20 && "text-orange-500",
          count >= 5 && count < 10 && "text-yellow-500",
          count < 5 && "text-gray-600 dark:text-gray-400"
        )}>
          {count}
        </span>
        {label && (
          <span className="text-xs text-muted-foreground">
            {label}
          </span>
        )}
      </div>
      
      {/* Milestone badges */}
      {count > 0 && count % 5 === 0 && showAnimation && (
        <div className="ml-2 animate-fade-in">
          <span className="text-xs bg-yellow-500 text-white px-2 py-1 rounded-full font-bold">
            {count === 5 && 'Getting Hot!'}
            {count === 10 && 'On Fire!'}
            {count === 15 && 'Blazing!'}
            {count === 20 && 'LEGENDARY!'}
            {count > 20 && 'UNSTOPPABLE!'}
          </span>
        </div>
      )}
    </div>
  );
}

// Daily streak calendar component
export function StreakCalendar({ 
  streakDays,
  currentStreak,
  longestStreak 
}: {
  streakDays: string[]; // Array of ISO date strings
  currentStreak: number;
  longestStreak: number;
}) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };
  
  const isStreakDay = (date: Date | null) => {
    if (!date) return false;
    const dateStr = date.toISOString().split('T')[0];
    return streakDays.includes(dateStr);
  };
  
  const isToday = (date: Date | null) => {
    if (!date) return false;
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };
  
  const days = getDaysInMonth(currentMonth);
  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
          className="p-1 hover:bg-muted rounded"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <h3 className="font-semibold">{monthName}</h3>
        
        <button
          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
          className="p-1 hover:bg-muted rounded"
          disabled={currentMonth.getMonth() === new Date().getMonth()}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      
      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
          <div key={day} className="text-xs text-muted-foreground font-medium p-2">
            {day}
          </div>
        ))}
        
        {days.map((date, index) => (
          <div
            key={index}
            className={cn(
              "aspect-square p-2 rounded flex items-center justify-center relative",
              date && "hover:bg-muted cursor-pointer",
              isStreakDay(date) && "bg-orange-500 text-white hover:bg-orange-600",
              isToday(date) && "ring-2 ring-primary"
            )}
          >
            {date && (
              <>
                <span className="text-sm">{date.getDate()}</span>
                {isStreakDay(date) && (
                  <span className="absolute -top-1 -right-1 text-xs">🔥</span>
                )}
              </>
            )}
          </div>
        ))}
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t">
        <div className="text-center">
          <StreakDisplay count={currentStreak} type="daily" size="small" label="Current Streak" />
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-2">
            <span className="text-2xl">🏆</span>
            <div>
              <div className="text-2xl font-bold">{longestStreak}</div>
              <div className="text-xs text-muted-foreground">Best Streak</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}