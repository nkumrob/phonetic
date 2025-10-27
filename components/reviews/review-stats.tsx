'use client';

import React from 'react';
import { StarRating } from './star-rating';
import { ReviewStats } from '@/lib/types/review';
import { cn } from '@/lib/utils/cn';

interface ReviewStatsProps {
  stats: ReviewStats;
  className?: string;
}

export function ReviewStatsDisplay({ stats, className }: ReviewStatsProps) {
  const maxCount = Math.max(...Object.values(stats.ratingDistribution));

  return (
    <div className={cn('p-6 bg-card rounded-xl border-2 border-border', className)}>
      {/* Overall Rating */}
      <div className="text-center mb-6">
        <div className="text-5xl font-bold mb-2">{stats.averageRating.toFixed(1)}</div>
        <StarRating rating={stats.averageRating} size="lg" />
        <p className="text-secondary mt-2">
          Based on {stats.totalReviews} {stats.totalReviews === 1 ? 'review' : 'reviews'}
        </p>
      </div>

      {/* Rating Distribution */}
      <div className="space-y-2">
        {[5, 4, 3, 2, 1].map((rating) => {
          const count = stats.ratingDistribution[rating as keyof typeof stats.ratingDistribution];
          const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;

          return (
            <div key={rating} className="flex items-center gap-3">
              <span className="text-sm font-medium w-8">{rating}★</span>
              <div className="flex-1 h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-400 transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="text-sm text-secondary w-12 text-right">{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

