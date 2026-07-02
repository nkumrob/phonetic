import type { TimeSavedBucket } from '@/lib/ai/types';

/**
 * Client-side fetch wrapper for the AI tool API (review-service.ts pattern).
 */

export interface ImprovePromptResult {
  improvedPrompt: string;
  usageId: string | null;
}

export async function improvePrompt(input: string): Promise<ImprovePromptResult> {
  const response = await fetch('/api/ai/prompt-improver', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ input }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(
      (body as { error?: string }).error || 'Failed to improve prompt. Please try again.'
    );
  }

  const data = (await response.json()) as {
    result: { output: string; usageId?: string };
  };
  return {
    improvedPrompt: data.result.output,
    usageId: data.result.usageId ?? null,
  };
}

/** Best-effort feedback — never surfaces errors to the user. */
export async function submitTimeSaved(usageId: string, bucket: TimeSavedBucket): Promise<void> {
  try {
    await fetch('/api/ai/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usageId, timeSavedBucket: bucket }),
    });
  } catch {
    // Feedback is optional telemetry; losing it must never affect the user.
  }
}
