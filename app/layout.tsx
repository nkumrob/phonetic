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
import { inter } from './fonts';
import { RouteSpeechHandler } from '@/components/speech/route-speech-handler';

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
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6386864042923808"
     crossOrigin="anonymous"></script>
      </head>
      <body className={`${inter.variable} antialiased font-sans`} suppressHydrationWarning>
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

        {/* Google Analytics - Using next/script for proper optimization */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-J1E4GKFXVT"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-J1E4GKFXVT');
          `}
        </Script>

      </body>
    </html>
  );
}