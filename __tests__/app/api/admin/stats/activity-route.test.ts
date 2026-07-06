/**
 * @jest-environment node
 */
import { parseActivityLimit } from '@/app/api/admin/stats/activity/parse-limit';
import { createActivityHandler } from '@/app/api/admin/stats/activity/route';
import {
  ACTIVITY_DEFAULT_LIMIT,
  ACTIVITY_MIN_LIMIT,
  ACTIVITY_MAX_LIMIT,
} from '@/lib/db/analytics/activity';
import { NextRequest } from 'next/server';

// ---------------------------------------------------------------------------
// parseActivityLimit — pure unit tests
// ---------------------------------------------------------------------------

describe('parseActivityLimit — silent clamping', () => {
  it('defaults to 50 for a missing param', () => {
    expect(parseActivityLimit(null)).toBe(ACTIVITY_DEFAULT_LIMIT);
  });

  it('defaults to 50 for an empty-string param (treated as absent)', () => {
    expect(parseActivityLimit('')).toBe(ACTIVITY_DEFAULT_LIMIT);
  });

  it('defaults to 50 for a non-numeric value', () => {
    expect(parseActivityLimit('abc')).toBe(ACTIVITY_DEFAULT_LIMIT);
  });

  it('clamps values above the max down to 200', () => {
    expect(parseActivityLimit('999')).toBe(ACTIVITY_MAX_LIMIT);
  });

  it('clamps values below the min up to 1', () => {
    expect(parseActivityLimit('-5')).toBe(ACTIVITY_MIN_LIMIT);
  });

  it('floors non-integer values', () => {
    expect(parseActivityLimit('12.9')).toBe(12);
  });

  it('passes valid in-range integers through', () => {
    expect(parseActivityLimit('75')).toBe(75);
  });

  it('returns 1 for the boundary value "1"', () => {
    expect(parseActivityLimit('1')).toBe(ACTIVITY_MIN_LIMIT);
  });

  it('returns 200 for the boundary value "200"', () => {
    expect(parseActivityLimit('200')).toBe(ACTIVITY_MAX_LIMIT);
  });
});

// ---------------------------------------------------------------------------
// Route glue tests — createActivityHandler with injectable loader
// ---------------------------------------------------------------------------

/** Build a NextRequest with the given search params for the activity endpoint. */
function makeRequest(search: string): NextRequest {
  return new NextRequest(`http://localhost/api/admin/stats/activity${search}`);
}

describe('createActivityHandler — route glue', () => {
  it('returns 200 with loader result when loader resolves', async () => {
    const mockData = [{ at: '2025-01-01T00:00:00Z', kind: 'event', name: 'test', tool: null, anonShort: null, country: null }];
    const loader = jest.fn().mockResolvedValue(mockData);

    const handler = createActivityHandler(loader);
    const res = await handler(makeRequest(''));

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(mockData);
  });

  it('passes the clamped limit to the loader', async () => {
    const loader = jest.fn().mockResolvedValue([]);

    const handler = createActivityHandler(loader);
    await handler(makeRequest('?limit=25'));

    expect(loader).toHaveBeenCalledWith(25);
  });

  it('defaults the loader call to 50 when limit is absent', async () => {
    const loader = jest.fn().mockResolvedValue([]);

    const handler = createActivityHandler(loader);
    await handler(makeRequest(''));

    expect(loader).toHaveBeenCalledWith(ACTIVITY_DEFAULT_LIMIT);
  });

  it('defaults the loader call to 50 when limit is an empty string', async () => {
    const loader = jest.fn().mockResolvedValue([]);

    const handler = createActivityHandler(loader);
    await handler(makeRequest('?limit='));

    expect(loader).toHaveBeenCalledWith(ACTIVITY_DEFAULT_LIMIT);
  });

  it('clamps limit=999 to 200 before passing to loader', async () => {
    const loader = jest.fn().mockResolvedValue([]);

    const handler = createActivityHandler(loader);
    await handler(makeRequest('?limit=999'));

    expect(loader).toHaveBeenCalledWith(ACTIVITY_MAX_LIMIT);
  });

  it('clamps limit=0 to 1 before passing to loader', async () => {
    const loader = jest.fn().mockResolvedValue([]);

    const handler = createActivityHandler(loader);
    await handler(makeRequest('?limit=0'));

    expect(loader).toHaveBeenCalledWith(ACTIVITY_MIN_LIMIT);
  });

  it('returns 500 with error body when loader throws', async () => {
    const loader = jest.fn().mockRejectedValue(new Error('db down'));

    const handler = createActivityHandler(loader);
    const res = await handler(makeRequest(''));

    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: 'Internal server error' });
  });
});
