import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/layout/header';

export const metadata: Metadata = {
  title: 'NATO Phonetic Alphabet - Learn & Convert',
  description: 'Master the NATO phonetic alphabet with our interactive learning tools, text converter, and audio pronunciation guide.',
  keywords: 'NATO phonetic alphabet, phonetic converter, alpha bravo charlie, military alphabet, aviation alphabet',
  authors: [{ name: 'NATO Phonetic' }],
  creator: 'NATO Phonetic',
  publisher: 'NATO Phonetic',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://phoneticalphabet.com',
    title: 'NATO Phonetic Alphabet - Learn & Convert',
    description: 'Master the NATO phonetic alphabet with our interactive learning tools',
    siteName: 'NATO Phonetic',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NATO Phonetic Alphabet - Learn & Convert',
    description: 'Master the NATO phonetic alphabet with our interactive learning tools',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased font-sans">
        <div className="min-h-screen bg-background">
          <Header />
          <main className="container mx-auto px-4 py-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}