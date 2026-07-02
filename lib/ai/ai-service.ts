import { getToolConfig } from './config';
import { getProvider } from './provider-factory';
import { AiServiceError, type AiProvider } from './types';

export interface RunAiToolResult {
  text: string;
  inputTokens: number;
  outputTokens: number;
  model: string;
  latencyMs: number;
}

/**
 * Validates input against the tool's config and runs it through the
 * configured provider. Provider is injectable for tests.
 */
export async function runAiTool(
  toolId: string,
  input: string,
  deps?: { provider?: AiProvider }
): Promise<RunAiToolResult> {
  const config = getToolConfig(toolId);

  const trimmed = typeof input === 'string' ? input.trim() : '';
  if (!trimmed) {
    throw new AiServiceError('Input is required', 400);
  }
  if (trimmed.length > config.maxInputChars) {
    throw new AiServiceError(
      `Input exceeds ${config.maxInputChars.toLocaleString()} characters`,
      400
    );
  }

  const provider = deps?.provider ?? getProvider();
  const startedAt = Date.now();

  const result = await provider.generateText({
    model: config.model,
    maxTokens: config.maxTokens,
    system: config.systemPrompt,
    prompt: trimmed,
  });

  return {
    text: result.text,
    inputTokens: result.inputTokens,
    outputTokens: result.outputTokens,
    model: result.model,
    latencyMs: Date.now() - startedAt,
  };
}
