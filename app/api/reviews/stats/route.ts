/**
 * Review Statistics API Route — Turso-backed.
 */

import { NextResponse } from 'next/server';
import { getReviewStats } from '@/lib/db/reviews-repo';
import { logger } from '@/lib/utils/logger';

export async function GET() {
  try {
    const stats = await getReviewStats();
    return NextResponse.json({ stats });
  } catch (error) {
    logger.error('Error in GET /api/reviews/stats', error, { context: 'api/reviews' });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
