'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Review } from '@/lib/types/review';
import { StarRating } from './star-rating';

/**
 * First-party testimonial wall: renders approved reviews from our own
 * moderation queue. The whole section stays hidden until at least
 * MIN_REVIEWS_TO_SHOW are approved, so the homepage never shows an empty
 * social-proof section. The review-ask popup handles solicitation instead.
 */
const MIN_REVIEWS_TO_SHOW = 2;

export function ApprovedReviewsWall() {
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/reviews?limit=9')
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
      .then((data: { reviews: Review[] }) => {
        if (!cancelled) setReviews(data.reviews ?? []);
      })
      .catch(() => {
        // Silent: the section simply does not render.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (reviews.length < MIN_REVIEWS_TO_SHOW) return null;

  return (
    <section className="border-t border-warmNeutral-200 bg-white py-20 dark:border-warmNeutral-700 dark:bg-warmNeutral-900 md:py-24">
      <div className="container px-6 md:px-8 lg:px-4">
        <div className="mb-12 max-w-5xl md:mb-16">
          <h2 className="h2 mb-4">What Our Users Say</h2>
          <p className="max-w-2xl text-lg leading-relaxed text-gray-600 dark:text-warmNeutral-300">
            Real reviews from professionals who communicate clearly, with people and with AI
          </p>
        </div>

        <div className="mx-auto max-w-7xl">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {reviews.map((review) => (
              <figure
                key={review.id}
                className="flex flex-col rounded-xl border border-warmNeutral-200 bg-white p-6 dark:border-warmNeutral-700 dark:bg-warmNeutral-800"
              >
                <StarRating rating={review.rating} size="sm" />
                <blockquote className="mt-4 flex-1">
                  <p className="font-bold">{review.title}</p>
                  <p className="mt-2 text-gray-600 dark:text-warmNeutral-300">{review.comment}</p>
                </blockquote>
                <figcaption className="mt-4 flex items-center justify-between text-sm">
                  <span className="font-semibold">{review.name}</span>
                  <span className="text-tertiary">
                    {new Date(review.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link
              href="/reviews"
              className="inline-flex items-center justify-center rounded-lg border-2 border-stone-900 bg-white px-6 py-3 font-bold text-stone-900 transition-all duration-200 hover:-translate-y-0.5 hover:bg-stone-900 hover:text-white dark:border-warmNeutral-100 dark:bg-transparent dark:text-warmNeutral-100 dark:hover:bg-warmNeutral-100 dark:hover:text-warmNeutral-900"
            >
              Write a review
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
