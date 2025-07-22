'use client';

import React from 'react';
import { useSession } from '@/lib/contexts/session-context';
import { cn } from '@/lib/utils/cn';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  requiredProgress: number;
  category: 'quiz' | 'learning' | 'streak' | 'special';
}

const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'firstQuiz',
    name: 'First Steps',
    description: 'Complete your first quiz',
    icon: '🎯',
    requiredProgress: 100,
    category: 'quiz'
  },
  {
    id: 'tenQuizzes',
    name: 'Quiz Enthusiast',
    description: 'Complete 10 quizzes',
    icon: '📚',
    requiredProgress: 100,
    category: 'quiz'
  },
  {
    id: 'hundredQuizzes',
    name: 'Quiz Master',
    description: 'Complete 100 quizzes',
    icon: '🏆',
    requiredProgress: 100,
    category: 'quiz'
  },
  {
    id: 'perfectScore',
    name: 'Perfectionist',
    description: 'Get a perfect score in any quiz',
    icon: '💯',
    requiredProgress: 100,
    category: 'quiz'
  },
  {
    id: 'streakMaster',
    name: 'Streak Master',
    description: 'Achieve a 20-answer streak',
    icon: '🔥',
    requiredProgress: 100,
    category: 'streak'
  },
  {
    id: 'speedDemon',
    name: 'Speed Demon',
    description: 'Complete a quiz with average time under 3 seconds per question',
    icon: '⚡',
    requiredProgress: 100,
    category: 'special'
  },
  {
    id: 'alphabetMaster',
    name: 'Alphabet Master',
    description: 'Master all 26 letters in flashcards',
    icon: '🎓',
    requiredProgress: 100,
    category: 'learning'
  },
  {
    id: 'dailyPlayer',
    name: 'Dedicated Learner',
    description: 'Play for 7 consecutive days',
    icon: '📅',
    requiredProgress: 100,
    category: 'streak'
  },
  {
    id: 'levelTen',
    name: 'Elite Status',
    description: 'Reach level 10',
    icon: '🌟',
    requiredProgress: 100,
    category: 'special'
  }
];

export function Achievements() {
  const { session, getAchievementProgress } = useSession();
  const progress = getAchievementProgress();

  const categorizedAchievements = {
    quiz: ACHIEVEMENTS.filter(a => a.category === 'quiz'),
    learning: ACHIEVEMENTS.filter(a => a.category === 'learning'),
    streak: ACHIEVEMENTS.filter(a => a.category === 'streak'),
    special: ACHIEVEMENTS.filter(a => a.category === 'special')
  };

  const earnedCount = Object.values(progress).filter(p => p >= 100).length;
  const totalCount = ACHIEVEMENTS.length;
  const overallProgress = Math.round((earnedCount / totalCount) * 100);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold">Your Achievements</h2>
        <div className="flex items-center justify-center gap-8">
          <div className="text-center px-4">
            <p className="text-5xl font-bold text-primary">{earnedCount}</p>
            <p className="text-sm text-muted-foreground mt-1">Earned</p>
          </div>
          <div className="text-center text-3xl font-light text-muted-foreground">/</div>
          <div className="text-center px-4">
            <p className="text-5xl font-bold">{totalCount}</p>
            <p className="text-sm text-muted-foreground mt-1">Total</p>
          </div>
        </div>
        <p className="text-2xl font-semibold text-primary">{overallProgress}% Complete</p>
      </div>

      {/* Overall Progress Bar */}
      <div className="bg-muted rounded-full h-4 overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-primary to-blue-600 transition-all duration-500"
          style={{ width: `${overallProgress}%` }}
        />
      </div>

      {/* Achievement Categories */}
      {Object.entries(categorizedAchievements).map(([category, achievements]) => (
        <div key={category} className="space-y-4">
          <h3 className="text-xl font-semibold capitalize">
            {category} Achievements
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {achievements.map(achievement => {
              const currentProgress = progress[achievement.id] || 0;
              const isEarned = currentProgress >= 100;
              
              return (
                <div
                  key={achievement.id}
                  className={cn(
                    "relative p-6 rounded-lg border-2 transition-all",
                    isEarned 
                      ? "border-primary bg-primary/5 shadow-lg" 
                      : "border-border bg-muted/30"
                  )}
                >
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      "text-4xl",
                      !isEarned && "opacity-30 grayscale"
                    )}>
                      {achievement.icon}
                    </div>
                    <div className="flex-1 space-y-2">
                      <h4 className={cn(
                        "font-semibold",
                        !isEarned && "text-muted-foreground"
                      )}>
                        {achievement.name}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {achievement.description}
                      </p>
                      
                      {/* Progress Bar */}
                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                          <span>Progress</span>
                          <span>{Math.round(currentProgress)}%</span>
                        </div>
                        <div className="bg-muted rounded-full h-2 overflow-hidden">
                          <div 
                            className={cn(
                              "h-full transition-all duration-500",
                              isEarned ? "bg-primary" : "bg-primary/50"
                            )}
                            style={{ width: `${currentProgress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Earned Badge */}
                  {isEarned && (
                    <div className="absolute top-2 right-2">
                      <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full font-medium">
                        Earned!
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Motivational Message */}
      <div className="text-center p-8 bg-muted/50 rounded-lg">
        <p className="text-lg font-medium mb-2">
          {earnedCount === 0 
            ? "Start your journey!"
            : earnedCount < totalCount / 2
            ? "Keep going! You're doing great!"
            : earnedCount < totalCount
            ? "Almost there! You're so close to earning all achievements!"
            : "Congratulations! You've earned all achievements! 🎉"
          }
        </p>
        <p className="text-sm text-muted-foreground">
          Continue practicing to unlock more achievements and improve your skills.
        </p>
      </div>
    </div>
  );
}