'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui';
import { StarRating } from './star-rating';
import { ReviewFormData } from '@/lib/types/review';
import { cn } from '@/lib/utils/cn';

interface ReviewFormProps {
  onSubmit: (data: ReviewFormData) => Promise<void>;
  className?: string;
}

export function ReviewForm({ onSubmit, className }: ReviewFormProps) {
  const [formData, setFormData] = useState<ReviewFormData>({
    name: '',
    email: '',
    rating: 0,
    title: '',
    comment: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.name.trim()) {
      setError('Please enter your name');
      return;
    }
    if (formData.rating === 0) {
      setError('Please select a rating');
      return;
    }
    if (!formData.title.trim()) {
      setError('Please enter a review title');
      return;
    }
    if (!formData.comment.trim()) {
      setError('Please enter your review');
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit(formData);
      setSubmitted(true);
      // Reset form
      setFormData({
        name: '',
        email: '',
        rating: 0,
        title: '',
        comment: '',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className={cn('p-8 bg-green-50 dark:bg-green-900/20 rounded-xl border-2 border-green-200 dark:border-green-800 text-center', className)}>
        <div className="text-4xl mb-4">🎉</div>
        <h3 className="text-2xl font-bold mb-2 text-green-800 dark:text-green-200">
          Thank You for Your Review!
        </h3>
        <p className="text-green-700 dark:text-green-300 mb-4">
          Your feedback helps us improve and helps others discover our platform.
          Your review will be published after moderation.
        </p>
        <Button
          onClick={() => setSubmitted(false)}
          variant="secondary"
        >
          Submit Another Review
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-6', className)}>
      <div>
        <h3 className="text-2xl font-bold mb-2">Share Your Experience</h3>
        <p className="text-secondary">
          Help others learn about the NATO Phonetic Alphabet by sharing your experience
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-lg text-red-800 dark:text-red-200">
          {error}
        </div>
      )}

      {/* Rating */}
      <div>
        <label className="block text-sm font-semibold mb-2">
          Your Rating <span className="text-red-500">*</span>
        </label>
        <StarRating
          rating={formData.rating}
          interactive
          size="lg"
          onRatingChange={(rating) => setFormData({ ...formData, rating })}
        />
      </div>

      {/* Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-semibold mb-2">
          Your Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-4 py-3 rounded-lg border-2 border-border bg-background focus:border-primary focus:outline-none transition-colors"
          placeholder="John Doe"
          required
        />
      </div>

      {/* Email (Optional) */}
      <div>
        <label htmlFor="email" className="block text-sm font-semibold mb-2">
          Email (Optional)
        </label>
        <input
          type="email"
          id="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full px-4 py-3 rounded-lg border-2 border-border bg-background focus:border-primary focus:outline-none transition-colors"
          placeholder="john@example.com"
        />
        <p className="text-xs text-secondary mt-1">
          We&apos;ll never share your email publicly
        </p>
      </div>

      {/* Review Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-semibold mb-2">
          Review Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-4 py-3 rounded-lg border-2 border-border bg-background focus:border-primary focus:outline-none transition-colors"
          placeholder="Great learning tool!"
          required
          maxLength={100}
        />
      </div>

      {/* Review Comment */}
      <div>
        <label htmlFor="comment" className="block text-sm font-semibold mb-2">
          Your Review <span className="text-red-500">*</span>
        </label>
        <textarea
          id="comment"
          value={formData.comment}
          onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
          className="w-full px-4 py-3 rounded-lg border-2 border-border bg-background focus:border-primary focus:outline-none transition-colors min-h-[150px] resize-y"
          placeholder="Tell us about your experience learning the NATO phonetic alphabet..."
          required
          maxLength={1000}
        />
        <p className="text-xs text-secondary mt-1">
          {formData.comment.length} / 1000 characters
        </p>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full"
        size="lg"
      >
        {isSubmitting ? 'Submitting...' : 'Submit Review'}
      </Button>

      <p className="text-xs text-secondary text-center">
        By submitting this review, you agree to our terms and conditions.
        Reviews are moderated and may take up to 24 hours to appear.
      </p>
    </form>
  );
}

