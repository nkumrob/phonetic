import { NextRequest, NextResponse } from 'next/server';
import { getProgress, upsertProgress } from '@/lib/db/progress-repo';
import { parseAnonId } from '@/lib/utils/anon-id';
import { RateLimiter } from '@/lib/utils/rate-limit';
import { logger } from '@/lib/utils/logger';

export const PROGRESS_MAX_BYTES = 32 * 1024;

interface LimiterLike {
  check(request: NextRequest): Promise<{ allowed: boolean; remaining: number; reset: Date }>;
}

interface GetDeps {
  get?: (anonId: string) => Promise<string | null>;
}

interface PutDeps {
  upsert?: (anonId: string, data: string) => Promise<void>;
  limiter?: LimiterLike;
}

export function createProgressGetHandler(deps?: GetDeps) {
  const get = deps?.get ?? getProgress;

  return async (request: NextRequest): Promise<NextResponse> => {
    const anonId = parseAnonId(request.cookies.get('np_anon')?.value);
    if (!anonId) return NextResponse.json({ data: null });

    try {
      return NextResponse.json({ data: await get(anonId) });
    } catch (error) {
      logger.error('Failed to load progress', error, { context: 'api/progress' });
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  };
}

export function createProgressPutHandler(deps?: PutDeps) {
  const upsert = deps?.upsert ?? upsertProgress;
  // Rate-limit is in its own "progress" namespace so high-volume debounced
  // sync posts cannot consume other route quotas. Fire-and-forget clients
  // ignore 429s; X-RateLimit headers are intentionally omitted here.
  const limiter: LimiterLike =
    deps?.limiter ?? new RateLimiter({ keyPrefix: 'progress', max: 30, windowMs: 60_000 });

  return async (request: NextRequest): Promise<NextResponse> => {
    const { allowed } = await limiter.check(request);
    if (!allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const anonId = parseAnonId(request.cookies.get('np_anon')?.value);
    if (!anonId) return NextResponse.json({ error: 'Missing visitor id' }, { status: 400 });

    const raw = await request.text();
    if (Buffer.byteLength(raw, 'utf8') > PROGRESS_MAX_BYTES) {
      return NextResponse.json({ error: 'Payload too large' }, { status: 400 });
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      return NextResponse.json({ error: 'Progress must be a JSON object' }, { status: 400 });
    }

    try {
      await upsert(anonId, raw);
      return NextResponse.json({ ok: true });
    } catch (error) {
      logger.error('Failed to save progress', error, { context: 'api/progress' });
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  };
}
