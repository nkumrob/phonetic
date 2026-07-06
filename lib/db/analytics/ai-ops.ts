/**
 * @module analytics/ai-ops
 * AI operations aggregates for the admin AI Ops page: per-model token/cost
 * breakdown, average latency, and time-saved vote distribution.
 *
 * Cost formula: (inputTokens / 1_000_000) * price.inputPerMTok
 *             + (outputTokens / 1_000_000) * price.outputPerMTok
 * Rounded to 4 decimal places.
 *
 * If any model used in the window lacks a price entry in MODEL_PRICES,
 * that row's estimatedCostUsd is null and totalCostUsd is also null.
 */

import { MODEL_PRICES } from '@/lib/constants/model-prices';
import { resolveDb, since, num, type DbLike } from './shared';

export interface AiOpsStats {
  byModel: Array<{
    model: string;
    conversations: number;
    inputTokens: number;
    outputTokens: number;
    /** null when the model has no entry in MODEL_PRICES */
    estimatedCostUsd: number | null;
  }>;
  /** null when ANY model used in the window lacks a price entry */
  totalCostUsd: number | null;
  avgLatencyMs: number;
  timeSavedDistribution: Array<{ bucket: string; votes: number }>;
}

export async function getAiOpsStats(
  days: number,
  deps?: { db?: DbLike },
): Promise<AiOpsStats> {
  const db = await resolveDb(deps);
  const s = since(days);

  const [byModel, latency, distribution] = await Promise.all([
    db.execute({
      sql: `select model,
            count(*) as conversations,
            coalesce(sum(input_tokens), 0) as input_tokens,
            coalesce(sum(output_tokens), 0) as output_tokens
          from tool_usage
          where created_at >= date('now', ?) and model is not null
          group by model`,
      args: [s],
    }),
    db.execute({
      sql: `select round(avg(latency_ms)) as avg_latency_ms
          from tool_usage
          where created_at >= date('now', ?) and latency_ms is not null`,
      args: [s],
    }),
    db.execute({
      sql: `select time_saved_bucket as bucket, count(*) as votes
          from tool_usage
          where time_saved_bucket is not null and created_at >= date('now', ?)
          group by bucket`,
      args: [s],
    }),
  ]);

  let hasUnpriced = false;
  let totalCost = 0;

  const modelRows = (byModel.rows as Array<Record<string, unknown>>).map((r) => {
    const model = String(r.model ?? '');
    const inputTokens = num(r.input_tokens);
    const outputTokens = num(r.output_tokens);
    const price = MODEL_PRICES[model];

    let estimatedCostUsd: number | null;
    if (!price) {
      hasUnpriced = true;
      estimatedCostUsd = null;
    } else {
      const cost =
        (inputTokens / 1_000_000) * price.inputPerMTok +
        (outputTokens / 1_000_000) * price.outputPerMTok;
      estimatedCostUsd = Math.round(cost * 10_000) / 10_000;
      totalCost += estimatedCostUsd;
    }

    return {
      model,
      conversations: num(r.conversations),
      inputTokens,
      outputTokens,
      estimatedCostUsd,
    };
  });

  const latRow = latency.rows[0] as Record<string, unknown> | undefined;

  return {
    byModel: modelRows,
    totalCostUsd: hasUnpriced ? null : Math.round(totalCost * 10_000) / 10_000,
    avgLatencyMs: num(latRow?.avg_latency_ms),
    timeSavedDistribution: (distribution.rows as Array<{ bucket: string; votes: unknown }>).map(
      (r) => ({ bucket: r.bucket, votes: num(r.votes) }),
    ),
  };
}
