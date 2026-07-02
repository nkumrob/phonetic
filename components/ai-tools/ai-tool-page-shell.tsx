import type { ReactNode } from 'react';
import { ErrorBoundary } from '@/components/error-boundary';

interface AiToolPageShellProps {
  title: string;
  description: string;
  children: ReactNode;
}

/** Shared server-rendered layout for every AI tool page. */
export function AiToolPageShell({ title, description, children }: AiToolPageShellProps) {
  return (
    <div className="container max-w-3xl mx-auto px-4 py-12 space-y-8">
      <div className="text-center space-y-3">
        <h1 className="text-4xl sm:text-5xl font-black tracking-headlines">{title}</h1>
        <p className="text-lg text-secondary max-w-2xl mx-auto">{description}</p>
      </div>
      <ErrorBoundary>{children}</ErrorBoundary>
    </div>
  );
}
