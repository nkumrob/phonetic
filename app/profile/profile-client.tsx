'use client';

import { useSimpleAppState } from '@/lib/contexts/simple-app-context';
import { SimpleProfileCustomization } from '@/components/profile/simple-profile-customization';
import { Button } from '@/components/ui';
import { ErrorBoundary } from '@/components/error-boundary';
import { calculateOverallAccuracy } from '@/lib/state/simple-types';

export default function ProfileClient() {
  const { state, resetProgress } = useSimpleAppState();
  const overallAccuracy = calculateOverallAccuracy(state);
  
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
          <h2 className="text-3xl font-bold mb-6">Your Progress</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-6 bg-warmNeutral-50 dark:bg-warmNeutral-900 rounded-xl border-2 border-border">
              <div className="text-4xl font-black mb-2">{state.progress.quizHistory.length}</div>
              <div className="text-secondary">Quizzes Completed</div>
            </div>
            
            <div className="p-6 bg-warmNeutral-50 dark:bg-warmNeutral-900 rounded-xl border-2 border-border">
              <div className="text-4xl font-black mb-2">{overallAccuracy}%</div>
              <div className="text-secondary">Overall Accuracy</div>
            </div>
            
            <div className="p-6 bg-warmNeutral-50 dark:bg-warmNeutral-900 rounded-xl border-2 border-border">
              <div className="text-4xl font-black mb-2">{state.progress.flashcardProgress.length}</div>
              <div className="text-secondary">Letters Reviewed</div>
            </div>
          </div>
        </section>

        {/* Recent Quiz History */}
        {state.progress.quizHistory.length > 0 && (
          <section>
            <h2 className="text-3xl font-bold mb-6">Recent Quizzes</h2>
            <div className="space-y-3">
              {state.progress.quizHistory.slice(-5).reverse().map((quiz, index) => (
                <div 
                  key={index}
                  className="p-4 bg-warmNeutral-50 dark:bg-warmNeutral-900 rounded-lg border border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                >
                  <div>
                    <div className="font-semibold capitalize">{quiz.mode} Mode</div>
                    <div className="text-sm text-secondary">
                      {new Date(quiz.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-bold">{quiz.score}/{quiz.totalQuestions}</div>
                      <div className="text-sm text-secondary">
                        {Math.round((quiz.score / quiz.totalQuestions) * 100)}% accuracy
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      quiz.passed 
                        ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100'
                        : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100'
                    }`}>
                      {quiz.passed ? 'Passed' : 'Failed'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Flashcard Progress */}
        {state.progress.flashcardProgress.length > 0 && (
          <section>
            <h2 className="text-3xl font-bold mb-6">Flashcard Progress</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {state.progress.flashcardProgress.map((item) => (
                <div 
                  key={item.letter}
                  className="p-4 bg-warmNeutral-50 dark:bg-warmNeutral-900 rounded-lg border border-border text-center"
                >
                  <div className="text-2xl font-bold mb-1">{item.letter}</div>
                  <div className="text-xs text-secondary">
                    {item.reviewCount} {item.reviewCount === 1 ? 'review' : 'reviews'}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Profile Customization */}
        <section>
          <h2 className="text-3xl font-bold mb-6">Customize Profile</h2>
          <ErrorBoundary>
            <SimpleProfileCustomization />
          </ErrorBoundary>
        </section>

        {/* Reset Progress */}
        <section className="pt-8 border-t border-border">
          <h2 className="text-3xl font-bold mb-4 text-red-600 dark:text-red-400">Danger Zone</h2>
          <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-xl border-2 border-red-200 dark:border-red-800">
            <h3 className="text-xl font-semibold mb-2">Reset All Progress</h3>
            <p className="text-secondary mb-4">
              This will permanently delete all your quiz history, flashcard progress, and statistics. 
              This action cannot be undone.
            </p>
            <Button
              onClick={() => {
                if (window.confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
                  resetProgress();
                }
              }}
              variant="secondary"
              className="bg-red-600 hover:bg-red-700 text-white border-red-700"
            >
              Reset All Progress
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}

