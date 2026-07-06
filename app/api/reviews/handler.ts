/**
 * Reviews API handlers — factory pattern with injectable deps for testability.
 * route.ts is the thin Next.js wrapper; all logic lives here.
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  listReviews as listReviewsRepo,
  createReview as createReviewRepo,
} from '@/lib/db/reviews-repo';
import { verifySessionToken } from '@/lib/server/admin-session';
import type { Review, ReviewFormData } from '@/lib/types/review';
import { logger } from '@/lib/utils/logger';

// ---------------------------------------------------------------------------
// Dep types
// ---------------------------------------------------------------------------

type ListFn = (options: {
  approvedFilter?: boolean;
  rating?: number;
  limit?: number;
}) => Promise<Review[]>;

type CreateFn = (formData: ReviewFormData) => Promise<Review>;

type VerifyFn = (token: string | undefined, secret: string) => Promise<boolean>;

export interface ReviewsHandlerDeps {
  listReviews?: ListFn;
  createReview?: CreateFn;
  verifySession?: VerifyFn;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function stripEmail(review: Review): Omit<Review, 'email'> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { email: _email, ...rest } = review;
  return rest;
}

// ---------------------------------------------------------------------------
// GET handler factory
// ---------------------------------------------------------------------------

export function createGetHandler(deps?: ReviewsHandlerDeps) {
  const list: ListFn = deps?.listReviews ?? listReviewsRepo;
  const verify: VerifyFn = deps?.verifySession ?? verifySessionToken;

  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      const isAdmin = await verify(
        request.cookies.get('np_admin')?.value,
        process.env.ADMIN_SESSION_SECRET ?? ''
      );

      const { searchParams } = new URL(request.url);
      const ratingParam = searchParams.get('rating');
      const limitParam = searchParams.get('limit');
      const approvedParam = searchParams.get('approved');

      let approvedFilter: boolean | undefined;

      if (!isAdmin) {
        // Non-admins always get approved-only; ignore the approved param
        approvedFilter = true;
      } else {
        // Admin: real trichotomy
        if (approvedParam === 'true') approvedFilter = true;
        else if (approvedParam === 'false') approvedFilter = false;
        // else: undefined → all reviews
      }

      const reviews = await list({
        approvedFilter,
        rating: ratingParam ? parseInt(ratingParam, 10) : undefined,
        limit: limitParam ? parseInt(limitParam, 10) : undefined,
      });

      // Strip PII for non-admin callers
      const payload = isAdmin ? reviews : reviews.map(stripEmail);

      return NextResponse.json({ reviews: payload });
    } catch (error) {
      logger.error('Error in GET /api/reviews', error, { context: 'api/reviews' });
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  };
}

// ---------------------------------------------------------------------------
// POST handler factory (behaviour unchanged from original route.ts)
// ---------------------------------------------------------------------------

export function createPostHandler(deps?: ReviewsHandlerDeps) {
  const create: CreateFn = deps?.createReview ?? createReviewRepo;

  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      const body: ReviewFormData = await request.json();

      if (!body.name || !body.rating || !body.title || !body.comment) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
      }
      if (body.rating < 1 || body.rating > 5) {
        return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
      }

      const review = await create({
        name: body.name,
        email: body.email,
        rating: body.rating,
        title: body.title,
        comment: body.comment,
      });

      return NextResponse.json({ review }, { status: 201 });
    } catch (error) {
      logger.error('Error in POST /api/reviews', error, { context: 'api/reviews' });
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  };
}
