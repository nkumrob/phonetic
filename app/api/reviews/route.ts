/**
 * Reviews API Route — Turso-backed.
 * Handles fetching and creating reviews.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createReview, listReviews } from '@/lib/db/reviews-repo';
import { ReviewFormData } from '@/lib/types/review';
import { logger } from '@/lib/utils/logger';

// GET /api/reviews - Fetch reviews (approved by default)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rating = searchParams.get('rating');
    const limit = searchParams.get('limit');
    const approvedOnly = searchParams.get('approved') !== 'false';

    const reviews = await listReviews({
      approvedOnly,
      rating: rating ? parseInt(rating, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });

    return NextResponse.json({ reviews });
  } catch (error) {
    logger.error('Error in GET /api/reviews', error, { context: 'api/reviews' });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/reviews - Create a new review (unapproved until moderated)
export async function POST(request: NextRequest) {
  try {
    const body: ReviewFormData = await request.json();

    if (!body.name || !body.rating || !body.title || !body.comment) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    if (body.rating < 1 || body.rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
    }

    const review = await createReview({
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
}
