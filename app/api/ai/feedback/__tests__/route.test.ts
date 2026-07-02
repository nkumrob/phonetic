/**
 * @jest-environment node
 */
import type { NextRequest } from 'next/server';
import { createFeedbackHandler } from '../handler';

function fakeRequest(body: unknown): NextRequest {
  return {
    json: async () => body,
    headers: new Headers(),
  } as unknown as NextRequest;
}

const USAGE_ID = '5b0c1f9e-9f2a-4a3b-8c1d-2e3f4a5b6c7d';

describe('POST /api/ai/feedback', () => {
  it('records a valid time-saved bucket', async () => {
    const record = jest.fn().mockResolvedValue(true);
    const handler = createFeedbackHandler({ record });

    const response = await handler(fakeRequest({ usageId: USAGE_ID, timeSavedBucket: '1-5' }));

    expect(response.status).toBe(200);
    expect((await response.json()).result.recorded).toBe(true);
    expect(record).toHaveBeenCalledWith(USAGE_ID, '1-5');
  });

  it('returns 400 when fields are missing or wrong type', async () => {
    const record = jest.fn();
    const handler = createFeedbackHandler({ record });

    for (const body of [{}, { usageId: USAGE_ID }, { usageId: 5, timeSavedBucket: '1-5' }, null]) {
      const response = await handler(fakeRequest(body));
      expect(response.status).toBe(400);
    }
    expect(record).not.toHaveBeenCalled();
  });

  it('returns 400 when the recorder rejects the input', async () => {
    const record = jest.fn().mockResolvedValue(false);
    const handler = createFeedbackHandler({ record });

    const response = await handler(fakeRequest({ usageId: 'nope', timeSavedBucket: 'lots' }));

    expect(response.status).toBe(400);
  });
});