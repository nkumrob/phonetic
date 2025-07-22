'use client';

import { useSimpleAppState } from '@/lib/contexts/simple-app-context';
import { SimpleProfileCustomization } from '@/components/profile/simple-profile-customization';
import { Button } from '@/components/ui';
import { ErrorBoundary } from '@/components/error-boundary';
import { calculateOverallAccuracy } from '@/lib/state/simple-types';

function ProfileContent() {
  const { state, resetProgress } = useSimpleAppState();
  const overallAccuracy = calculateOverallAccuracy(state);
  const lastQuiz = state.progress.quizHistory[state.progress.quizHistory.length - 1];
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-16">
        {/* Profile Header - Mobile Optimized */}
        <section className="text-center">
          <div className="mb-6">
            <div className="text-6xl mb-3">{state.user.avatar}</div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-headlines mb-2">
              {state.user.name || 'Your Profile'}
            </h1>
            {!state.user.name && (
              <p className="text-secondary">Set your name in the settings below</p>
            )}
          </div>
        </section>

        {/* Statistics - Mobile Responsive Grid */}
        <section>
          <h2 className="text-3xl sm:text-4xl font-black tracking-largeText mb-6">Your Progress</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            <div className="bg-background border-2 border-border rounded-xl p-4 sm:p-6 text-center hover:shadow-md transition-all duration-200">
              <p className="text-2xl sm:text-3xl font-black text-coolBlue-500">{state.progress.totalQuizzesTaken}</p>
              <p className="text-sm text-secondary">Quizzes Taken</p>
            </div>
            <div className="bg-background border-2 border-border rounded-xl p-4 sm:p-6 text-center hover:shadow-md transition-all duration-200">
              <p className="text-2xl sm:text-3xl font-black text-success">{state.progress.totalCorrectAnswers}</p>
              <p className="text-sm text-secondary">Correct Answers</p>
            </div>
            <div className="bg-background border-2 border-border rounded-xl p-4 sm:p-6 text-center hover:shadow-md transition-all duration-200">
              <p className="text-2xl sm:text-3xl font-black text-warmAmber-500">{overallAccuracy}%</p>
              <p className="text-sm text-secondary">Overall Accuracy</p>
            </div>
            <div className="bg-background border-2 border-border rounded-xl p-4 sm:p-6 text-center hover:shadow-md transition-all duration-200">
              <p className="text-2xl sm:text-3xl font-black text-coolBlue-500">
                {Object.keys(state.progress.flashcardReviews).length}/26
              </p>
              <p className="text-sm text-secondary">Letters Reviewed</p>
            </div>
          </div>
        </section>

        {/* Recent Activity */}
        {state.progress.quizHistory.length > 0 && (
          <section>
            <h2 className="text-3xl sm:text-4xl font-black tracking-largeText mb-6">Recent Quizzes</h2>
            <div className="space-y-3">
              {state.progress.quizHistory.slice(-5).reverse().map((quiz) => {
                const accuracy = Math.round((quiz.correctAnswers / quiz.totalQuestions) * 100);
                const date = new Date(quiz.date);
                const dateStr = date.toLocaleDateString();
                const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                
                return (
                  <div key={quiz.id} className="bg-background border-2 border-border rounded-xl p-4 flex items-center justify-between hover:shadow-md transition-all duration-200">
                    <div>
                      <p className="font-medium capitalize">{quiz.mode} Mode</p>
                      <p className="text-sm text-secondary">{dateStr} at {timeStr}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">{accuracy}%</p>
                      <p className="text-sm">
                        {quiz.passed ? (
                          <span className="text-success">Passed</span>
                        ) : (
                          <span className="text-error">Failed</span>
                        )}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Letter Performance */}
        {Object.keys(state.progress.letterStats).length > 0 && (
          <section>
            <h2 className="text-3xl sm:text-4xl font-black tracking-largeText mb-6">Letter Performance</h2>
            <div className="grid grid-cols-6 md:grid-cols-13 gap-2">
              {NATO_ALPHABET.map((item) => {
                const stats = state.progress.letterStats[item.letter];
                const accuracy = stats ? Math.round((stats.correct / stats.attempts) * 100) : 0;
                const hasStats = stats && stats.attempts > 0;
                
                return (
                  <div
                    key={item.letter}
                    className={cn(
                      "p-3 rounded text-center text-sm font-medium",
                      !hasStats && "bg-muted text-muted-foreground",
                      hasStats && accuracy >= 80 && "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300",
                      hasStats && accuracy >= 60 && accuracy < 80 && "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300",
                      hasStats && accuracy < 60 && "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                    )}
                  >
                    <div className="font-bold">{item.letter}</div>
                    {hasStats && <div className="text-xs">{accuracy}%</div>}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Profile Customization */}
        <section>
          <ErrorBoundary>
            <SimpleProfileCustomization />
          </ErrorBoundary>
        </section>

        {/* Reset Progress */}
        <section className="text-center">
          <p className="text-sm text-secondary mb-4">
            Want to start fresh? Reset all your progress.
          </p>
          <Button 
            variant="secondary" 
            onClick={resetProgress}
          >
            Reset All Progress
          </Button>
        </section>
      </div>
    </div>
  );
}

// Import NATO_ALPHABET
import { NATO_ALPHABET } from '@/lib/constants/phonetic-alphabet';
import { cn } from '@/lib/utils/cn';

export default function SimpleProfilePage() {
  return <ProfileContent />;
}