import { Metadata } from 'next';
import { config } from '@/lib/config/env';

export const siteConfig = {
  name: 'natophonetic.com',
  title: 'natophonetic.com | NATO Phonetic Alphabet (A to Z) | Pronunciation & Chart',
  description: 'Learn the NATO phonetic alphabet on natophonetic.com: A–Z list, pronunciation guide, printable PDF, and interactive translator. Perfect for pilots, military, telecoms, and radio enthusiasts.',
  url: config.siteUrl,
  author: 'Phonetic Alphabet Learning Platform',
  keywords: [
    'nato phonetic',
    'phonetic alphabet',
    'military alphabet',
    'nato alphabet',
    'nato phonetic alphabet',
    'nato phonetic alphabet code',
    'nato phonetic alphabet list',
    'nato phonetic alphabet pdf',
    'nato phonetic alphabet pronunciation',
    'how to use nato phonetic alphabet',
    'british phonetic alphabet',
    'police phonetic alphabet',
    'international phonetic alphabet',
    'phonetic alphabet chart',
    'alpha bravo charlie',
    'aviation alphabet',
    'radio alphabet',
    'ICAO alphabet',
    'spelling alphabet',
    'phonetic converter',
    'military radio codes'
  ],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'NATO Phonetic Alphabet',
    images: [
      {
        url: '/api/og',
        width: 1200,
        height: 630,
        alt: 'NATO Phonetic Alphabet - Interactive Learning Tool'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    creator: '@phoneticalphabet'
  }
};

export function generateMetadata(
  title?: string,
  description?: string,
  path?: string
): Metadata {
  const pageTitle = title 
    ? `${title} | ${siteConfig.name}`
    : siteConfig.title;
    
  const pageDescription = description || siteConfig.description;
  const url = `${siteConfig.url}${path || ''}`;

  return {
    metadataBase: new URL(siteConfig.url),
    title: pageTitle,
    description: pageDescription,
    keywords: siteConfig.keywords,
    authors: [{ name: siteConfig.author }],
    creator: siteConfig.author,
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      url,
      siteName: siteConfig.openGraph.siteName,
      images: siteConfig.openGraph.images,
      locale: siteConfig.openGraph.locale,
      type: siteConfig.openGraph.type as 'website',
    },
    twitter: {
      card: siteConfig.twitter.card as 'summary_large_image',
      title: pageTitle,
      description: pageDescription,
      creator: siteConfig.twitter.creator,
      images: siteConfig.openGraph.images,
    },
    alternates: {
      canonical: url,
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
  };
}

// Structured data for the main page
export const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: siteConfig.name,
  description: siteConfig.description,
  url: siteConfig.url,
  applicationCategory: 'EducationalApplication',
  operatingSystem: 'All',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD'
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    ratingCount: '2453'
  },
  featureList: [
    'Interactive NATO alphabet grid',
    'Text to phonetic converter',
    'Audio pronunciation',
    'Printable charts',
    'Learning mode with quizzes'
  ]
};