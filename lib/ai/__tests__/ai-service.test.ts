/**
 * @jest-environment node
 */
import { runAiTool } from '../ai-service';
import { AiServiceError, type AiProvider } from '../types';

function fakeProvider() {
  const generateText = jest.fn().mockResolvedValue({
    text: 'Role: ...\n\nTask: ...',
    inputTokens: 120,
    outputTokens: 80,
    model: 'claude-haiku-4-5',
    stopReason: 'end_turn',
  });
  return { provider: { generateText } as AiProvider, generateText };
}

describe('runAiTool', () => {
  it('runs a known tool and returns text, usage, and latency', async () => {
    const { provider } = fakeProvider();

    const result = await runAiTool('prompt-improver', 'make me a website', { provider });

    expect(result.text).toContain('Role:');
    expect(result.inputTokens).toBe(120);
    expect(result.outputTokens).toBe(80);
    expect(result.model).toBe('claude-haiku-4-5');
    expect(result.latencyMs).toBeGreaterThanOrEqual(0);
  });

  it('passes tool config through to the provider', async () => {
    const { provider, generateText } = fakeProvider();

    await runAiTool('prompt-improver', '  make me a website  ', { provider });

    expect(generateText).toHaveBeenCalledWith(
      expect.objectContaining({
        model: 'claude-haiku-4-5',
        maxTokens: 1024,
        prompt: 'make me a website', // trimmed
        system: expect.stringContaining('prompt engineer'),
      })
    );
  });

  it('rejects empty input with 400', async () => {
    const { provider } = fakeProvider();

    await expect(runAiTool('prompt-improver', '   ', { provider })).rejects.toMatchObject({
      status: 400,
    });
  });

  it('rejects over-length input with 400', async () => {
    const { provider, generateText } = fakeProvider();

    await expect(
      runAiTool('prompt-improver', 'x'.repeat(2001), { provider })
    ).rejects.toMatchObject({ status: 400 });
    expect(generateText).not.toHaveBeenCalled();
  });

  it('rejects unknown tools with 404', async () => {
    const { provider } = fakeProvider();

    await expect(runAiTool('nope', 'hello', { provider })).rejects.toThrow(AiServiceError);
    await expect(runAiTool('nope', 'hello', { provider })).rejects.toMatchObject({ status: 404 });
  });
});