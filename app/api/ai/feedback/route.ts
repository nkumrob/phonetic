import { NextRequest, NextResponse } from 'next/server';
import { recordTimeSaved } from '@/lib/ai/metrics';
import type { TimeSavedBucket } from '@/lib/ai/types';
import { withRateLimit } from '@/lib/middleware/with-rate-limit';
import { logger } from '@/lib/utils/logger';

interface HandlerDeps {
  record?: (usageId: string, bucket: TimeSavedBucket) => Promise<boolean>;
}

/** One-tap "how much time did this save you?" feedback for a tool_usage row. */
export function createFeedbackHandler(deps?: HandlerDeps) {
  const record = deps?.record ?? recordTimeSaved;

  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      let body: unknown;
      try {
        body = await request.json();
      } catch {
        return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
      }

      const { usageId, timeSavedBucket } = (body ?? {}) as {
        usageId?: unknown;
        timeSavedBucket?: unknown;
      };

      if (typeof usageId !== 'string' || typeof timeSavedBucket !== 'string') {
        return NextResponse.json(
          { error: 'usageId and timeSavedBucket are required' },
          { status: 400 }
        );
      }

      const recorded = await record(usageId, timeSavedBucket as TimeSavedBucket);
      if (!recorded) {
        return NextResponse.json({ error: 'Unable to record feedback' }, { status: 400 });
      }

      return NextResponse.json({ result: { recorded: true } });
    } catch (error) {
      logger.error('Feedback request failed', error, { context: 'api/ai/feedback' });
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  };
}

export const POST = withRateLimit(createFeedbackHandler(), {
  max: 30,
  windowMs: 60 * 60 * 1000,
});
