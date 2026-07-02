'use client';

import { useState } from 'react';
import { TIME_SAVED_BUCKETS, type TimeSavedBucket } from '@/lib/ai/types';
import { submitTimeSaved } from '@/lib/services/ai-tool-service';
import { recordLocalTimeSaved } from '@/lib/client/time-saved';

const BUCKET_LABELS: Record<TimeSavedBucket, string> = {
  '<1': '<1 min',
  '1-5': '1-5 min',
  '5-15': '5-15 min',
  '15+': '15+ min',
};

interface TimeSavedFeedbackProps {
  usageId: string;
}

/** One-tap "time saved" feedback row shown under a successful result. */
export function TimeSavedFeedback({ usageId }: TimeSavedFeedbackProps) {
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <p className="text-sm text-success font-medium animate-fade-in">
        Thanks! Your feedback helps us improve.
      </p>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-secondary">How much time did this save you?</span>
      {TIME_SAVED_BUCKETS.map((bucket) => (
        <button
          key={bucket}
          type="button"
          onClick={() => {
            setSubmitted(true);
            recordLocalTimeSaved(bucket);
            void submitTimeSaved(usageId, bucket);
          }}
          className="px-3 py-1.5 text-sm font-medium rounded-full bg-warmNeutral-100 text-warmNeutral-700 hover:bg-warmNeutral-200 dark:bg-warmNeutral-700 dark:text-warmNeutral-200 dark:hover:bg-warmNeutral-600 transition-colors"
        >
          {BUCKET_LABELS[bucket]}
        </button>
      ))}
    </div>
  );
}
