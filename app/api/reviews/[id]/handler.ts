/**
 * Review mutation handlers — factory pattern with injectable deps for testability.
 * route.ts is the thin Next.js wrapper; all logic lives here.
 * Auth is enforced by middleware AND by an in-handler check (defense-in-depth).
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  updateReview as updateReviewRepo,
  deleteReview as deleteReviewRepo,
} from '@/lib/db/reviews-repo';
import { verifySessionToken, ADMIN_COOKIE } from '@/lib/server/admin-session';
import type { Review } from '@/lib/types/review';
import { logger } from '@/lib/utils/logger';

// ---------------------------------------------------------------------------
// Dep types
// ---------------------------------------------------------------------------

type UpdateFn = (id: string, updates: Partial<Review>) => Promise<Review | null>;
type DeleteFn = (id: string) => Promise<boolean>;
type VerifyFn = (token: string | undefined, secret: string) => Promise<boolean>;

export interface MutationHandlerDeps {
  updateReview?: UpdateFn;
  deleteReview?: DeleteFn;
  verifySession?: VerifyFn;
}

// ---------------------------------------------------------------------------
// Auth helper
// ---------------------------------------------------------------------------

async function checkAdmin(request: NextRequest, verify: VerifyFn): Promise<boolean> {
  return verify(
    request.cookies.get(ADMIN_COOKIE)?.value,
    process.env.ADMIN_SESSION_SECRET ?? ''
  );
}

// ---------------------------------------------------------------------------
// PATCH handler factory
// ---------------------------------------------------------------------------

export function createPatchHandler(deps?: MutationHandlerDeps) {
  const update: UpdateFn = deps?.updateReview ?? updateReviewRepo;
  const verify: VerifyFn = deps?.verifySession ?? verifySessionToken;

  return async (
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
  ): Promise<NextResponse> => {
    try {
      const isAdmin = await checkAdmin(request, verify);
      if (!isAdmin) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const body = await request.json();
      const { id } = await params;

      const review = await update(id, body);
      if (!review) {
        return NextResponse.json({ error: 'Review not found' }, { status: 404 });
      }

      return NextResponse.json({ review });
    } catch (error) {
      logger.error('Error in PATCH /api/reviews/[id]', error, { context: 'api/reviews' });
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  };
}

// ---------------------------------------------------------------------------
// DELETE handler factory
// ---------------------------------------------------------------------------

export function createDeleteHandler(deps?: MutationHandlerDeps) {
  const del: DeleteFn = deps?.deleteReview ?? deleteReviewRepo;
  const verify: VerifyFn = deps?.verifySession ?? verifySessionToken;

  return async (
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
  ): Promise<NextResponse> => {
    try {
      const isAdmin = await checkAdmin(request, verify);
      if (!isAdmin) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const { id } = await params;

      const deleted = await del(id);
      if (!deleted) {
        return NextResponse.json({ error: 'Review not found' }, { status: 404 });
      }

      return NextResponse.json({ success: true });
    } catch (error) {
      logger.error('Error in DELETE /api/reviews/[id]', error, { context: 'api/reviews' });
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  };
}
