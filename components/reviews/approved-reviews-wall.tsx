'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Review } from '@/lib/types/review';
import { StarRating } from './star-rating';

/**
 * First-party testimonial wall: renders approved reviews from our own
 * moderation queue. Every entry shown here was submitted by a real visitor
 * through /reviews and approved in the admin dashboard.
 */
export function ApprovedReviewsWall() {
  const [reviews, setReviews] = useState<Review[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/reviews?limit=9')
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
      .then((data: { reviews: Review[] }) => {
        if (!cancelled) setReviews(data.reviews ?? []);
      })
      .catch(() => {
        if (!cancelled) setReviews([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (reviews === null) {
    return <div className="min-h-[200px]" aria-hidden="true" />;
  }

  if (reviews.length === 0) {
    return (
      <div className="mx-auto max-w-xl rounded-xl border border-warmNeutral-200 bg-white p-10 text-center dark:border-warmNeutral-700 dark:bg-warmNeutral-800">
        <p className="text-lg font-bold">Be the first to share your experience</p>
        <p className="mt-2 text-gray-600 dark:text-warmNeutral-300">
          Used the AI tools or trained your NATO comms here? A sentence about how it fits your work
          helps other professionals decide.
        </p>
        <Link
          href="/reviews"
          className="mt-6 inline-flex items-center justify-center rounded-lg bg-coolBlue-600 px-6 py-3 font-bold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-coolBlue-700"
        >
          Write a review
        </Link>
      </div>
    );
  }

  return (
    <div>
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
  );
}
