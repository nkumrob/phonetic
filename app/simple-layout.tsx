'use client';

import { SimpleHeader } from '@/components/layout/simple-header';
import { SimpleAppProvider } from '@/lib/contexts/simple-app-context';

export function SimpleLayout({ children }: { children: React.ReactNode }) {
  return (
    <SimpleAppProvider>
      <div className="min-h-screen bg-background">
        <SimpleHeader />
        <main className="flex-1">
          {children}
        </main>
      </div>
    </SimpleAppProvider>
  );
}