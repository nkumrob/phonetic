/**
 * @jest-environment node
 */
import type { NextRequest } from 'next/server';
import { createAiToolHandler } from '../route';
import { AiServiceError } from '@/lib/ai/types';

function fakeRequest(pathname: string, body: unknown): NextRequest {
  return {
    nextUrl: { pathname },
    json: async () => body,
    headers: new Headers({ 'x-forwarded-for': '203.0.113.7', 'user-agent': 'jest' }),
  } as unknown as NextRequest;
}

const TOOL_RESULT = {
  text: 'Role: ...\n\nTask: ...',
  inputTokens: 120,
  outputTokens: 80,
  model: 'claude-haiku-4-5',
  latencyMs: 950,
};

describe('POST /api/ai/[tool]', () => {
  it('returns the tool output and a usageId, and records metrics', async () => {
    const runTool = jest.fn().mockResolvedValue(TOOL_RESULT);
    const record = jest.fn();
    const handler = createAiToolHandler({ runTool, record });

    const response = await handler(
      fakeRequest('/api/ai/prompt-improver', { input: 'make me a website' })
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.result.output).toBe(TOOL_RESULT.text);
    expect(payload.result.usageId).toMatch(/^[0-9a-f-]{36}$/);
    expect(runTool).toHaveBeenCalledWith('prompt-improver', 'make me a website');
    expect(record).toHaveBeenCalledWith(
      expect.objectContaining({
        id: payload.result.usageId,
        toolName: 'prompt-improver',
        model: 'claude-haiku-4-5',
        inputTokens: 120,
        outputTokens: 80,
        latencyMs: 950,
        sessionHash: expect.any(String),
      })
    );
    expect(response.headers.get('Cache-Control')).toContain('no-store');
  });

  it('maps AiServiceError status codes onto the response', async () => {
    const cases: Array<[AiServiceError, number]> = [
      [new AiServiceError('Input is required', 400), 400],
      [new AiServiceError('Unknown tool: nope', 404), 404],
      [new AiServiceError('AI service request failed', 502), 502],
      [new AiServiceError('AI service is not configured', 503), 503],
    ];

    for (const [error, expectedStatus] of cases) {
      const handler = createAiToolHandler({
        runTool: jest.fn().mockRejectedValue(error),
        record: jest.fn(),
      });

      const response = await handler(fakeRequest('/api/ai/prompt-improver', { input: 'x' }));

      expect(response.status).toBe(expectedStatus);
      expect((await response.json()).error).toBe(error.message);
    }
  });

  it('returns 400 on a malformed JSON body', async () => {
    const handler = createAiToolHandler({ runTool: jest.fn(), record: jest.fn() });
    const request = {
      nextUrl: { pathname: '/api/ai/prompt-improver' },
      json: async () => {
        throw new Error('bad json');
      },
      headers: new Headers(),
    } as unknown as NextRequest;

    const response = await handler(request);

    expect(response.status).toBe(400);
  });

  it('returns 500 with a generic message on unexpected errors', async () => {
    const handler = createAiToolHandler({
      runTool: jest.fn().mockRejectedValue(new Error('kaboom')),
      record: jest.fn(),
    });

    const response = await handler(fakeRequest('/api/ai/prompt-improver', { input: 'x' }));

    expect(response.status).toBe(500);
    expect((await response.json()).error).toBe('Internal server error');
  });

  it('does not record metrics when the tool fails', async () => {
    const record = jest.fn();
    const handler = createAiToolHandler({
      runTool: jest.fn().mockRejectedValue(new AiServiceError('Input is required', 400)),
      record,
    });

    await handler(fakeRequest('/api/ai/prompt-improver', { input: '' }));

    expect(record).not.toHaveBeenCalled();
  });
});