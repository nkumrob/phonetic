import { logger } from '@/lib/utils/logger';
import { TIME_SAVED_BUCKETS, type TimeSavedBucket } from './types';

/**
 * Usage-metrics logging. Fire-and-forget by design: an AI response must
 * never fail because metrics logging failed. The db client is imported
 * lazily so the AI route works even when Turso is not configured.
 */

export interface DbLike {
  execute(stmt: { sql: string; args: unknown[] }): Promise<unknown>;
}

export interface ToolUsageEntry {
  id: string;
  toolName: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  latencyMs: number;
  sessionHash: string;
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function resolveDb(deps?: { db?: DbLike }): Promise<DbLike> {
  if (deps?.db) return deps.db;
  const { getDb } = await import('@/lib/db/client');
  // Client's execute() accepts a narrower InValue[] than DbLike's unknown[];
  // every value we pass is a string or number, so the widening is safe.
  return getDb() as unknown as DbLike;
}

export function recordToolUsage(entry: ToolUsageEntry, deps?: { db?: DbLike }): void {
  void (async () => {
    const db = await resolveDb(deps);
    await db.execute({
      sql: `insert into tool_usage
              (id, tool_name, model, input_tokens, output_tokens, latency_ms, session_hash)
            values (?, ?, ?, ?, ?, ?, ?)`,
      args: [
        entry.id,
        entry.toolName,
        entry.model,
        entry.inputTokens,
        entry.outputTokens,
        entry.latencyMs,
        entry.sessionHash,
      ],
    });
  })().catch((error) => {
    logger.warn('Failed to record tool usage', {
      context: 'ai-metrics',
      metadata: { message: error instanceof Error ? error.message : String(error) },
    });
  });
}

export async function recordTimeSaved(
  usageId: string,
  bucket: TimeSavedBucket,
  deps?: { db?: DbLike }
): Promise<boolean> {
  if (!TIME_SAVED_BUCKETS.includes(bucket) || !UUID_PATTERN.test(usageId)) {
    return false;
  }

  try {
    const db = await resolveDb(deps);
    await db.execute({
      sql: 'update tool_usage set time_saved_bucket = ? where id = ?',
      args: [bucket, usageId],
    });
    return true;
  } catch (error) {
    logger.warn('Failed to record time-saved feedback', {
      context: 'ai-metrics',
      metadata: { message: error instanceof Error ? error.message : String(error) },
    });
    return false;
  }
}
