import { NextRequest, NextResponse } from 'next/server';
import { parseAnonId } from './lib/utils/anon-id';
import { ADMIN_COOKIE, verifySessionToken } from './lib/server/admin-session';

// ---------------------------------------------------------------------------
// Admin guard helpers
// ---------------------------------------------------------------------------

function isGuardedPage(pathname: string): boolean {
  return pathname.startsWith('/admin') && pathname !== '/admin/login' && !pathname.startsWith('/admin/login/');
}

function isGuardedApi(pathname: string, method: string): boolean {
  // /api/admin/* except /api/admin/session (and sub-paths of /api/admin/session)
  if (pathname.startsWith('/api/admin/') && !pathname.startsWith('/api/admin/session')) {
    return true;
  }
  // /api/reviews/* PATCH or DELETE only
  if (pathname.startsWith('/api/reviews/') && (method === 'PATCH' || method === 'DELETE')) {
    return true;
  }
  return false;
}

async function hasValidAdminSession(request: NextRequest): Promise<boolean> {
  const secret = process.env.ADMIN_SESSION_SECRET ?? '';
  const token = request.cookies.get(ADMIN_COOKIE)?.value;
  return verifySessionToken(token, secret);
}

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------

/**
 * Issues a durable anonymous visitor id (np_anon). Random UUID, no PII —
 * used for unique-visitor counts, event attribution, and progress sync.
 *
 * Also guards /admin pages, /api/admin/* endpoints, and review mutations
 * behind a verified np_admin session cookie.
 */
export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;
  const method = request.method;

  // -- Admin page guard --
  if (isGuardedPage(pathname)) {
    if (!(await hasValidAdminSession(request))) {
      return NextResponse.redirect(new URL('/admin/login', request.url), 307);
    }
  }

  // -- Admin API / review mutation guard --
  if (isGuardedApi(pathname, method)) {
    if (!(await hasValidAdminSession(request))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  // ---------------------------------------------------------------------------
  // Anonymous visitor id (np_anon) — unchanged logic below
  // ---------------------------------------------------------------------------
  const response = NextResponse.next();

  const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: 60 * 60 * 24 * 365,
    path: '/',
  };

  const existing = request.cookies.get('np_anon');
  const validId = existing ? parseAnonId(existing.value) : null;
  if (validId) {
    // Sliding renewal: re-set the validated UUID so the expiry window resets
    // from the current visit rather than the first visit.
    response.cookies.set('np_anon', validId, COOKIE_OPTIONS);
  } else {
    // No cookie, or the stored value is malformed — issue a fresh UUID.
    response.cookies.set('np_anon', globalThis.crypto.randomUUID(), COOKIE_OPTIONS);
  }

  return response;
}

export const config = {
  // Pages and APIs need the cookie; static assets do not.
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map)$).*)'],
};
