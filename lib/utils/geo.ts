import type { NextRequest } from 'next/server';

/**
 * Reads Vercel's geo headers from an incoming request.
 *
 * Country: `x-vercel-ip-country` — accepted only when it is exactly two
 *   uppercase A-Z letters (ISO 3166-1 alpha-2). Any other value → null.
 *
 * City: `x-vercel-ip-city` — URL-decoded (Vercel percent-encodes spaces),
 *   trimmed, max 80 chars. Decode failures or oversized values → null.
 *
 * Both fields are null in local dev (headers absent) and on malformed input.
 */
export function readGeo(request: NextRequest): { country: string | null; city: string | null } {
  return {
    country: parseCountry(request.headers.get('x-vercel-ip-country')),
    city: parseCity(request.headers.get('x-vercel-ip-city')),
  };
}

const COUNTRY_RE = /^[A-Z]{2}$/;
const CITY_MAX = 80;

function parseCountry(raw: string | null): string | null {
  if (!raw) return null;
  return COUNTRY_RE.test(raw) ? raw : null;
}

function parseCity(raw: string | null): string | null {
  if (!raw) return null;
  let decoded: string;
  try {
    decoded = decodeURIComponent(raw).trim();
  } catch {
    return null;
  }
  return decoded.length > CITY_MAX ? null : decoded;
}
