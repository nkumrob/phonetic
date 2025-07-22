import type { Metadata } from 'next';
import './globals.css';
import './premium-design.css';
import { Header } from '@/components/layout/header';
import { generateMetadata, structuredData } from '@/lib/seo/metadata';
import { SessionProvider } from '@/lib/contexts/session-context';
import { UnifiedStateProvider } from '@/lib/contexts/unified-state-context';
import { SaveIndicator } from '@/components/ui/save-indicator';

export const metadata: Metadata = generateMetadata();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased font-sans" suppressHydrationWarning>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <UnifiedStateProvider>
          <SessionProvider>
            <div className="min-h-screen bg-background">
              <Header />
              <main className="container mx-auto px-4 py-8">
                {children}
              </main>
              <SaveIndicator />
            </div>
          </SessionProvider>
        </UnifiedStateProvider>
      </body>
    </html>
  );
}