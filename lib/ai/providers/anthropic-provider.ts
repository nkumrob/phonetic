import Anthropic from '@anthropic-ai/sdk';
import { logger } from '@/lib/utils/logger';
import { AiServiceError, type AiProvider, type GenerateTextRequest, type GenerateTextResult } from '../types';

/**
 * Minimal structural interface over the Anthropic SDK client so tests can
 * inject a plain-object fake (codebase convention: no jest.mock()).
 */
export interface AnthropicMessagesClient {
  messages: {
    create(params: {
      model: string;
      max_tokens: number;
      system: string;
      messages: Array<{ role: 'user'; content: string }>;
    }): Promise<unknown>;
  };
}

interface AnthropicMessageResponse {
  content: Array<{ type: string; text?: string }>;
  usage: { input_tokens: number; output_tokens: number };
  model: string;
  stop_reason: string | null;
}

export function createAnthropicProvider(options?: { client?: AnthropicMessagesClient }): AiProvider {
  let client = options?.client ?? null;

  function getClient(): AnthropicMessagesClient {
    if (client) return client;
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new AiServiceError('AI service is not configured', 503);
    }
    client = new Anthropic() as unknown as AnthropicMessagesClient;
    return client;
  }

  return {
    async generateText(request: GenerateTextRequest): Promise<GenerateTextResult> {
      let response: AnthropicMessageResponse;
      try {
        response = (await getClient().messages.create({
          model: request.model,
          max_tokens: request.maxTokens,
          system: request.system,
          messages: [{ role: 'user', content: request.prompt }],
        })) as AnthropicMessageResponse;
      } catch (error) {
        throw mapProviderError(error);
      }

      if (response.stop_reason === 'max_tokens') {
        logger.warn('AI response truncated at max_tokens', {
          context: 'anthropic-provider',
          metadata: { model: request.model, maxTokens: request.maxTokens },
        });
      }

      return {
        text: response.content
          .filter((block) => block.type === 'text' && typeof block.text === 'string')
          .map((block) => block.text)
          .join(''),
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
        model: response.model,
        stopReason: response.stop_reason,
      };
    },
  };
}

function mapProviderError(error: unknown): AiServiceError {
  if (error instanceof AiServiceError) return error;

  const status =
    error instanceof Anthropic.APIError || hasNumericStatus(error)
      ? (error as { status: number }).status
      : undefined;

  if (status === 401 || status === 403) {
    return new AiServiceError('AI service is not configured', 503);
  }
  if (status === 429 || status === 529) {
    return new AiServiceError('AI service is temporarily busy. Please try again shortly.', 503);
  }
  return new AiServiceError('AI service request failed', 502);
}

function hasNumericStatus(error: unknown): error is { status: number } {
  return typeof (error as { status?: unknown })?.status === 'number';
}
