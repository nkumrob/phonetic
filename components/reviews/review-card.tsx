'use client';

import React from 'react';
import { StarRating } from './star-rating';
import { Review } from '@/lib/types/review';
import { cn } from '@/lib/utils/cn';
import { CheckCircle2 } from 'lucide-react';

interface ReviewCardProps {
  review: Review;
  className?: string;
}

export function ReviewCard({ review, className }: ReviewCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div
      className={cn(
        'p-6 bg-card rounded-xl border-2 border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="font-semibold text-lg">{review.name}</h4>
            {review.verified && (
              <CheckCircle2 className="w-5 h-5 text-green-500" aria-label="Verified user" />
            )}
          </div>
          <StarRating rating={review.rating} size="sm" />
        </div>
        <time className="text-sm text-secondary" dateTime={review.date}>
          {formatDate(review.date)}
        </time>
      </div>

      {/* Review Title */}
      <h5 className="font-semibold text-base mb-2">{review.title}</h5>

      {/* Review Comment */}
      <p className="text-secondary leading-relaxed">{review.comment}</p>

      {/* Location (if available) */}
      {review.location && (
        <p className="text-xs text-secondary mt-4">
          📍 {review.location}
        </p>
      )}
    </div>
  );
}

