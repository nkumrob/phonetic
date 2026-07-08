import { NextRequest, NextResponse } from 'next/server';
import { listFeatureRequests, type FeatureRequest } from '@/lib/db/feature-requests-repo';
import { logger } from '@/lib/utils/logger';

const MIN_LIMIT = 1;
const MAX_LIMIT = 500;
const DEFAULT_LIMIT = 100;

function clampLimit(value: number): number {
  return Math.min(MAX_LIMIT, Math.max(MIN_LIMIT, Math.floor(value)));
}

export function createAdminFeatureRequestsHandler(deps?: {
  list?: (limit?: number) => Promise<FeatureRequest[]>;
}): (request: NextRequest) => Promise<NextResponse> {
  const list = deps?.list ?? listFeatureRequests;

  return async (request: NextRequest): Promise<NextResponse> => {
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get('limit');
    const limit = limitParam !== null ? clampLimit(parseInt(limitParam, 10)) : DEFAULT_LIMIT;

    try {
      const requests = await list(limit);
      return NextResponse.json({ requests });
    } catch (error) {
      logger.error('Failed to list feature requests', error, {
        context: 'api/admin/feature-requests',
      });
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  };
}
