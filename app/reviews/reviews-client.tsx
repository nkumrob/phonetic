'use client';

import React, { useState, useEffect } from 'react';
import { ReviewForm } from '@/components/reviews/review-form';
import { ReviewCard } from '@/components/reviews/review-card';
import { ReviewStatsDisplay } from '@/components/reviews/review-stats';
import { SenjaWidget } from '@/components/reviews/senja-widget';
import { Button } from '@/components/ui';
import {
  getApprovedReviews,
  submitReview,
  getReviewStats,
} from '@/lib/services/review-service';
import { Review, ReviewFormData, ReviewStats } from '@/lib/types/review';
import { getGoogleReviewLink } from '@/lib/seo/review-schema';
import { ExternalLink, Star } from 'lucide-react';

export default function ReviewsClient() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats>({
    totalReviews: 0,
    averageRating: 0,
    ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  });
  const [showForm, setShowForm] = useState(false);
  const [filterRating, setFilterRating] = useState<number | null>(null);

  useEffect(() => {
    loadReviews();
    loadStats();
  }, []);

  const loadReviews = async () => {
    const allReviews = await getApprovedReviews();
    setReviews(allReviews);
  };

  const loadStats = async () => {
    const reviewStats = await getReviewStats();
    setStats(reviewStats);
  };

  const handleSubmitReview = async (formData: ReviewFormData) => {
    await submitReview(formData);
    loadReviews();
    loadStats();
    setShowForm(false);
  };

  const filteredReviews = filterRating
    ? reviews.filter((r) => Math.round(r.rating) === filterRating)
    : reviews;

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            User Reviews & Testimonials
          </h1>
          <p className="text-xl text-secondary max-w-2xl mx-auto">
            See what others are saying about learning the NATO phonetic alphabet
            with our platform
          </p>
        </div>

        {/* Stats and Google Review CTA */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {/* Stats */}
          <ReviewStatsDisplay stats={stats} />

          {/* Google Review CTA */}
          <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border-2 border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-3 mb-4">
              <Star className="w-8 h-8 text-yellow-400 fill-yellow-400" />
              <h3 className="text-2xl font-bold">Love Our Platform?</h3>
            </div>
            <p className="text-secondary mb-6">
              Help others discover us by leaving a review on Google! Your feedback
              helps us improve and reach more learners.
            </p>
            <div className="space-y-3">
              <Button
                onClick={() => window.open(getGoogleReviewLink(), '_blank')}
                className="w-full"
                size="lg"
              >
                <ExternalLink className="w-5 h-5 mr-2" />
                Leave a Google Review
              </Button>
              <Button
                onClick={() => setShowForm(!showForm)}
                variant="secondary"
                className="w-full"
                size="lg"
              >
                {showForm ? 'Hide Form' : 'Write a Review Here'}
              </Button>
            </div>
          </div>
        </div>

        {/* Review Form - Senja Widget */}
        {showForm && (
          <div className="mb-12">
            <div className="bg-white dark:bg-warmNeutral-800 rounded-xl border-2 border-border p-6">
              <h2 className="text-2xl font-bold mb-4">Share Your Experience</h2>
              <p className="text-secondary mb-6">
                Your feedback helps us improve and helps others discover our platform!
              </p>
              <SenjaWidget />
            </div>
          </div>
        )}

        {/* Filter */}
        {reviews.length > 0 && (
          <div className="mb-8">
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm font-semibold">Filter by rating:</span>
              <Button
                variant={filterRating === null ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setFilterRating(null)}
              >
                All
              </Button>
              {[5, 4, 3, 2, 1].map((rating) => (
                <Button
                  key={rating}
                  variant={filterRating === rating ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setFilterRating(rating)}
                >
                  {rating} ★
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Reviews Grid */}
        {filteredReviews.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-2xl font-bold mb-2">No Reviews Yet</h3>
            <p className="text-secondary mb-6">
              Be the first to share your experience!
            </p>
            <Button onClick={() => setShowForm(true)} size="lg">
              Write the First Review
            </Button>
          </div>
        )}

        {/* Bottom CTA */}
        {reviews.length > 0 && !showForm && (
          <div className="mt-12 text-center">
            <Button onClick={() => setShowForm(true)} size="lg">
              Share Your Experience
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

