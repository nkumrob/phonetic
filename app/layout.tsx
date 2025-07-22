import type { Metadata } from 'next';
import './globals.css';
import './premium-design.css';
import { SimpleHeader } from '@/components/layout/simple-header';
import { generateMetadata, structuredData } from '@/lib/seo/metadata';
import { SimpleAppProvider } from '@/lib/contexts/simple-app-context';

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
        <SimpleAppProvider>
          <div className="min-h-screen bg-background">
            <SimpleHeader />
            <main className="flex-1">
              {children}
            </main>
          </div>
        </SimpleAppProvider>
      </body>
    </html>
  );
}