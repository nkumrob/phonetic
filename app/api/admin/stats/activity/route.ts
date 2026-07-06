import { NextRequest, NextResponse } from 'next/server';
import { getRecentActivity } from '@/lib/db/analytics-repo';
import { logger } from '@/lib/utils/logger';
import { parseActivityLimit } from './parse-limit';

type ActivityLoader = (limit: number) => Promise<unknown>;

/**
 * Factory that wires the `limit` param → loader → JSON response pipeline.
 *
 * Auth is enforced upstream by middleware (guards all `/api/admin/*`), matching
 * the other stats routes. Unlike them this endpoint takes `limit` (not `days`),
 * so it implements the request directly rather than via `createStatsHandler`.
 * The `limit` param is silently clamped to an integer in [1, 200] (default 50).
 *
 * The optional `load` argument is an injectable seam for unit tests; production
 * code uses the real `getRecentActivity` loader by default.
 */
export function createActivityHandler(load: ActivityLoader = getRecentActivity) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const limit = parseActivityLimit(request.nextUrl.searchParams.get('limit'));

    try {
      return NextResponse.json(await load(limit));
    } catch (error) {
      logger.error('Failed to load recent activity', error, {
        context: 'api/admin/stats/activity',
      });
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  };
}

export const GET = createActivityHandler();
