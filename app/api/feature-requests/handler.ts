import { randomUUID } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { insertFeatureRequest } from '@/lib/db/feature-requests-repo';
import { RateLimiter } from '@/lib/utils/rate-limit';
import { logger } from '@/lib/utils/logger';

interface LimiterLike {
  check(request: NextRequest): Promise<{ allowed: boolean; remaining: number; reset: Date }>;
}

export function createFeatureRequestHandler(deps?: {
  insert?: (data: {
    id: string;
    name: string | null;
    email: string | null;
    request: string;
  }) => Promise<void>;
  limiter?: LimiterLike;
}): (request: NextRequest) => Promise<NextResponse> {
  const insert = deps?.insert ?? insertFeatureRequest;
  const limiter: LimiterLike =
    deps?.limiter ??
    new RateLimiter({ keyPrefix: 'feature-requests', max: 10, windowMs: 15 * 60_000 });

  return async (request: NextRequest): Promise<NextResponse> => {
    // 1. Rate check
    const { allowed } = await limiter.check(request);
    if (!allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    // 2. Parse body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const raw = (body ?? {}) as Record<string, unknown>;

    // 3. Validate request field
    const rawRequest = raw['request'];
    if (typeof rawRequest !== 'string') {
      return NextResponse.json(
        { error: 'request must be between 10 and 2000 characters' },
        { status: 400 }
      );
    }
    const trimmedRequest = rawRequest.trim();
    if (trimmedRequest.length < 10 || trimmedRequest.length > 2000) {
      return NextResponse.json(
        { error: 'request must be between 10 and 2000 characters' },
        { status: 400 }
      );
    }

    // 4. Validate name (optional)
    let name: string | null = null;
    if (raw['name'] !== undefined && raw['name'] !== null) {
      const rawName = String(raw['name']).trim();
      if (rawName.length > 0) {
        if (rawName.length > 80) {
          return NextResponse.json(
            { error: 'name must be 80 characters or fewer' },
            { status: 400 }
          );
        }
        name = rawName;
      }
    }

    // 5. Validate email (optional)
    let email: string | null = null;
    if (raw['email'] !== undefined && raw['email'] !== null) {
      const rawEmail = String(raw['email']).trim();
      if (rawEmail.length > 0) {
        if (!rawEmail.includes('@')) {
          return NextResponse.json({ error: 'email is invalid' }, { status: 400 });
        }
        if (rawEmail.length > 120) {
          return NextResponse.json(
            { error: 'email must be 120 characters or fewer' },
            { status: 400 }
          );
        }
        email = rawEmail;
      }
    }

    // 6. Insert and return
    try {
      await insert({ id: randomUUID(), name, email, request: trimmedRequest });
      return NextResponse.json({ ok: true }, { status: 201 });
    } catch (error) {
      logger.error('Failed to insert feature request', error, { context: 'api/feature-requests' });
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  };
}
