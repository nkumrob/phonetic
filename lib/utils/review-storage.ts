/**
 * Review Storage Utilities
 * Handles storing and retrieving reviews from localStorage
 */

import { Review, ReviewFormData, ReviewStats } from '@/lib/types/review';

const REVIEWS_STORAGE_KEY = 'phonetics_reviews';

/**
 * Generate a unique ID for a review
 */
function generateId(): string {
  return `review_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get all reviews from storage
 */
export function getReviews(): Review[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(REVIEWS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading reviews:', error);
    return [];
  }
}

/**
 * Get approved reviews only
 */
export function getApprovedReviews(): Review[] {
  return getReviews().filter(review => review.approved !== false);
}

/**
 * Save a new review
 */
export function saveReview(formData: ReviewFormData): Review {
  const newReview: Review = {
    id: generateId(),
    ...formData,
    date: new Date().toISOString(),
    approved: false, // Requires moderation
    helpful: 0,
  };

  const reviews = getReviews();
  reviews.unshift(newReview); // Add to beginning
  
  try {
    localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(reviews));
    return newReview;
  } catch (error) {
    console.error('Error saving review:', error);
    throw new Error('Failed to save review');
  }
}

/**
 * Calculate review statistics
 */
export function calculateReviewStats(reviews: Review[]): ReviewStats {
  const approvedReviews = reviews.filter(r => r.approved !== false);
  
  const stats: ReviewStats = {
    totalReviews: approvedReviews.length,
    averageRating: 0,
    ratingDistribution: {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    },
  };

  if (approvedReviews.length === 0) return stats;

  // Calculate distribution and average
  let totalRating = 0;
  approvedReviews.forEach(review => {
    const rating = Math.round(review.rating) as 1 | 2 | 3 | 4 | 5;
    stats.ratingDistribution[rating]++;
    totalRating += review.rating;
  });

  stats.averageRating = totalRating / approvedReviews.length;

  return stats;
}

/**
 * Approve a review (for admin use)
 */
export function approveReview(reviewId: string): void {
  const reviews = getReviews();
  const review = reviews.find(r => r.id === reviewId);
  
  if (review) {
    review.approved = true;
    localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(reviews));
  }
}

/**
 * Delete a review (for admin use)
 */
export function deleteReview(reviewId: string): void {
  const reviews = getReviews();
  const filtered = reviews.filter(r => r.id !== reviewId);
  localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(filtered));
}

/**
 * Get sample/featured reviews for homepage
 */
export function getFeaturedReviews(limit: number = 3): Review[] {
  const approved = getApprovedReviews();
  // Sort by rating (highest first) and date (newest first)
  return approved
    .sort((a, b) => {
      if (b.rating !== a.rating) return b.rating - a.rating;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    })
    .slice(0, limit);
}

