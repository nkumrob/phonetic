/**
 * Pricing table for AI models, in USD per million tokens.
 *
 * To add a new model, append an entry:
 *   'model-id': { inputPerMTok: <price>, outputPerMTok: <price> }
 *
 * If a model that appears in tool_usage rows is missing from this table:
 *   - its byModel row shows estimatedCostUsd = null
 *   - the dashboard's totalCostUsd is also null (can't total incomplete data)
 */
export const MODEL_PRICES: Record<string, { inputPerMTok: number; outputPerMTok: number }> = {
  'claude-haiku-4-5': { inputPerMTok: 1, outputPerMTok: 5 },
  // gpt-5.4-nano: intentionally absent — add real prices when available.
};
