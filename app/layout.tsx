import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import './globals.css';
import './premium-design.css';
import { SimpleHeader } from '@/components/layout/simple-header';
import { Footer } from '@/components/layout/footer';
import { generateMetadata, structuredData } from '@/lib/seo/metadata';
import { faqSchema, organizationSchema } from '@/lib/seo/faq-schema';
import { SimpleAppProvider } from '@/lib/contexts/simple-app-context';
import { AnalyticsProvider } from '@/components/analytics/analytics-provider';
import { Analytics } from '@vercel/analytics/next';
import { WebVitalsReporter } from '@/components/analytics/web-vitals';
import { inter, jetbrainsMono } from './fonts';
import { RouteSpeechHandler } from '@/components/speech/route-speech-handler';
import { PageViewTracker } from '@/components/analytics/page-view-tracker';
import { ProgressSyncProvider } from '@/components/analytics/progress-sync-provider';

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
  // GA renders only when explicitly configured — hardcoding the tag previously
  // ignored these flags and half-collided with our CSP (see next.config.ts).
  const gaId =
    process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true' ? process.env.NEXT_PUBLIC_GA_ID : undefined;
  
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
        {gaId && <link rel="dns-prefetch" href="https://www.googletagmanager.com" />}
      </head>
      <body className={`${inter.variable} ${jetbrainsMono.variable} antialiased font-sans`} suppressHydrationWarning>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const theme = localStorage.getItem('theme') || 'light';
                if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              })();
            `,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }}
        />
        <AnalyticsProvider>
          <PageViewTracker />
          <ProgressSyncProvider />
          <SimpleAppProvider>
            <RouteSpeechHandler />
            <div className="min-h-screen bg-background flex flex-col">
              <SimpleHeader />
              <main className="flex-1">
                {children}
              </main>
              <Footer />
            </div>
          </SimpleAppProvider>
        </AnalyticsProvider>
        <Analytics />
        <WebVitalsReporter />

        {/* Google Analytics — only when NEXT_PUBLIC_GA_ID is set and analytics enabled */}
        {gaId && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaId}');
              `}
            </Script>
          </>
        )}

      </body>
    </html>
  );
}