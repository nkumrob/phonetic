/**
 * Individual Review API Route — Turso-backed.
 * Handles updating and deleting specific reviews (admin operations).
 */

import { NextRequest, NextResponse } from 'next/server';
import { deleteReview, updateReview } from '@/lib/db/reviews-repo';
import { logger } from '@/lib/utils/logger';

// PATCH /api/reviews/[id] - Update a review (approve, verify, etc.)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const { id } = await params;

    const review = await updateReview(id, body);
    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    return NextResponse.json({ review });
  } catch (error) {
    logger.error('Error in PATCH /api/reviews/[id]', error, { context: 'api/reviews' });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/reviews/[id] - Delete a review
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const deleted = await deleteReview(id);
    if (!deleted) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Error in DELETE /api/reviews/[id]', error, { context: 'api/reviews' });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
