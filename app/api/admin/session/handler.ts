import { timingSafeEqual } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_COOKIE, SESSION_TTL_MS, createSessionToken } from '@/lib/server/admin-session';
import { RateLimiter } from '@/lib/utils/rate-limit';
import { logger } from '@/lib/utils/logger';

interface LimiterLike {
  check(request: NextRequest): Promise<{ allowed: boolean; remaining: number; reset: Date }>;
}

interface AdminEnv {
  password: string;
  secret: string;
}

interface LoginDeps {
  limiter?: LimiterLike;
  env?: AdminEnv;
}

function envFromProcess(): AdminEnv {
  return {
    password: process.env.ADMIN_PASSWORD ?? '',
    secret: process.env.ADMIN_SESSION_SECRET ?? '',
  };
}

function passwordsMatch(supplied: string, expected: string): boolean {
  const a = Buffer.from(supplied);
  const b = Buffer.from(expected);
  if (a.length === b.length) {
    return timingSafeEqual(a, b);
  }
  // Run a dummy compare to avoid timing leaks on length difference
  timingSafeEqual(a, Buffer.from(supplied));
  return false;
}

export function createLoginHandler(deps?: LoginDeps) {
  const limiter: LimiterLike =
    deps?.limiter ?? new RateLimiter({ keyPrefix: 'admin-login', max: 5, windowMs: 15 * 60_000 });

  return async (request: NextRequest): Promise<NextResponse> => {
    const { allowed } = await limiter.check(request);
    if (!allowed) {
      return NextResponse.json({ error: 'Too many attempts. Try again later.' }, { status: 429 });
    }

    const env = deps?.env ?? envFromProcess();
    if (!env.password || !env.secret) {
      logger.error('Admin login attempted but ADMIN_PASSWORD/ADMIN_SESSION_SECRET not set', undefined, {
        context: 'api/admin/session',
      });
      return NextResponse.json({ error: 'Admin access is not configured' }, { status: 503 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }
    const password = (body as { password?: unknown })?.password;
    if (typeof password !== 'string' || password.length === 0) {
      return NextResponse.json({ error: 'Password required' }, { status: 400 });
    }

    if (!passwordsMatch(password, env.password)) {
      return NextResponse.json({ error: 'Incorrect password' }, { status: 401 });
    }

    const response = NextResponse.json({ ok: true });
    response.cookies.set(ADMIN_COOKIE, await createSessionToken(env.secret), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_TTL_MS / 1000,
      path: '/',
    });
    return response;
  };
}

export function createLogoutHandler() {
  return async (): Promise<NextResponse> => {
    const response = NextResponse.json({ ok: true });
    response.cookies.set(ADMIN_COOKIE, '', { httpOnly: true, maxAge: 0, path: '/' });
    return response;
  };
}
