import type { TimeSavedBucket } from '@/lib/ai/types';

const STORAGE_KEY = 'time-saved-minutes';

const BUCKET_MINUTES: Record<TimeSavedBucket, number> = {
  '<1': 0.5,
  '1-5': 3,
  '5-15': 10,
  '15+': 20,
};

export function getTimeSavedMinutes(): number {
  if (typeof window === 'undefined') return 0;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  const parsed = raw === null ? 0 : Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

export function recordLocalTimeSaved(bucket: TimeSavedBucket): void {
  if (typeof window === 'undefined') return;
  const total = getTimeSavedMinutes() + (BUCKET_MINUTES[bucket] ?? 0);
  try {
    window.localStorage.setItem(STORAGE_KEY, String(total));
  } catch {
    // Best-effort; losing the tally must never affect the user.
  }
}

export function formatTimeSaved(minutes: number): string {
  if (minutes < 60) {
    const rounded = Math.max(1, Math.round(minutes));
    return `~${rounded} minute${rounded === 1 ? '' : 's'}`;
  }
  const hours = minutes / 60;
  const rounded = Math.round(hours * 10) / 10;
  return `~${rounded} hour${rounded === 1 ? '' : 's'}`;
}
