'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui';
import { logger } from '@/lib/utils/logger';
import { env } from '@/lib/config/env';
import { BookOpen } from 'lucide-react';

export default function LearnError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error with context
    logger.error('Learn page error:', error, { 
      context: 'learn',
      metadata: { page: 'learn' }
    });
  }, [error]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-error/10 rounded-full">
          <BookOpen className="w-10 h-10 text-error" />
        </div>
        
        <h1 className="text-4xl sm:text-5xl font-black tracking-headlines">
          Learning Error
        </h1>
        
        <p className="text-lg text-secondary">
          We couldn&apos;t load the learning materials. Please try refreshing the page.
        </p>
        
        {env.isDevelopment() && error.message && (
          <div className="bg-muted p-4 rounded-xl text-left">
            <p className="text-sm font-mono text-secondary">
              {error.message}
            </p>
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={() => reset()}>
            Refresh Page
          </Button>
          <Button
            variant="secondary"
            onClick={() => window.location.href = '/'}
          >
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
}