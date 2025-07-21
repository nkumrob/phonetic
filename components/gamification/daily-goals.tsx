'use client';

import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils/cn';
import { useSession } from '@/lib/contexts/session-context';
import { CelebrationSystem } from './celebration-system';

export interface DailyGoal {
  id: string;
  title: string;
  description: string;
  current: number;
  target: number;
  xpReward: number;
  completed: boolean;
  type: 'quiz' | 'letters' | 'streak' | 'time' | 'accuracy';
  icon: string;
}

interface DailyGoalsState {
  date: string; // YYYY-MM-DD format
  goals: DailyGoal[];
  lastResetTime: number;
  completedAllBonus: boolean;
  streakDays: number;
}

// Generate personalized daily goals based on user progress
function generateDailyGoals(userProgress: {
  level?: number;
  recentAccuracy?: number;
  daysInactive?: number;
}): DailyGoal[] {
  const level = userProgress.level || 1;
  const recentAccuracy = userProgress.recentAccuracy || 0.7;
  const isReturning = (userProgress.daysInactive || 0) > 2;
  
  const goals: DailyGoal[] = [];
  
  // Always have a quiz goal (adjusted for level)
  goals.push({
    id: 'daily_quiz',
    title: `Complete ${level < 5 ? 2 : 3} Quizzes`,
    description: 'Practice makes perfect',
    current: 0,
    target: level < 5 ? 2 : 3,
    xpReward: 50,
    completed: false,
    type: 'quiz',
    icon: '📝'
  });
  
  // Letter mastery goal (adaptive)
  if (level < 10) {
    goals.push({
      id: 'daily_letters',
      title: 'Master 3 New Letters',
      description: 'Expand your knowledge',
      current: 0,
      target: 3,
      xpReward: 40,
      completed: false,
      type: 'letters',
      icon: '🔤'
    });
  } else {
    goals.push({
      id: 'daily_review',
      title: 'Review 5 Letters',
      description: 'Keep your skills sharp',
      current: 0,
      target: 5,
      xpReward: 30,
      completed: false,
      type: 'letters',
      icon: '🔄'
    });
  }
  
  // Accuracy or streak goal
  if (recentAccuracy < 0.8) {
    goals.push({
      id: 'daily_accuracy',
      title: 'Get 90% Accuracy',
      description: 'In any quiz',
      current: 0,
      target: 90,
      xpReward: 60,
      completed: false,
      type: 'accuracy',
      icon: '🎯'
    });
  } else {
    goals.push({
      id: 'daily_streak',
      title: '15 Answer Streak',
      description: 'Get consecutive correct answers',
      current: 0,
      target: 15,
      xpReward: 60,
      completed: false,
      type: 'streak',
      icon: '🔥'
    });
  }
  
  return goals;
}

export function DailyGoals({ 
  onGoalComplete,
  onAllGoalsComplete 
}: {
  onGoalComplete?: (goal: DailyGoal) => void;
  onAllGoalsComplete?: () => void;
}) {
  const { session } = useSession();
  const [goalsState, setGoalsState] = useState<DailyGoalsState | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [timeUntilReset, setTimeUntilReset] = useState('');

  // Initialize and check for daily reset
  useEffect(() => {
    const loadGoals = () => {
      const stored = localStorage.getItem('dailyGoals_v2');
      const today = new Date().toISOString().split('T')[0];
      
      if (stored) {
        const parsed: DailyGoalsState = JSON.parse(stored);
        
        // Check if we need to reset (past midnight)
        if (parsed.date !== today) {
          // Reset goals for new day
          const newGoals = generateDailyGoals(session.userProgress);
          const newState: DailyGoalsState = {
            date: today,
            goals: newGoals,
            lastResetTime: Date.now(),
            completedAllBonus: false,
            streakDays: parsed.completedAllBonus ? parsed.streakDays + 1 : 0
          };
          setGoalsState(newState);
          localStorage.setItem('dailyGoals_v2', JSON.stringify(newState));
        } else {
          setGoalsState(parsed);
        }
      } else {
        // First time - create new goals
        const newGoals = generateDailyGoals(session.userProgress);
        const newState: DailyGoalsState = {
          date: today,
          goals: newGoals,
          lastResetTime: Date.now(),
          completedAllBonus: false,
          streakDays: 0
        };
        setGoalsState(newState);
        localStorage.setItem('dailyGoals_v2', JSON.stringify(newState));
      }
    };
    
    loadGoals();
    
    // Check every minute for midnight reset
    const interval = setInterval(loadGoals, 60000);
    return () => clearInterval(interval);
  }, [session.userProgress]);

  // Update countdown timer
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      
      const diff = tomorrow.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      setTimeUntilReset(`${hours}h ${minutes}m`);
    };
    
    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);
    return () => clearInterval(interval);
  }, []);

  // Update goal progress
  const updateGoalProgress = (goalId: string, progress: number) => {
    if (!goalsState) return;
    
    setGoalsState(prev => {
      if (!prev) return null;
      
      const updated = { ...prev };
      const goalIndex = updated.goals.findIndex(g => g.id === goalId);
      
      if (goalIndex === -1) return prev;
      
      const goal = { ...updated.goals[goalIndex] };
      const wasCompleted = goal.completed;
      
      goal.current = Math.min(progress, goal.target);
      goal.completed = goal.current >= goal.target;
      
      updated.goals[goalIndex] = goal;
      
      // Check if goal just completed
      if (!wasCompleted && goal.completed) {
        onGoalComplete?.(goal);
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 2000);
      }
      
      // Check if all goals completed
      const allCompleted = updated.goals.every(g => g.completed);
      if (allCompleted && !updated.completedAllBonus) {
        updated.completedAllBonus = true;
        onAllGoalsComplete?.();
      }
      
      // Save to localStorage
      localStorage.setItem('dailyGoals_v2', JSON.stringify(updated));
      
      return updated;
    });
  };

  if (!goalsState) return null;

  const completedCount = goalsState.goals.filter(g => g.completed).length;
  const totalXP = goalsState.goals.reduce((sum, goal) => sum + (goal.completed ? goal.xpReward : 0), 0);
  const bonusXP = goalsState.completedAllBonus ? 50 : 0;

  return (
    <div className="space-y-4">
      {showCelebration && (
        <CelebrationSystem 
          config={{
            type: 'sparkle',
            duration: 1500,
            intensity: 'medium',
            message: 'Goal Complete!'
          }}
        />
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-semibold text-lg">Daily Goals</h3>
          {goalsState.streakDays > 0 && (
            <p className="text-sm text-muted-foreground">
              {goalsState.streakDays} day streak! 🔥
            </p>
          )}
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Resets in</p>
          <p className="text-sm font-medium">{timeUntilReset}</p>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="flex items-center gap-2">
        <div className="flex-1 bg-muted rounded-full h-2">
          <div 
            className="h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
            style={{ width: `${(completedCount / goalsState.goals.length) * 100}%` }}
          />
        </div>
        <span className="text-sm font-medium">
          {completedCount}/{goalsState.goals.length}
        </span>
      </div>

      {/* Goals List */}
      <div className="space-y-3 max-h-[400px] overflow-y-auto">
        {goalsState.goals.map((goal) => (
          <GoalItem
            key={goal.id}
            goal={goal}
          />
        ))}
      </div>

      {/* Completion Bonus */}
      {goalsState.completedAllBonus && (
        <div className="p-4 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-lg text-center">
          <p className="font-semibold">All Goals Complete! 🎉</p>
          <p className="text-sm text-muted-foreground">
            +{bonusXP} Bonus XP • Total: {totalXP + bonusXP} XP
          </p>
        </div>
      )}
    </div>
  );
}

function GoalItem({ 
  goal
}: { 
  goal: DailyGoal;
}) {
  const percentage = (goal.current / goal.target) * 100;
  
  return (
    <div className={cn(
      "p-3 rounded-lg transition-all",
      goal.completed ? "bg-green-500/10 border border-green-500/20" : "bg-muted"
    )}>
      <div className="flex items-start gap-3">
        <span className="text-2xl">{goal.icon}</span>
        
        <div className="flex-1 space-y-2">
          <div className="flex justify-between items-start">
            <div>
              <p className={cn(
                "font-medium",
                goal.completed && "text-green-600 dark:text-green-400"
              )}>
                {goal.title}
              </p>
              <p className="text-xs text-muted-foreground">{goal.description}</p>
            </div>
            <span className={cn(
              "text-xs px-2 py-1 rounded font-medium",
              goal.completed 
                ? "bg-green-600 text-white" 
                : "bg-muted-foreground/20 text-muted-foreground"
            )}>
              +{goal.xpReward} XP
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-background rounded-full h-2">
              <div 
                className={cn(
                  "h-2 rounded-full transition-all duration-300",
                  goal.completed ? "bg-green-500" : "bg-primary"
                )}
                style={{ width: `${Math.min(percentage, 100)}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground">
              {goal.type === 'accuracy' ? `${goal.current}%` : `${goal.current}/${goal.target}`}
            </span>
          </div>
        </div>
        
        {goal.completed && (
          <svg className="w-5 h-5 text-green-500 animate-bounce-in" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        )}
      </div>
    </div>
  );
}

// Hook to integrate with quiz/practice sessions
export function useDailyGoals() {
  const updateQuizGoal = () => {
    // This would be called from quiz completion
    const goalsState = localStorage.getItem('dailyGoals_v2');
    if (goalsState) {
      const parsed = JSON.parse(goalsState);
      const quizGoal = parsed.goals.find((g: DailyGoal) => g.type === 'quiz');
      if (quizGoal && !quizGoal.completed) {
        quizGoal.current = Math.min(quizGoal.current + 1, quizGoal.target);
        quizGoal.completed = quizGoal.current >= quizGoal.target;
        localStorage.setItem('dailyGoals_v2', JSON.stringify(parsed));
      }
    }
  };
  
  const updateStreakGoal = (streak: number) => {
    const goalsState = localStorage.getItem('dailyGoals_v2');
    if (goalsState) {
      const parsed = JSON.parse(goalsState);
      const streakGoal = parsed.goals.find((g: DailyGoal) => g.type === 'streak');
      if (streakGoal && !streakGoal.completed) {
        streakGoal.current = Math.max(streakGoal.current, streak);
        streakGoal.completed = streakGoal.current >= streakGoal.target;
        localStorage.setItem('dailyGoals_v2', JSON.stringify(parsed));
      }
    }
  };
  
  return {
    updateQuizGoal,
    updateStreakGoal,
  };
}