'use client';

import React, { useState, useEffect } from 'react';
import { Review } from '@/lib/types/review';
import { ReviewCard } from '@/components/reviews/review-card';
import { StarRating } from '@/components/reviews/star-rating';
import { Button } from '@/components/ui';
import { CheckCircle2, XCircle, Trash2, RefreshCw } from 'lucide-react';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('pending');
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    loadReviews();
  }, [filter]);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const approved = filter === 'all' ? undefined : filter === 'approved';
      const params = new URLSearchParams();
      if (approved !== undefined) {
        params.append('approved', approved.toString());
      }
      
      const response = await fetch(`/api/reviews?${params.toString()}`);
      const data = await response.json();
      setReviews(data.reviews || []);
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (reviewId: string) => {
    setProcessing(reviewId);
    try {
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved: true }),
      });

      if (response.ok) {
        await loadReviews();
      } else {
        alert('Failed to approve review');
      }
    } catch (error) {
      console.error('Error approving review:', error);
      alert('Error approving review');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (reviewId: string) => {
    setProcessing(reviewId);
    try {
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved: false }),
      });

      if (response.ok) {
        await loadReviews();
      } else {
        alert('Failed to reject review');
      }
    } catch (error) {
      console.error('Error rejecting review:', error);
      alert('Error rejecting review');
    } finally {
      setProcessing(null);
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
      return;
    }

    setProcessing(reviewId);
    try {
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await loadReviews();
      } else {
        alert('Failed to delete review');
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      alert('Error deleting review');
    } finally {
      setProcessing(null);
    }
  };

  const pendingCount = reviews.filter(r => !r.approved).length;
  const approvedCount = reviews.filter(r => r.approved).length;

  return (
    <div className="min-h-screen py-12 px-4 bg-warmNeutral-50 dark:bg-warmNeutral-900">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Review Management</h1>
          <p className="text-secondary">Moderate and manage user reviews</p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="p-6 bg-white dark:bg-warmNeutral-800 rounded-xl border-2 border-border">
            <div className="text-3xl font-bold text-primary">{reviews.length}</div>
            <div className="text-sm text-secondary">Total Reviews</div>
          </div>
          <div className="p-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border-2 border-yellow-200 dark:border-yellow-800">
            <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{pendingCount}</div>
            <div className="text-sm text-secondary">Pending Approval</div>
          </div>
          <div className="p-6 bg-green-50 dark:bg-green-900/20 rounded-xl border-2 border-green-200 dark:border-green-800">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">{approvedCount}</div>
            <div className="text-sm text-secondary">Approved</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex gap-2">
            <Button
              variant={filter === 'all' ? 'primary' : 'secondary'}
              onClick={() => setFilter('all')}
            >
              All ({reviews.length})
            </Button>
            <Button
              variant={filter === 'pending' ? 'primary' : 'secondary'}
              onClick={() => setFilter('pending')}
            >
              Pending ({pendingCount})
            </Button>
            <Button
              variant={filter === 'approved' ? 'primary' : 'secondary'}
              onClick={() => setFilter('approved')}
            >
              Approved ({approvedCount})
            </Button>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={loadReviews}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Reviews List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-secondary">Loading reviews...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-warmNeutral-800 rounded-xl border-2 border-border">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-2xl font-bold mb-2">No Reviews Found</h3>
            <p className="text-secondary">
              {filter === 'pending' && 'No reviews pending approval'}
              {filter === 'approved' && 'No approved reviews yet'}
              {filter === 'all' && 'No reviews in the system'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="bg-white dark:bg-warmNeutral-800 rounded-xl border-2 border-border p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Review Content */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-xl font-bold">{review.name}</h3>
                      {review.approved ? (
                        <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-semibold rounded-full">
                          Approved
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs font-semibold rounded-full">
                          Pending
                        </span>
                      )}
                      {review.verified && (
                        <CheckCircle2 className="w-5 h-5 text-blue-500" />
                      )}
                    </div>

                    <StarRating rating={review.rating} size="sm" className="mb-3" />

                    <h4 className="font-semibold text-lg mb-2">{review.title}</h4>
                    <p className="text-secondary mb-3">{review.comment}</p>

                    <div className="flex items-center gap-4 text-sm text-tertiary">
                      {review.email && <span>📧 {review.email}</span>}
                      {review.location && <span>📍 {review.location}</span>}
                      <span>📅 {new Date(review.date).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    {!review.approved && (
                      <Button
                        size="sm"
                        onClick={() => handleApprove(review.id)}
                        disabled={processing === review.id}
                        className="whitespace-nowrap"
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Approve
                      </Button>
                    )}
                    {review.approved && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleReject(review.id)}
                        disabled={processing === review.id}
                        className="whitespace-nowrap"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Unapprove
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleDelete(review.id)}
                      disabled={processing === review.id}
                      className="whitespace-nowrap text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

