/**
 * Review Service
 * Handles all review-related API calls
 */

import { Review, ReviewFormData, ReviewStats } from '@/lib/types/review';

/**
 * Fetch all approved reviews
 */
export async function getReviews(options?: {
  rating?: number;
  limit?: number;
  approved?: boolean;
}): Promise<Review[]> {
  try {
    const params = new URLSearchParams();
    
    if (options?.rating) {
      params.append('rating', options.rating.toString());
    }
    if (options?.limit) {
      params.append('limit', options.limit.toString());
    }
    if (options?.approved !== undefined) {
      params.append('approved', options.approved.toString());
    }

    const url = `/api/reviews${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('Failed to fetch reviews');
    }

    const data = await response.json();
    return data.reviews || [];
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return [];
  }
}

/**
 * Get approved reviews only
 */
export async function getApprovedReviews(): Promise<Review[]> {
  return getReviews({ approved: true });
}

/**
 * Submit a new review
 */
export async function submitReview(formData: ReviewFormData): Promise<Review> {
  const response = await fetch('/api/reviews', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(formData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to submit review');
  }

  const data = await response.json();
  return data.review;
}

/**
 * Get review statistics
 */
export async function getReviewStats(): Promise<ReviewStats> {
  try {
    const response = await fetch('/api/reviews/stats');

    if (!response.ok) {
      throw new Error('Failed to fetch statistics');
    }

    const data = await response.json();
    return data.stats;
  } catch (error) {
    console.error('Error fetching review stats:', error);
    return {
      totalReviews: 0,
      averageRating: 0,
      ratingDistribution: {
        5: 0,
        4: 0,
        3: 0,
        2: 0,
        1: 0,
      },
    };
  }
}

/**
 * Get featured reviews for homepage
 */
export async function getFeaturedReviews(limit: number = 3): Promise<Review[]> {
  return getReviews({ approved: true, limit });
}

/**
 * Approve a review (admin function)
 */
export async function approveReview(reviewId: string): Promise<Review> {
  const response = await fetch(`/api/reviews/${reviewId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ approved: true }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to approve review');
  }

  const data = await response.json();
  return data.review;
}

/**
 * Delete a review (admin function)
 */
export async function deleteReview(reviewId: string): Promise<void> {
  const response = await fetch(`/api/reviews/${reviewId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete review');
  }
}

/**
 * Update a review (admin function)
 */
export async function updateReview(
  reviewId: string,
  updates: Partial<Review>
): Promise<Review> {
  const response = await fetch(`/api/reviews/${reviewId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update review');
  }

  const data = await response.json();
  return data.review;
}

