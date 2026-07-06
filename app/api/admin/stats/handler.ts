import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/utils/logger';

const ALLOWED_DAYS = [7, 30, 90] as const;

/**
 * Shared factory for admin stats endpoints. Auth is enforced upstream by
 * middleware; this layer only validates the range and shapes errors.
 */
export function createStatsHandler(load: (days: number) => Promise<unknown>) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const raw = request.nextUrl.searchParams.get('days');
    const days = raw === null ? 30 : Number(raw);
    if (!ALLOWED_DAYS.includes(days as (typeof ALLOWED_DAYS)[number])) {
      return NextResponse.json({ error: 'days must be 7, 30, or 90' }, { status: 400 });
    }

    try {
      return NextResponse.json(await load(days));
    } catch (error) {
      logger.error('Failed to load admin stats', error, { context: 'api/admin/stats' });
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  };
}
