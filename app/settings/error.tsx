'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui';
import { logger } from '@/lib/utils/logger';

export default function SettingsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logger.error('Settings page error:', error);
  }, [error]);

  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <h1 className="text-4xl font-bold mb-4">Settings Error</h1>
      <p className="text-xl text-muted-foreground mb-8">
        There was a problem loading your settings
      </p>
      <div className="space-y-4 max-w-md mx-auto">
        <p className="text-sm text-muted-foreground">
          This might be due to corrupted local storage data. Try refreshing the page
          or clearing your browser&apos;s site data for this website.
        </p>
        <Button onClick={reset}>Try Again</Button>
      </div>
    </div>
  );
}