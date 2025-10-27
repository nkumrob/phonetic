'use client';

import React from 'react';
import { Button } from '@/components/ui';
import { ExternalLink, Star } from 'lucide-react';

export default function ReviewsClient() {
  const googleReviewLink = "https://g.page/r/YOUR_GOOGLE_PLACE_ID/review";

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

        {/* Google Review CTA */}
        <div className="max-w-2xl mx-auto">
          <div className="p-8 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border-2 border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-3 mb-4">
              <Star className="w-10 h-10 text-yellow-400 fill-yellow-400" />
              <h2 className="text-3xl font-bold">Love Our Platform?</h2>
            </div>
            <p className="text-lg text-secondary mb-6">
              Help others discover us by leaving a review on Google! Your feedback
              helps us improve and reach more learners.
            </p>
            <Button
              onClick={() => window.open(googleReviewLink, '_blank')}
              className="w-full"
              size="lg"
            >
              <ExternalLink className="w-5 h-5 mr-2" />
              Leave a Google Review
            </Button>
          </div>

          {/* Coming Soon */}
          <div className="mt-12 text-center p-8 bg-warmNeutral-50 dark:bg-warmNeutral-900 rounded-xl border-2 border-border">
            <div className="text-6xl mb-4">🚀</div>
            <h3 className="text-2xl font-bold mb-2">Reviews Coming Soon</h3>
            <p className="text-secondary">
              We&apos;re building a review system to showcase user testimonials.
              In the meantime, please share your feedback on Google!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

