'use client';

import dynamic from 'next/dynamic';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

// Loading component for lazy-loaded components
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-[200px]">
    <LoadingSpinner />
  </div>
);

// Practice components
export const LazySimplePracticeHub = dynamic(
  () => import('@/components/practice/simple-practice-hub').then(mod => mod.SimplePracticeHub),
  {
    loading: LoadingFallback,
    ssr: true, // Enable SSR for SEO
  }
);

export const LazySimpleQuiz = dynamic(
  () => import('@/components/practice/simple-quiz').then(mod => mod.SimpleQuiz),
  {
    loading: LoadingFallback,
    ssr: true,
  }
);

// Learning components
export const LazySimpleFlashcards = dynamic(
  () => import('@/components/learning/simple-flashcards').then(mod => mod.SimpleFlashcards),
  {
    loading: LoadingFallback,
    ssr: true,
  }
);

export const LazyAlphabetGrid = dynamic(
  () => import('@/components/phonetic/alphabet-grid').then(mod => mod.AlphabetGrid),
  {
    loading: LoadingFallback,
    ssr: true,
  }
);

export const LazyAudioAlphabetTable = dynamic(
  () => import('@/components/phonetic/audio-alphabet-table').then(mod => mod.AudioAlphabetTable),
  {
    loading: LoadingFallback,
    ssr: true,
  }
);

// Tools components
export const LazyTextConverter = dynamic(
  () => import('@/components/phonetic/text-converter-wrapper').then(mod => mod.TextConverterWrapper),
  {
    loading: LoadingFallback,
    ssr: true,
  }
);

export const LazyReverseLookup = dynamic(
  () => import('@/components/phonetic/reverse-lookup').then(mod => mod.ReverseLookup),
  {
    loading: LoadingFallback,
    ssr: true,
  }
);

export const LazyDownloadChart = dynamic(
  () => import('@/components/phonetic/download-chart').then(mod => mod.DownloadChart),
  {
    loading: LoadingFallback,
    ssr: false, // Client-only component (uses PDF library)
  }
);

// Profile components
export const LazySimpleProfileCustomization = dynamic(
  () => import('@/components/profile/simple-profile-customization').then(mod => mod.SimpleProfileCustomization),
  {
    loading: LoadingFallback,
    ssr: false, // Client-only component
  }
);