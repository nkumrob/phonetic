import { improvePrompt, submitTimeSaved } from '../ai-tool-service';

describe('ai-tool-service', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  describe('improvePrompt', () => {
    it('posts the input and returns the improved prompt and usageId', async () => {
      const fetchMock = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ result: { output: 'Task: build a website', usageId: 'uuid-1' } }),
      });
      global.fetch = fetchMock as unknown as typeof fetch;

      const result = await improvePrompt('make me a website');

      expect(fetchMock).toHaveBeenCalledWith('/api/ai/prompt-improver', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: 'make me a website' }),
      });
      expect(result).toEqual({ improvedPrompt: 'Task: build a website', usageId: 'uuid-1' });
    });

    it('throws the server error message on failure', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ error: 'AI service is temporarily busy. Please try again shortly.' }),
      }) as unknown as typeof fetch;

      await expect(improvePrompt('x')).rejects.toThrow(
        'AI service is temporarily busy. Please try again shortly.'
      );
    });

    it('throws a fallback message when the error body is unreadable', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        json: async () => {
          throw new Error('not json');
        },
      }) as unknown as typeof fetch;

      await expect(improvePrompt('x')).rejects.toThrow('Failed to improve prompt');
    });
  });

  describe('submitTimeSaved', () => {
    it('posts the bucket for a usage id', async () => {
      const fetchMock = jest.fn().mockResolvedValue({ ok: true, json: async () => ({}) });
      global.fetch = fetchMock as unknown as typeof fetch;

      await submitTimeSaved('uuid-1', '1-5');

      expect(fetchMock).toHaveBeenCalledWith('/api/ai/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usageId: 'uuid-1', timeSavedBucket: '1-5' }),
      });
    });

    it('swallows network errors silently', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('offline')) as unknown as typeof fetch;

      await expect(submitTimeSaved('uuid-1', '15+')).resolves.toBeUndefined();
    });
  });
});
