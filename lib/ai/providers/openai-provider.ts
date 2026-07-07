import OpenAI from 'openai';
import { logger } from '@/lib/utils/logger';
import { AiServiceError, type AiProvider, type GenerateTextRequest, type GenerateTextResult } from '../types';

/**
 * Minimal structural interface over the OpenAI SDK client so tests can
 * inject a plain-object fake (codebase convention: no jest.mock()).
 */
export interface OpenAiChatClient {
  chat: {
    completions: {
      create(params: {
        model: string;
        max_completion_tokens: number;
        messages: Array<{ role: 'system' | 'user'; content: string }>;
      }): Promise<unknown>;
    };
  };
}

interface OpenAiChatResponse {
  choices: Array<{ message: { content: string | null }; finish_reason: string | null }>;
  usage: { prompt_tokens: number; completion_tokens: number };
  model: string;
}

export function createOpenAiProvider(options?: { client?: OpenAiChatClient }): AiProvider {
  let client = options?.client ?? null;

  function getClient(): OpenAiChatClient {
    if (client) return client;
    if (!process.env.OPENAI_API_KEY) {
      throw new AiServiceError('AI service is not configured', 503);
    }
    client = new OpenAI() as unknown as OpenAiChatClient;
    return client;
  }

  return {
    async generateText(request: GenerateTextRequest): Promise<GenerateTextResult> {
      let response: OpenAiChatResponse;
      try {
        response = (await getClient().chat.completions.create({
          model: request.model,
          max_completion_tokens: request.maxTokens,
          messages: [
            { role: 'system', content: request.system },
            { role: 'user', content: request.prompt },
          ],
        })) as OpenAiChatResponse;
      } catch (error) {
        throw mapProviderError(error);
      }

      const choice = response.choices[0];

      if (choice?.finish_reason === 'length') {
        logger.warn('AI response truncated at max_tokens', {
          context: 'openai-provider',
          metadata: { model: request.model, maxTokens: request.maxTokens },
        });
      }

      return {
        text: choice?.message.content ?? '',
        inputTokens: response.usage.prompt_tokens,
        outputTokens: response.usage.completion_tokens,
        model: response.model,
        stopReason: choice?.finish_reason ?? null,
      };
    },
  };
}

function mapProviderError(error: unknown): AiServiceError {
  if (error instanceof AiServiceError) return error;

  const status =
    error instanceof OpenAI.APIError || hasNumericStatus(error)
      ? (error as { status: number }).status
      : undefined;

  if (status === 401 || status === 403) {
    return new AiServiceError('AI service is not configured', 503);
  }
  if (status === 429) {
    return new AiServiceError('AI service is temporarily busy. Please try again shortly.', 503);
  }
  return new AiServiceError('AI service request failed', 502);
}

function hasNumericStatus(error: unknown): error is { status: number } {
  return typeof (error as { status?: unknown })?.status === 'number';
}
