import { AiServiceError, type AiToolConfig, type AiToolId } from './types';
import {
  PROMPT_IMPROVER_MAX_INPUT_CHARS,
  PROMPT_IMPROVER_MAX_TOKENS,
  PROMPT_IMPROVER_SYSTEM_PROMPT,
} from './prompts/prompt-improver';

const FALLBACK_MODEL = 'claude-haiku-4-5';

interface ToolDefinition {
  maxTokens: number;
  maxInputChars: number;
  systemPrompt: string;
}

const TOOL_DEFINITIONS: Record<AiToolId, ToolDefinition> = {
  'prompt-improver': {
    maxTokens: PROMPT_IMPROVER_MAX_TOKENS,
    maxInputChars: PROMPT_IMPROVER_MAX_INPUT_CHARS,
    systemPrompt: PROMPT_IMPROVER_SYSTEM_PROMPT,
  },
};

export function isKnownTool(toolId: string): toolId is AiToolId {
  return toolId in TOOL_DEFINITIONS;
}

/**
 * Model resolution order (first non-empty wins):
 *   1. AI_MODEL_<TOOL_ID> (e.g. AI_MODEL_PROMPT_IMPROVER)
 *   2. AI_DEFAULT_MODEL
 *   3. built-in fallback
 * Swapping models is always an env change, never a code change.
 */
function resolveModel(toolId: AiToolId): string {
  const perToolKey = `AI_MODEL_${toolId.toUpperCase().replace(/-/g, '_')}`;
  return (
    nonEmpty(process.env[perToolKey]) ?? nonEmpty(process.env.AI_DEFAULT_MODEL) ?? FALLBACK_MODEL
  );
}

function nonEmpty(value: string | undefined): string | undefined {
  return value && value.trim().length > 0 ? value : undefined;
}

export function getToolConfig(toolId: string): AiToolConfig {
  if (!isKnownTool(toolId)) {
    throw new AiServiceError(`Unknown tool: ${toolId}`, 404);
  }

  return {
    id: toolId,
    model: resolveModel(toolId),
    ...TOOL_DEFINITIONS[toolId],
  };
}
