/**
 * @jest-environment node
 */
import { createOpenAiProvider } from '../providers/openai-provider';
import { AiServiceError, type GenerateTextRequest } from '../types';

const REQUEST: GenerateTextRequest = {
  model: 'gpt-4o-mini',
  maxTokens: 1024,
  system: 'You are a helpful assistant.',
  prompt: 'Improve this prompt: make me a website',
};

function fakeClient(response: unknown) {
  return { chat: { completions: { create: jest.fn().mockResolvedValue(response) } } };
}

function apiError(status: number): Error {
  return Object.assign(new Error(`API error ${status}`), { status });
}

describe('openai provider', () => {
  it('sends the request in OpenAI Chat Completions shape', async () => {
    const client = fakeClient({
      choices: [{ message: { content: 'improved' }, finish_reason: 'stop' }],
      usage: { prompt_tokens: 10, completion_tokens: 5 },
      model: 'gpt-4o-mini',
    });
    const provider = createOpenAiProvider({ client });

    await provider.generateText(REQUEST);

    expect(client.chat.completions.create).toHaveBeenCalledWith({
      model: 'gpt-4o-mini',
      max_completion_tokens: 1024,
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: REQUEST.prompt },
      ],
    });
  });

  it('maps message content, usage, model, and finish reason', async () => {
    const client = fakeClient({
      choices: [{ message: { content: 'part one part two' }, finish_reason: 'stop' }],
      usage: { prompt_tokens: 42, completion_tokens: 17 },
      model: 'gpt-4o-mini',
    });
    const provider = createOpenAiProvider({ client });

    const result = await provider.generateText(REQUEST);

    expect(result.text).toBe('part one part two');
    expect(result.inputTokens).toBe(42);
    expect(result.outputTokens).toBe(17);
    expect(result.model).toBe('gpt-4o-mini');
    expect(result.stopReason).toBe('stop');
  });

  it('returns empty text when the model returns no content', async () => {
    const client = fakeClient({
      choices: [{ message: { content: null }, finish_reason: 'stop' }],
      usage: { prompt_tokens: 1, completion_tokens: 0 },
      model: 'gpt-4o-mini',
    });
    const provider = createOpenAiProvider({ client });

    const result = await provider.generateText(REQUEST);

    expect(result.text).toBe('');
  });

  it('maps auth failures (401/403) to a 503 configuration error', async () => {
    const client = { chat: { completions: { create: jest.fn().mockRejectedValue(apiError(401)) } } };
    const provider = createOpenAiProvider({ client });

    await expect(provider.generateText(REQUEST)).rejects.toThrow(AiServiceError);
    await expect(provider.generateText(REQUEST)).rejects.toMatchObject({ status: 503 });
  });

  it('maps rate-limit (429) to 503', async () => {
    const client = { chat: { completions: { create: jest.fn().mockRejectedValue(apiError(429)) } } };
    const provider = createOpenAiProvider({ client });

    await expect(provider.generateText(REQUEST)).rejects.toMatchObject({ status: 503 });
  });

  it('maps other API failures to 502', async () => {
    const client = { chat: { completions: { create: jest.fn().mockRejectedValue(apiError(500)) } } };
    const provider = createOpenAiProvider({ client });

    await expect(provider.generateText(REQUEST)).rejects.toMatchObject({ status: 502 });
  });

  it('maps unexpected errors to 502', async () => {
    const client = { chat: { completions: { create: jest.fn().mockRejectedValue(new Error('boom')) } } };
    const provider = createOpenAiProvider({ client });

    await expect(provider.generateText(REQUEST)).rejects.toMatchObject({ status: 502 });
  });
});
