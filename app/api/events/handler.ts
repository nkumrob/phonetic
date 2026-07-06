import { randomUUID } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import {
  EVENT_METADATA_MAX_BYTES,
  EVENT_TOOL_MAX_CHARS,
  isEventName,
} from '@/lib/constants/events';
import { insertEvent, type NewEvent } from '@/lib/db/events-repo';
import { parseAnonId } from '@/lib/utils/anon-id';
import { RateLimiter } from '@/lib/utils/rate-limit';
import { logger } from '@/lib/utils/logger';

interface LimiterLike {
  check(request: NextRequest): Promise<{ allowed: boolean; remaining: number; reset: Date }>;
}

interface HandlerDeps {
  insert?: (event: NewEvent) => Promise<void>;
  limiter?: LimiterLike;
}

/**
 * Records one allowlisted analytics event. Clients fire-and-forget, so
 * error statuses here are for correctness, never user-visible.
 *
 * Rate-limit is in its own "events" namespace so high-volume event posts cannot
 * consume the AI-route quota. Fire-and-forget clients ignore 429s;
 * X-RateLimit headers are intentionally omitted here.
 */
export function createEventsHandler(deps?: HandlerDeps) {
  const insert = deps?.insert ?? insertEvent;
  const limiter: LimiterLike =
    deps?.limiter ?? new RateLimiter({ keyPrefix: 'events', max: 120, windowMs: 60_000 });

  return async (request: NextRequest): Promise<NextResponse> => {
    const { allowed } = await limiter.check(request);
    if (!allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const { name, tool, metadata } = (body ?? {}) as {
      name?: unknown;
      tool?: unknown;
      metadata?: unknown;
    };

    if (!isEventName(name)) {
      return NextResponse.json({ error: 'Unknown event name' }, { status: 400 });
    }
    if (tool !== undefined && (typeof tool !== 'string' || tool.length > EVENT_TOOL_MAX_CHARS)) {
      return NextResponse.json({ error: 'Invalid tool' }, { status: 400 });
    }

    let metadataJson: string | null = null;
    if (metadata !== undefined) {
      if (typeof metadata !== 'object' || metadata === null || Array.isArray(metadata)) {
        return NextResponse.json({ error: 'Invalid metadata' }, { status: 400 });
      }
      metadataJson = JSON.stringify(metadata);
      if (Buffer.byteLength(metadataJson, 'utf8') > EVENT_METADATA_MAX_BYTES) {
        return NextResponse.json({ error: 'Metadata too large' }, { status: 400 });
      }
    }

    try {
      const anonId = parseAnonId(request.cookies.get('np_anon')?.value);

      await insert({
        id: randomUUID(),
        name,
        tool: typeof tool === 'string' ? tool : null,
        anonId,
        metadata: metadataJson,
      });
    } catch (error) {
      logger.error('Failed to record event', error, { context: 'api/events' });
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    return NextResponse.json({ ok: true }, { status: 202 });
  };
}
