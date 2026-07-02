/**
 * Shared types for the AI tools service layer.
 * Provider-agnostic: swapping models or providers is a config/env change,
 * never a code change (see lib/ai/config.ts and lib/ai/provider-factory.ts).
 */

export interface GenerateTextRequest {
  model: string;
  maxTokens: number;
  system: string;
  prompt: string;
}

export interface GenerateTextResult {
  text: string;
  inputTokens: number;
  outputTokens: number;
  model: string;
  stopReason: string | null;
}

export interface AiProvider {
  generateText(request: GenerateTextRequest): Promise<GenerateTextResult>;
}

export type AiToolId = 'prompt-improver';

export interface AiToolConfig {
  id: AiToolId;
  model: string;
  maxTokens: number;
  maxInputChars: number;
  systemPrompt: string;
}

export type TimeSavedBucket = '<1' | '1-5' | '5-15' | '15+';

export const TIME_SAVED_BUCKETS: TimeSavedBucket[] = ['<1', '1-5', '5-15', '15+'];

export class AiServiceError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message);
    this.name = 'AiServiceError';
  }
}
