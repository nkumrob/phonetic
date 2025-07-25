import type { Metadata, Viewport } from 'next';
import './globals.css';
import './premium-design.css';
import { SimpleHeader } from '@/components/layout/simple-header';
import { generateMetadata, structuredData } from '@/lib/seo/metadata';
import { faqSchema, organizationSchema } from '@/lib/seo/faq-schema';
import { SimpleAppProvider } from '@/lib/contexts/simple-app-context';
import { AnalyticsProvider } from '@/components/analytics/analytics-provider';
import { Analytics } from '@vercel/analytics/next';
import { inter } from './fonts';

export const metadata: Metadata = generateMetadata();

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const schemas = [structuredData, faqSchema, organizationSchema];
  
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#3b82f6" />
        {process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION && (
          <meta name="google-site-verification" content={process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION} />
        )}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        {/* Google Analytics */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-J1E4GKFXVT"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-J1E4GKFXVT');
            `,
          }}
        />
      </head>
      <body className={`${inter.variable} antialiased font-sans`} suppressHydrationWarning>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }}
        />
        <AnalyticsProvider>
          <SimpleAppProvider>
            <div className="min-h-screen bg-background">
              <SimpleHeader />
              <main className="flex-1">
                {children}
              </main>
            </div>
          </SimpleAppProvider>
        </AnalyticsProvider>
        <Analytics />
      </body>
    </html>
  );
}