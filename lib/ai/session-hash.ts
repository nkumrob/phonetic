import { createHash } from 'node:crypto';
import type { NextRequest } from 'next/server';

/**
 * Anonymized per-visitor, per-day hash for usage metrics.
 * The raw IP is never stored — only a truncated sha256 digest, salted with
 * CSRF_SECRET and rotated daily so it cannot be reversed or tracked long-term.
 */
export function anonymousSessionHash(request: NextRequest): string {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';
  const day = new Date().toISOString().slice(0, 10);
  const salt = process.env.CSRF_SECRET || 'natophonetic-metrics';

  return createHash('sha256').update(`${ip}|${userAgent}|${day}|${salt}`).digest('hex').slice(0, 16);
}
