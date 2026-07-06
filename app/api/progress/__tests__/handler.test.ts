/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { createProgressGetHandler, createProgressPutHandler } from '../handler';

const ANON = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

function makeRequest(method: 'GET' | 'PUT', body?: string, cookie?: string) {
  return new NextRequest('http://localhost/api/progress', {
    method,
    ...(body !== undefined ? { body } : {}),
    headers: cookie ? { cookie: `np_anon=${cookie}` } : {},
  });
}

const allow = { check: jest.fn().mockResolvedValue({ allowed: true, remaining: 29, reset: new Date() }) };

describe('GET /api/progress', () => {
  it('returns stored data for the cookie holder', async () => {
    const get = jest.fn().mockResolvedValue('{"timeSavedMinutes":10}');
    const handler = createProgressGetHandler({ get });

    const res = await handler(makeRequest('GET', undefined, ANON));

    expect(get).toHaveBeenCalledWith(ANON);
    expect(await res.json()).toEqual({ data: '{"timeSavedMinutes":10}' });
  });

  it('returns null data without a cookie (no lookup)', async () => {
    const get = jest.fn();
    const handler = createProgressGetHandler({ get });

    const res = await handler(makeRequest('GET'));

    expect(get).not.toHaveBeenCalled();
    expect(await res.json()).toEqual({ data: null });
  });

  it('treats a junk cookie like a missing one', async () => {
    const get = jest.fn();
    const handler = createProgressGetHandler({ get });

    const res = await handler(makeRequest('GET', undefined, 'anon-123'));

    expect(get).not.toHaveBeenCalled();
    expect(await res.json()).toEqual({ data: null });
  });

  it('returns 500 when the repo lookup fails', async () => {
    const get = jest.fn().mockRejectedValue(new Error('db down'));
    const handler = createProgressGetHandler({ get });

    const res = await handler(makeRequest('GET', undefined, ANON));

    expect(res.status).toBe(500);
  });
});

describe('PUT /api/progress', () => {
  it('upserts valid JSON for the cookie holder', async () => {
    const upsert = jest.fn().mockResolvedValue(undefined);
    const handler = createProgressPutHandler({ upsert, limiter: allow });

    const res = await handler(makeRequest('PUT', '{"timeSavedMinutes":13,"toolHistory":{}}', ANON));

    expect(res.status).toBe(200);
    expect(upsert).toHaveBeenCalledWith(ANON, '{"timeSavedMinutes":13,"toolHistory":{}}');
  });

  it('rejects requests without a valid cookie', async () => {
    const handler = createProgressPutHandler({ upsert: jest.fn(), limiter: allow });
    expect((await handler(makeRequest('PUT', '{}'))).status).toBe(400);
    expect((await handler(makeRequest('PUT', '{}', 'anon-123'))).status).toBe(400);
  });

  it('rejects non-object payloads', async () => {
    const handler = createProgressPutHandler({ upsert: jest.fn(), limiter: allow });
    expect((await handler(makeRequest('PUT', '"just a string"', ANON))).status).toBe(400);
    expect((await handler(makeRequest('PUT', '{broken', ANON))).status).toBe(400);
  });

  it('rejects payloads over 32 KB', async () => {
    const handler = createProgressPutHandler({ upsert: jest.fn(), limiter: allow });
    const big = JSON.stringify({ pad: 'x'.repeat(33 * 1024) });
    expect((await handler(makeRequest('PUT', big, ANON))).status).toBe(400);
  });

  it('returns 500 when the upsert fails', async () => {
    const upsert = jest.fn().mockRejectedValue(new Error('db down'));
    const handler = createProgressPutHandler({ upsert, limiter: allow });
    expect((await handler(makeRequest('PUT', '{}', ANON))).status).toBe(500);
  });

  it('returns 429 when rate limited', async () => {
    const deny = { check: jest.fn().mockResolvedValue({ allowed: false, remaining: 0, reset: new Date() }) };
    const handler = createProgressPutHandler({ upsert: jest.fn(), limiter: deny });
    expect((await handler(makeRequest('PUT', '{}'))).status).toBe(429);
  });
});
