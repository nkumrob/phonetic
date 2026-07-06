import { NextRequest, NextResponse } from 'next/server';
import { getRecentActivity } from '@/lib/db/analytics-repo';
import { logger } from '@/lib/utils/logger';
import { parseActivityLimit } from './parse-limit';

/**
 * Recent activity feed endpoint.
 *
 * Auth is enforced upstream by middleware (guards all `/api/admin/*`), matching
 * the other stats routes. Unlike them this endpoint takes `limit` (not `days`),
 * so it implements the request directly rather than via `createStatsHandler`.
 * The `limit` param is silently clamped to an integer in [1, 200] (default 50).
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const limit = parseActivityLimit(request.nextUrl.searchParams.get('limit'));

  try {
    return NextResponse.json(await getRecentActivity(limit));
  } catch (error) {
    logger.error('Failed to load recent activity', error, {
      context: 'api/admin/stats/activity',
    });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
