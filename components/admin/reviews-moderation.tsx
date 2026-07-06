'use client';

import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { cn } from '@/lib/utils/cn';
import type { Review } from '@/lib/types/review';
import { ReviewModerationCard } from './review-moderation-card';

type Filter = 'pending' | 'approved' | 'all';

function filterToParam(filter: Filter): string {
  if (filter === 'pending') return 'approved=false';
  if (filter === 'approved') return 'approved=true';
  return '';
}

const FILTERS: { label: string; value: Filter }[] = [
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'All', value: 'all' },
];

export function ReviewsModeration() {
  const [filter, setFilter] = useState<Filter>('pending');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  async function loadReviews() {
    setLoading(true);
    const param = filterToParam(filter);
    const url = `/api/reviews${param ? `?${param}` : ''}`;
    try {
      const res = await fetch(url);
      const data = (await res.json()) as { reviews?: Review[] };
      setReviews(data.reviews ?? []);
    } catch {
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleAction(
    id: string,
    action: () => Promise<Response>
  ) {
    setProcessing(id);
    setError(null);
    try {
      const res = await action();
      if (res.ok) {
        await loadReviews();
      } else {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        setError(body?.error ?? 'Action failed. Please try again.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setProcessing(null);
    }
  }

  function handleApprove(id: string) {
    handleAction(id, () =>
      fetch(`/api/reviews/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved: true }),
      })
    );
  }

  function handleUnapprove(id: string) {
    handleAction(id, () =>
      fetch(`/api/reviews/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved: false }),
      })
    );
  }

  function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
      return;
    }
    handleAction(id, () =>
      fetch(`/api/reviews/${id}`, { method: 'DELETE' })
    );
  }

  const pendingCount = reviews.filter((r) => !r.approved).length;
  const approvedCount = reviews.filter((r) => r.approved).length;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-black tracking-headlines">Reviews</h1>
        <Button
          variant="secondary"
          size="sm"
          onClick={loadReviews}
          disabled={loading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} aria-hidden />
          Refresh
        </Button>
      </div>

      {/* Inline error banner */}
      {error && (
        <p
          role="alert"
          className="rounded-xl border border-error/30 bg-white p-4 text-sm font-semibold text-error dark:bg-warmNeutral-800"
        >
          {error}
        </p>
      )}

      {/* Stats tiles */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-warmNeutral-200 bg-white p-4 dark:border-warmNeutral-700 dark:bg-warmNeutral-800">
          <p className="font-mono text-2xl font-bold">{reviews.length}</p>
          <p className="text-xs font-bold uppercase tracking-widest text-tertiary">Total</p>
        </div>
        <div className="rounded-xl border border-warmAmber-200 bg-warmAmber-50 p-4 dark:border-warmAmber-800 dark:bg-warmAmber-900/20">
          <p className="font-mono text-2xl font-bold text-warmAmber-800 dark:text-warmAmber-300">{pendingCount}</p>
          <p className="text-xs font-bold uppercase tracking-widest text-warmAmber-700 dark:text-warmAmber-400">Pending</p>
        </div>
        <div className="rounded-xl border border-success/30 bg-success/5 p-4">
          <p className="font-mono text-2xl font-bold text-success">{approvedCount}</p>
          <p className="text-xs font-bold uppercase tracking-widest text-success/70">Approved</p>
        </div>
      </div>

      {/* Filter strip — radio group so these don't collide with action buttons in tests */}
      <div
        role="radiogroup"
        aria-label="Review filter"
        className="inline-flex gap-1 rounded-lg border border-warmNeutral-200 p-1 dark:border-warmNeutral-700"
      >
        {FILTERS.map(({ label, value }) => (
          <button
            key={value}
            role="radio"
            aria-checked={filter === value}
            onClick={() => setFilter(value)}
            className={cn(
              'rounded-md px-4 py-1.5 text-sm font-semibold',
              filter === value
                ? 'bg-coolBlue-600 text-white'
                : 'text-gray-600 hover:bg-warmNeutral-100 dark:text-warmNeutral-200 dark:hover:bg-warmNeutral-800'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Review list */}
      {loading ? (
        <div className="flex justify-center py-16">
          <LoadingSpinner size="lg" />
        </div>
      ) : reviews.length === 0 ? (
        <p className="rounded-xl border border-warmNeutral-200 bg-white p-8 text-center text-sm text-tertiary dark:border-warmNeutral-700 dark:bg-warmNeutral-800">
          {filter === 'pending' && 'No reviews pending approval.'}
          {filter === 'approved' && 'No approved reviews yet.'}
          {filter === 'all' && 'No reviews in the system.'}
        </p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <ReviewModerationCard
              key={review.id}
              review={review}
              processing={processing === review.id}
              onApprove={handleApprove}
              onUnapprove={handleUnapprove}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
