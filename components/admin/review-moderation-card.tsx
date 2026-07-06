import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StarRating } from '@/components/reviews/star-rating';
import type { Review } from '@/lib/types/review';

interface ReviewModerationCardProps {
  review: Review;
  processing: boolean;
  onApprove: (id: string) => void;
  onUnapprove: (id: string) => void;
  onDelete: (id: string) => void;
}

export function ReviewModerationCard({
  review,
  processing,
  onApprove,
  onUnapprove,
  onDelete,
}: ReviewModerationCardProps) {
  return (
    <div className="rounded-xl border border-warmNeutral-200 bg-white p-6 dark:border-warmNeutral-700 dark:bg-warmNeutral-800">
      <div className="flex items-start justify-between gap-4">
        {/* Review content */}
        <div className="min-w-0 flex-1">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-bold">{review.name}</h3>
            {review.verified && (
              <CheckCircle2 className="h-4 w-4 text-coolBlue-600" aria-label="Verified" />
            )}
            {review.approved ? (
              <span className="rounded-full bg-success/10 px-2.5 py-0.5 text-xs font-semibold text-success">
                Approved
              </span>
            ) : (
              <span className="rounded-full bg-warmAmber-100 px-2.5 py-0.5 text-xs font-semibold text-warmAmber-800 dark:bg-warmAmber-900/30 dark:text-warmAmber-300">
                Pending
              </span>
            )}
          </div>

          <StarRating rating={review.rating} size="sm" className="mb-3" />

          <p className="mb-1 font-semibold">{review.title}</p>
          {/* Plain text node — attacker-controlled content, never dangerouslySetInnerHTML */}
          <p className="mb-3 text-sm text-secondary">{review.comment}</p>

          <p className="font-mono text-xs text-tertiary">
            {new Date(review.date).toLocaleDateString()}
          </p>
        </div>

        {/* Actions */}
        <div className="flex shrink-0 flex-col gap-2">
          {!review.approved && (
            <Button
              size="sm"
              onClick={() => onApprove(review.id)}
              disabled={processing}
              className="whitespace-nowrap"
            >
              Approve
            </Button>
          )}
          {review.approved && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => onUnapprove(review.id)}
              disabled={processing}
              className="whitespace-nowrap"
            >
              Unapprove
            </Button>
          )}
          <Button
            size="sm"
            variant="secondary"
            onClick={() => onDelete(review.id)}
            disabled={processing}
            className="whitespace-nowrap text-error hover:bg-error/10"
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}
