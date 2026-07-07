import type { AiProvider } from './types';
import { createAnthropicProvider } from './providers/anthropic-provider';
import { createOpenAiProvider } from './providers/openai-provider';

/**
 * Provider selection is env-driven (AI_PROVIDER); adding a provider here
 * never touches call sites. Model names must match the provider
 * (e.g. AI_PROVIDER=openai pairs with AI_DEFAULT_MODEL=gpt-4o-mini).
 */
export function getProvider(): AiProvider {
  const provider = process.env.AI_PROVIDER?.trim().toLowerCase() || 'anthropic';

  switch (provider) {
    case 'anthropic':
      return createAnthropicProvider();
    case 'openai':
      return createOpenAiProvider();
    default:
      throw new Error(`Unsupported AI_PROVIDER: ${provider}`);
  }
}
