/**
 * Review Schema for SEO
 * Generates structured data for reviews to appear in Google search results
 */

import { Review, ReviewStats } from '@/lib/types/review';

/**
 * Generate aggregate rating schema
 */
export function generateAggregateRatingSchema(stats: ReviewStats) {
  if (stats.totalReviews === 0) return null;

  return {
    '@type': 'AggregateRating',
    ratingValue: stats.averageRating.toFixed(1),
    reviewCount: stats.totalReviews,
    bestRating: '5',
    worstRating: '1',
  };
}

/**
 * Generate individual review schema
 */
export function generateReviewSchema(review: Review) {
  return {
    '@type': 'Review',
    author: {
      '@type': 'Person',
      name: review.name,
    },
    datePublished: review.date,
    reviewBody: review.comment,
    name: review.title,
    reviewRating: {
      '@type': 'Rating',
      ratingValue: review.rating.toString(),
      bestRating: '5',
      worstRating: '1',
    },
  };
}

/**
 * Generate complete product schema with reviews
 */
export function generateProductWithReviewsSchema(
  reviews: Review[],
  stats: ReviewStats
) {
  const approvedReviews = reviews.filter(r => r.approved !== false);

  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'NATO Phonetic Alphabet Trainer',
    applicationCategory: 'EducationalApplication',
    description: 'Learn and master the NATO phonetic alphabet with interactive tools, quizzes, and practice exercises.',
    url: 'https://phoneticsweb.com',
    operatingSystem: 'Web Browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    aggregateRating: stats.totalReviews > 0 ? generateAggregateRatingSchema(stats) : undefined,
    review: approvedReviews.slice(0, 10).map(generateReviewSchema),
  };
}

/**
 * Generate Google Business review link
 * Replace with your actual Google Business Profile ID
 */
export function getGoogleReviewLink(): string {
  // TODO: Replace with your actual Google Business Profile place ID
  // You can find this in your Google Business Profile settings
  const placeId = 'YOUR_GOOGLE_PLACE_ID';
  return `https://search.google.com/local/writereview?placeid=${placeId}`;
}

