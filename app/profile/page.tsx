'use client';

import { Metadata } from 'next';
import { useSession } from '@/lib/contexts/session-context';
import { Achievements } from '@/components/profile/achievements';
import { ProfileCustomization } from '@/components/profile/profile-customization';
import { Button } from '@/components/ui';
import { ErrorBoundary } from '@/components/error-boundary';
import { useState, useEffect } from 'react';

export default function ProfilePage() {
  const { session, resetSession } = useSession();
  const [userName, setUserName] = useState('');
  const [userAvatar, setUserAvatar] = useState('🧑‍✈️');

  // Load user profile data
  useEffect(() => {
    const savedName = localStorage.getItem('userName') || '';
    const savedAvatar = localStorage.getItem('userAvatar') || '🧑‍✈️';
    setUserName(savedName);
    setUserAvatar(savedAvatar);
  }, []);

  return (
    <div className="space-y-16">
      {/* Profile Header */}
      <section className="text-center py-8">
        <div className="mb-6">
          <div className="text-6xl mb-3">{userAvatar}</div>
          <h1 className="text-4xl md:text-5xl font-bold mb-2">
            {userName || 'Your Profile'}
          </h1>
          {!userName && (
            <p className="text-muted-foreground">Set your name in the settings below</p>
          )}
        </div>
        <div className="flex justify-center gap-8 text-center">
          <div>
            <p className="text-3xl font-bold text-primary">{session.userProgress.level}</p>
            <p className="text-sm text-muted-foreground">Level</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-primary">{session.userProgress.experience}</p>
            <p className="text-sm text-muted-foreground">XP</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-primary">{session.userProgress.consecutiveDays}</p>
            <p className="text-sm text-muted-foreground">Daily Streak</p>
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="grid md:grid-cols-4 gap-6">
        <div className="card p-6 text-center">
          <p className="text-2xl font-bold">{session.userProgress.totalQuizzesTaken}</p>
          <p className="text-sm text-muted-foreground">Quizzes Taken</p>
        </div>
        <div className="card p-6 text-center">
          <p className="text-2xl font-bold text-green-600">{session.userProgress.totalCorrectAnswers}</p>
          <p className="text-sm text-muted-foreground">Correct Answers</p>
        </div>
        <div className="card p-6 text-center">
          <p className="text-2xl font-bold">
            {session.userProgress.totalCorrectAnswers > 0 
              ? Math.round((session.userProgress.totalCorrectAnswers / 
                (session.userProgress.totalCorrectAnswers + session.userProgress.totalIncorrectAnswers)) * 100)
              : 0}%
          </p>
          <p className="text-sm text-muted-foreground">Accuracy</p>
        </div>
        <div className="card p-6 text-center">
          <p className="text-2xl font-bold text-primary">{session.userProgress.bestStreak}</p>
          <p className="text-sm text-muted-foreground">Best Streak</p>
        </div>
      </section>

      {/* Profile Customization */}
      <section>
        <ErrorBoundary>
          <ProfileCustomization />
        </ErrorBoundary>
      </section>

      {/* Achievements Section */}
      <section>
        <ErrorBoundary>
          <Achievements />
        </ErrorBoundary>
      </section>

      {/* Reset Progress */}
      <section className="text-center py-8">
        <p className="text-sm text-muted-foreground mb-4">
          Want to start fresh? Reset all your progress and achievements.
        </p>
        <Button 
          variant="secondary" 
          onClick={() => {
            if (confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
              resetSession();
              window.location.reload();
            }
          }}
        >
          Reset All Progress
        </Button>
      </section>
    </div>
  );
}