import { AiServiceError, type AiToolConfig, type AiToolId } from './types';
import {
  PROMPT_IMPROVER_MAX_INPUT_CHARS,
  PROMPT_IMPROVER_MAX_TOKENS,
  PROMPT_IMPROVER_SYSTEM_PROMPT,
} from './prompts/prompt-improver';
import {
  EMAIL_DRAFTER_MAX_INPUT_CHARS,
  EMAIL_DRAFTER_MAX_TOKENS,
  EMAIL_DRAFTER_SYSTEM_PROMPT,
} from './prompts/email-drafter';
import {
  SUMMARIZER_MAX_INPUT_CHARS,
  SUMMARIZER_MAX_TOKENS,
  SUMMARIZER_SYSTEM_PROMPT,
} from './prompts/summarizer';
import {
  MEETING_ACTIONS_MAX_INPUT_CHARS,
  MEETING_ACTIONS_MAX_TOKENS,
  MEETING_ACTIONS_SYSTEM_PROMPT,
} from './prompts/meeting-actions';
import {
  OUTPUT_CHECKER_MAX_INPUT_CHARS,
  OUTPUT_CHECKER_MAX_TOKENS,
  OUTPUT_CHECKER_SYSTEM_PROMPT,
} from './prompts/output-checker';

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
  'email-drafter': {
    maxTokens: EMAIL_DRAFTER_MAX_TOKENS,
    maxInputChars: EMAIL_DRAFTER_MAX_INPUT_CHARS,
    systemPrompt: EMAIL_DRAFTER_SYSTEM_PROMPT,
  },
  summarizer: {
    maxTokens: SUMMARIZER_MAX_TOKENS,
    maxInputChars: SUMMARIZER_MAX_INPUT_CHARS,
    systemPrompt: SUMMARIZER_SYSTEM_PROMPT,
  },
  'meeting-actions': {
    maxTokens: MEETING_ACTIONS_MAX_TOKENS,
    maxInputChars: MEETING_ACTIONS_MAX_INPUT_CHARS,
    systemPrompt: MEETING_ACTIONS_SYSTEM_PROMPT,
  },
  'output-checker': {
    maxTokens: OUTPUT_CHECKER_MAX_TOKENS,
    maxInputChars: OUTPUT_CHECKER_MAX_INPUT_CHARS,
    systemPrompt: OUTPUT_CHECKER_SYSTEM_PROMPT,
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
