import { NextRequest, NextResponse } from 'next/server';

/**
 * Issues a durable anonymous visitor id (np_anon). Random UUID, no PII —
 * used for unique-visitor counts, event attribution, and progress sync.
 */
export function middleware(request: NextRequest): NextResponse {
  const response = NextResponse.next();

  if (!request.cookies.get('np_anon')) {
    response.cookies.set('np_anon', globalThis.crypto.randomUUID(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365,
      path: '/',
    });
  }

  return response;
}

export const config = {
  // Pages and APIs need the cookie; static assets do not.
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map)$).*)'],
};
