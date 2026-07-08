'use client';

import { useEffect, useState } from 'react';
import { ReviewForm } from '@/components/reviews/review-form';
import { StarRating } from '@/components/reviews/star-rating';
import { Review, ReviewFormData } from '@/lib/types/review';

/**
 * First-party review collection: the form posts straight into our own
 * moderation queue (POST /api/reviews); approved reviews render below.
 */
export default function ReviewsClient() {
  const [approved, setApproved] = useState<Review[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/reviews?approved=true&limit=24')
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
      .then((data: { reviews: Review[] }) => {
        if (!cancelled) setApproved(data.reviews ?? []);
      })
      .catch(() => {
        // List is optional; the form is the point of this page.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function submitReview(data: ReviewFormData) {
    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const body = (await res.json().catch(() => null)) as { error?: string } | null;
      throw new Error(body?.error ?? 'Could not submit your review. Please try again.');
    }
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-3xl">
        <div className="mb-12 text-center">
          <p className="font-mono text-[13px] uppercase tracking-[0.12em] text-tertiary">Reviews</p>
          <h1 className="mt-2 text-4xl font-black tracking-headlines md:text-5xl">
            Share your experience
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-gray-600 dark:text-warmNeutral-300">
            Tell other professionals how the AI tools or the NATO comms training fit your work. A
            sentence or two is plenty.
          </p>
        </div>

        <div className="rounded-xl border border-warmNeutral-200 bg-white p-6 shadow-[0_16px_32px_-20px_rgba(92,54,38,0.35)] dark:border-warmNeutral-700 dark:bg-warmNeutral-800 md:p-8">
          <ReviewForm onSubmit={submitReview} />
        </div>

        <p className="mt-4 text-center text-sm text-tertiary">
          Reviews are moderated before publication. Your email, if provided, is never shown.
        </p>

        {approved.length > 0 && (
          <section className="mt-16">
            <h2 className="mb-6 text-2xl font-bold tracking-largeText">What others said</h2>
            <div className="grid gap-6 md:grid-cols-2">
              {approved.map((review) => (
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
          </section>
        )}
      </div>
    </div>
  );
}
