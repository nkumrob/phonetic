'use client';

import { useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui';
import { env } from '@/lib/config/env';
import { logger } from '@/lib/utils/logger';

interface ToolErrorFallbackProps {
  toolName: string;
  contextId: string;
  error: Error & { digest?: string };
  reset: () => void;
}

/** Shared error UI used by each AI tool route's error.tsx. */
export function ToolErrorFallback({ toolName, contextId, error, reset }: ToolErrorFallbackProps) {
  useEffect(() => {
    logger.error(`${toolName} page error:`, error, {
      context: `tools/${contextId}`,
      metadata: { page: contextId },
    });
  }, [error, toolName, contextId]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-error/10 rounded-full">
          <Sparkles className="w-10 h-10 text-error" />
        </div>

        <h1 className="text-4xl sm:text-5xl font-black tracking-headlines">{toolName} Error</h1>

        <p className="text-lg text-secondary">
          This tool couldn&apos;t be loaded. This might be a temporary issue.
        </p>

        {env.isDevelopment() && error.message && (
          <div className="bg-muted p-4 rounded-xl text-left">
            <p className="text-sm font-mono text-secondary">{error.message}</p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={() => reset()}>Try Again</Button>
          <Button variant="secondary" onClick={() => (window.location.href = '/tools')}>
            Back to Tools
          </Button>
        </div>
      </div>
    </div>
  );
}
