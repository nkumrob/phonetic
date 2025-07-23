'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui';
import { logger } from '@/lib/utils/logger';
import { env } from '@/lib/config/env';


export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    logger.error('Error:', error);
  }, [error]);

  return (
    <div className="min-h-[50vh] flex items-center justify-center px-4">
      <div className="text-center space-y-6 max-w-md">
        {/* Error in phonetic */}
        <div className="space-y-2">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-headlines text-error">Error</h1>
          <p className="text-lg sm:text-xl text-secondary">
            Echo - Romeo - Romeo - Oscar - Romeo
          </p>
        </div>
        
        {/* Message */}
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black tracking-largeText">
            Something went wrong!
          </h2>
          <p className="text-secondary">
            An unexpected error occurred. Please try again or contact support if the problem persists.
          </p>
        </div>
        
        {/* Error details (only in development) */}
        {env.isDevelopment() && error.message && (
          <div className="bg-warmNeutral-100 dark:bg-warmNeutral-900 p-4 rounded-xl border-2 border-border text-left">
            <p className="text-sm font-mono text-secondary">
              {error.message}
            </p>
          </div>
        )}
        
        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            size="lg"
            onClick={() => reset()}
          >
            Try Again
          </Button>
          <Button
            variant="secondary"
            size="lg"
            onClick={() => window.location.href = '/'}
          >
            Go Home
          </Button>
        </div>
      </div>
    </div>
  );
}