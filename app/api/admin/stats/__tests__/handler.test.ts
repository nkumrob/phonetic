/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { createStatsHandler } from '../handler';

function req(url: string) {
  return new NextRequest(url);
}

describe('stats handler factory', () => {
  it('passes a validated days param and returns the loader result', async () => {
    const load = jest.fn().mockResolvedValue({ hello: 'world' });
    const handler = createStatsHandler(load);

    const res = await handler(req('http://localhost/api/admin/stats/overview?days=7'));

    expect(load).toHaveBeenCalledWith(7);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ hello: 'world' });
  });

  it('defaults to 30 days and rejects out-of-set values', async () => {
    const load = jest.fn().mockResolvedValue({});
    const handler = createStatsHandler(load);

    await handler(req('http://localhost/api/admin/stats/overview'));
    expect(load).toHaveBeenCalledWith(30);

    expect((await handler(req('http://localhost/api/admin/stats/overview?days=13'))).status).toBe(400);
    expect((await handler(req('http://localhost/api/admin/stats/overview?days=abc'))).status).toBe(400);
  });

  it('maps loader failures to 500', async () => {
    const handler = createStatsHandler(jest.fn().mockRejectedValue(new Error('db down')));
    expect((await handler(req('http://localhost/api/admin/stats/overview?days=30'))).status).toBe(500);
  });
});
