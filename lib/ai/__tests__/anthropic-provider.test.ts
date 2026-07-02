/**
 * @jest-environment node
 */
import { createAnthropicProvider } from '../providers/anthropic-provider';
import { AiServiceError, type GenerateTextRequest } from '../types';

const REQUEST: GenerateTextRequest = {
  model: 'claude-haiku-4-5',
  maxTokens: 1024,
  system: 'You are a helpful assistant.',
  prompt: 'Improve this prompt: make me a website',
};

function fakeClient(response: unknown) {
  return { messages: { create: jest.fn().mockResolvedValue(response) } };
}

function apiError(status: number): Error {
  return Object.assign(new Error(`API error ${status}`), { status });
}

describe('anthropic provider', () => {
  it('sends the request in Anthropic Messages API shape', async () => {
    const client = fakeClient({
      content: [{ type: 'text', text: 'improved' }],
      usage: { input_tokens: 10, output_tokens: 5 },
      model: 'claude-haiku-4-5',
      stop_reason: 'end_turn',
    });
    const provider = createAnthropicProvider({ client });

    await provider.generateText(REQUEST);

    expect(client.messages.create).toHaveBeenCalledWith({
      model: 'claude-haiku-4-5',
      max_tokens: 1024,
      system: 'You are a helpful assistant.',
      messages: [{ role: 'user', content: REQUEST.prompt }],
    });
  });

  it('joins only text blocks and maps usage', async () => {
    const client = fakeClient({
      content: [
        { type: 'text', text: 'part one ' },
        { type: 'tool_use', id: 'x', name: 'y', input: {} },
        { type: 'text', text: 'part two' },
      ],
      usage: { input_tokens: 42, output_tokens: 17 },
      model: 'claude-haiku-4-5',
      stop_reason: 'end_turn',
    });
    const provider = createAnthropicProvider({ client });

    const result = await provider.generateText(REQUEST);

    expect(result.text).toBe('part one part two');
    expect(result.inputTokens).toBe(42);
    expect(result.outputTokens).toBe(17);
    expect(result.model).toBe('claude-haiku-4-5');
    expect(result.stopReason).toBe('end_turn');
  });

  it('maps auth failures (401/403) to a 503 configuration error', async () => {
    const client = { messages: { create: jest.fn().mockRejectedValue(apiError(401)) } };
    const provider = createAnthropicProvider({ client });

    await expect(provider.generateText(REQUEST)).rejects.toThrow(AiServiceError);
    await expect(provider.generateText(REQUEST)).rejects.toMatchObject({ status: 503 });
  });

  it('maps rate-limit (429) and overload (529) to 503', async () => {
    for (const status of [429, 529]) {
      const client = { messages: { create: jest.fn().mockRejectedValue(apiError(status)) } };
      const provider = createAnthropicProvider({ client });

      await expect(provider.generateText(REQUEST)).rejects.toMatchObject({ status: 503 });
    }
  });

  it('maps other API failures to 502', async () => {
    const client = { messages: { create: jest.fn().mockRejectedValue(apiError(500)) } };
    const provider = createAnthropicProvider({ client });

    await expect(provider.generateText(REQUEST)).rejects.toMatchObject({ status: 502 });
  });

  it('maps unexpected errors to 502', async () => {
    const client = { messages: { create: jest.fn().mockRejectedValue(new Error('boom')) } };
    const provider = createAnthropicProvider({ client });

    await expect(provider.generateText(REQUEST)).rejects.toMatchObject({ status: 502 });
  });
});