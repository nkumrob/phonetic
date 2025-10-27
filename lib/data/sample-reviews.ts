/**
 * Sample Reviews Data
 * Initial reviews to populate the system
 */

import { Review } from '@/lib/types/review';

export const sampleReviews: Review[] = [
  {
    id: 'sample_1',
    name: 'Sarah Johnson',
    rating: 5,
    title: 'Best NATO Phonetic Alphabet Trainer!',
    comment: 'This platform made learning the NATO phonetic alphabet so much easier! The interactive quizzes and audio features are fantastic. I went from knowing nothing to confidently using it in my aviation communications in just two weeks.',
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
    verified: true,
    approved: true,
    helpful: 15,
    location: 'United States',
  },
  {
    id: 'sample_2',
    name: 'Michael Chen',
    rating: 5,
    title: 'Perfect for Amateur Radio Operators',
    comment: 'As a ham radio operator, I needed to master the phonetic alphabet quickly. This tool is incredibly well-designed with spaced repetition that actually works. The progress tracking keeps me motivated!',
    date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days ago
    verified: true,
    approved: true,
    helpful: 12,
    location: 'Canada',
  },
  {
    id: 'sample_3',
    name: 'Emma Rodriguez',
    rating: 4,
    title: 'Great Learning Tool',
    comment: 'Really helpful for my customer service job where I need to spell things clearly over the phone. The flashcards are my favorite feature. Would love to see more practice modes in the future!',
    date: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(), // 21 days ago
    verified: false,
    approved: true,
    helpful: 8,
    location: 'United Kingdom',
  },
  {
    id: 'sample_4',
    name: 'David Thompson',
    rating: 5,
    title: 'Excellent for Military Training',
    comment: 'Used this to prepare for military communications training. The adaptive quiz system is brilliant - it focuses on the letters I struggle with. Passed my test with flying colors!',
    date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
    verified: true,
    approved: true,
    helpful: 20,
    location: 'Australia',
  },
  {
    id: 'sample_5',
    name: 'Lisa Anderson',
    rating: 5,
    title: 'Clean Interface, Effective Learning',
    comment: 'The design is beautiful and the learning experience is smooth. I appreciate that it works offline and saves my progress. The audio pronunciation is crystal clear.',
    date: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(), // 45 days ago
    verified: true,
    approved: true,
    helpful: 10,
    location: 'Germany',
  },
  {
    id: 'sample_6',
    name: 'James Wilson',
    rating: 4,
    title: 'Very Useful Tool',
    comment: 'Great for learning the phonetic alphabet. The quiz modes are challenging and help reinforce memory. Would be nice to have a mobile app version too.',
    date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days ago
    verified: false,
    approved: true,
    helpful: 6,
    location: 'United States',
  },
];

/**
 * Initialize sample reviews in localStorage if empty
 */
export function initializeSampleReviews(): void {
  if (typeof window === 'undefined') return;
  
  const REVIEWS_STORAGE_KEY = 'phonetics_reviews';
  const existing = localStorage.getItem(REVIEWS_STORAGE_KEY);
  
  if (!existing) {
    localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(sampleReviews));
  }
}

