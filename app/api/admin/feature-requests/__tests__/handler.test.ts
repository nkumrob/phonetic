/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { createAdminFeatureRequestsHandler } from '../handler';

const SAMPLE_REQUEST = {
  id: 'fr-1',
  name: 'Alice',
  email: 'alice@example.com',
  request: 'Add dark mode',
  createdAt: '2026-07-01T10:00:00Z',
};

function makeGetRequest(search = '') {
  const url = `http://localhost/api/admin/feature-requests${search ? `?${search}` : ''}`;
  return new NextRequest(url, { method: 'GET' });
}

describe('GET /api/admin/feature-requests', () => {
  it('200: default limit calls list with 100', async () => {
    const list = jest.fn().mockResolvedValue([SAMPLE_REQUEST]);
    const handler = createAdminFeatureRequestsHandler({ list });

    const res = await handler(makeGetRequest());

    expect(res.status).toBe(200);
    expect(list).toHaveBeenCalledWith(100);
    const body = await res.json() as { requests: typeof SAMPLE_REQUEST[] };
    expect(body.requests).toHaveLength(1);
  });

  it('200: ?limit=50 calls list with 50', async () => {
    const list = jest.fn().mockResolvedValue([]);
    const handler = createAdminFeatureRequestsHandler({ list });

    const res = await handler(makeGetRequest('limit=50'));

    expect(res.status).toBe(200);
    expect(list).toHaveBeenCalledWith(50);
  });

  it('200: ?limit=600 clamps to 500', async () => {
    const list = jest.fn().mockResolvedValue([]);
    const handler = createAdminFeatureRequestsHandler({ list });

    const res = await handler(makeGetRequest('limit=600'));

    expect(res.status).toBe(200);
    expect(list).toHaveBeenCalledWith(500);
  });

  it('200: ?limit=0 clamps to 1', async () => {
    const list = jest.fn().mockResolvedValue([]);
    const handler = createAdminFeatureRequestsHandler({ list });

    const res = await handler(makeGetRequest('limit=0'));

    expect(res.status).toBe(200);
    expect(list).toHaveBeenCalledWith(1);
  });

  it('500: list throws returns 500', async () => {
    const list = jest.fn().mockRejectedValue(new Error('DB down'));
    const handler = createAdminFeatureRequestsHandler({ list });

    const res = await handler(makeGetRequest());

    expect(res.status).toBe(500);
  });
});
