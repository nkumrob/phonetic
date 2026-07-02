import type { AiProvider } from './types';
import { createAnthropicProvider } from './providers/anthropic-provider';

/**
 * Provider selection is env-driven (AI_PROVIDER). Only 'anthropic' exists
 * today; this is the seam for adding others without touching call sites.
 */
export function getProvider(): AiProvider {
  const provider = process.env.AI_PROVIDER?.trim().toLowerCase() || 'anthropic';

  switch (provider) {
    case 'anthropic':
      return createAnthropicProvider();
    default:
      throw new Error(`Unsupported AI_PROVIDER: ${provider}`);
  }
}
