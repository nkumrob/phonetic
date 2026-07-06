/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { createEventsHandler } from '../handler';

function makeRequest(body: unknown, cookie?: string) {
  return new NextRequest('http://localhost/api/events', {
    method: 'POST',
    body: typeof body === 'string' ? body : JSON.stringify(body),
    headers: cookie ? { cookie: `np_anon=${cookie}` } : {},
  });
}

const allow = { check: jest.fn().mockResolvedValue({ allowed: true, remaining: 9, reset: new Date() }) };

describe('POST /api/events', () => {
  it('records a valid event with anon id from cookie and returns 202', async () => {
    const insert = jest.fn().mockResolvedValue(undefined);
    const handler = createEventsHandler({ insert, limiter: allow });

    const res = await handler(makeRequest({ name: 'converter_use', tool: 'phonetic-converter' }, 'anon-123'));

    expect(res.status).toBe(202);
    const event = insert.mock.calls[0][0];
    expect(event).toMatchObject({ name: 'converter_use', tool: 'phonetic-converter', anonId: 'anon-123' });
    expect(event.id).toMatch(/^[0-9a-f-]{36}$/);
  });

  it('serializes metadata objects to JSON', async () => {
    const insert = jest.fn().mockResolvedValue(undefined);
    const handler = createEventsHandler({ insert, limiter: allow });

    await handler(makeRequest({ name: 'practice_session', metadata: { mode: 'challenge' } }));

    expect(insert.mock.calls[0][0].metadata).toBe('{"mode":"challenge"}');
    expect(insert.mock.calls[0][0].anonId).toBeNull();
  });

  it('rejects unknown event names with 400 and does not insert', async () => {
    const insert = jest.fn();
    const handler = createEventsHandler({ insert, limiter: allow });

    const res = await handler(makeRequest({ name: 'drop_table' }));

    expect(res.status).toBe(400);
    expect(insert).not.toHaveBeenCalled();
  });

  it('rejects invalid JSON with 400', async () => {
    const handler = createEventsHandler({ insert: jest.fn(), limiter: allow });
    expect((await handler(makeRequest('{not json'))).status).toBe(400);
  });

  it('rejects oversized metadata with 400', async () => {
    const insert = jest.fn();
    const handler = createEventsHandler({ insert, limiter: allow });

    const res = await handler(makeRequest({ name: 'page_view', metadata: { pad: 'x'.repeat(600) } }));

    expect(res.status).toBe(400);
    expect(insert).not.toHaveBeenCalled();
  });

  it('rejects over-long tool identifiers with 400', async () => {
    const handler = createEventsHandler({ insert: jest.fn(), limiter: allow });
    const res = await handler(makeRequest({ name: 'page_view', tool: 'x'.repeat(101) }));
    expect(res.status).toBe(400);
  });

  it('returns 429 when rate limited', async () => {
    const limiter = { check: jest.fn().mockResolvedValue({ allowed: false, remaining: 0, reset: new Date() }) };
    const handler = createEventsHandler({ insert: jest.fn(), limiter });
    expect((await handler(makeRequest({ name: 'page_view' }))).status).toBe(429);
  });

  it('returns 500 when the insert fails', async () => {
    const insert = jest.fn().mockRejectedValue(new Error('db down'));
    const handler = createEventsHandler({ insert, limiter: allow });
    expect((await handler(makeRequest({ name: 'page_view' }))).status).toBe(500);
  });
});
