'use client';

import React, { useEffect, useState } from 'react';
import { ReviewCard } from './review-card';
import { Button } from '@/components/ui';
import { getFeaturedReviews, getReviewStats } from '@/lib/services/review-service';
import { Review } from '@/lib/types/review';
import { ArrowRight, Star } from 'lucide-react';
import Link from 'next/link';

interface TestimonialsSectionProps {
  limit?: number;
  showCTA?: boolean;
}

export function TestimonialsSection({ limit = 3, showCTA = true }: TestimonialsSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);

  useEffect(() => {
    const loadReviews = async () => {
      const featuredReviews = await getFeaturedReviews(limit);
      setReviews(featuredReviews);

      const stats = await getReviewStats();
      setAverageRating(stats.averageRating);
      setTotalReviews(stats.totalReviews);
    };

    loadReviews();
  }, [limit]);

  if (reviews.length === 0) {
    return null; // Don't show section if no reviews
  }

  return (
    <section className="py-16 px-4 bg-gradient-to-b from-background to-warmNeutral-50 dark:to-warmNeutral-900/30">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Star className="w-8 h-8 text-yellow-400 fill-yellow-400" />
            <h2 className="text-3xl md:text-4xl font-bold">
              What Our Users Say
            </h2>
          </div>
          {totalReviews > 0 && (
            <p className="text-xl text-secondary">
              Rated {averageRating.toFixed(1)} / 5.0 by {totalReviews} users
            </p>
          )}
        </div>

        {/* Reviews Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>

        {/* CTA */}
        {showCTA && (
          <div className="text-center">
            <Link href="/reviews">
              <Button size="lg" variant="secondary">
                View All Reviews
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

