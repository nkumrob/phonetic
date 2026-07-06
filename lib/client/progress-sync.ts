import type { ToolHistoryEntry } from './tool-history';

/**
 * Syncs localStorage progress (tool history + time saved) with the server
 * copy keyed by the np_anon cookie. localStorage stays the synchronous
 * read path; the server copy survives cleared browsers. All network work
 * is best-effort — failures never surface to the user.
 */

export interface ProgressData {
  toolHistory: Record<string, ToolHistoryEntry[]>;
  timeSavedMinutes: number;
}

const HISTORY_PREFIX = 'tool-history:';
const TIME_SAVED_KEY = 'time-saved-minutes';
const MAX_ENTRIES = 5;
const PUSH_DEBOUNCE_MS = 2000;

let pushTimer: ReturnType<typeof setTimeout> | null = null;

export function __resetSyncStateForTests(): void {
  if (pushTimer) clearTimeout(pushTimer);
  pushTimer = null;
}

export function collectLocalProgress(): ProgressData {
  const toolHistory: Record<string, ToolHistoryEntry[]> = {};
  if (typeof window !== 'undefined') {
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (!key?.startsWith(HISTORY_PREFIX)) continue;
      try {
        const parsed = JSON.parse(window.localStorage.getItem(key) ?? '[]');
        if (Array.isArray(parsed) && parsed.length > 0) {
          toolHistory[key.slice(HISTORY_PREFIX.length)] = parsed;
        }
      } catch {
        // Corrupt entry — skip it.
      }
    }
  }
  const rawMinutes =
    typeof window === 'undefined' ? 0 : Number(window.localStorage.getItem(TIME_SAVED_KEY));
  return {
    toolHistory,
    timeSavedMinutes: Number.isFinite(rawMinutes) && rawMinutes > 0 ? rawMinutes : 0,
  };
}

export function mergeProgress(local: ProgressData, remote: ProgressData): ProgressData {
  const toolHistory: Record<string, ToolHistoryEntry[]> = {};
  const toolIds = new Set([...Object.keys(local.toolHistory), ...Object.keys(remote.toolHistory)]);

  for (const toolId of toolIds) {
    const seen = new Map<number, ToolHistoryEntry>();
    for (const entry of [...(remote.toolHistory[toolId] ?? []), ...(local.toolHistory[toolId] ?? [])]) {
      if (typeof entry?.timestamp === 'number') seen.set(entry.timestamp, entry);
    }
    toolHistory[toolId] = [...seen.values()]
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, MAX_ENTRIES);
  }

  return {
    toolHistory,
    timeSavedMinutes: Math.max(local.timeSavedMinutes, remote.timeSavedMinutes),
  };
}

export function applyProgress(data: ProgressData): void {
  if (typeof window === 'undefined') return;
  try {
    for (const [toolId, entries] of Object.entries(data.toolHistory)) {
      window.localStorage.setItem(HISTORY_PREFIX + toolId, JSON.stringify(entries));
    }
    window.localStorage.setItem(TIME_SAVED_KEY, String(data.timeSavedMinutes));
  } catch {
    // Storage blocked — best-effort.
  }
}

async function pushProgress(): Promise<void> {
  try {
    await fetch('/api/progress', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(collectLocalProgress()),
      keepalive: true,
    });
  } catch {
    // Offline / blocked — the next change retries.
  }
}

/** Call once on app load: pull server copy, merge, write back both ways. */
export async function pullAndMergeProgress(): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    const response = await fetch('/api/progress');
    const { data } = (await response.json()) as { data: string | null };
    const remote: ProgressData = data
      ? (JSON.parse(data) as ProgressData)
      : { toolHistory: {}, timeSavedMinutes: 0 };
    const local = collectLocalProgress();
    const merged = mergeProgress(local, remote);
    applyProgress(merged);
    if (JSON.stringify(merged) !== JSON.stringify(remote)) {
      await pushProgress();
    }
  } catch {
    // Sync is best-effort; localStorage remains authoritative locally.
  }
}

/** Call after any local progress write; debounced server push. */
export function notifyProgressChanged(): void {
  if (typeof window === 'undefined') return;
  if (pushTimer) clearTimeout(pushTimer);
  pushTimer = setTimeout(() => {
    pushTimer = null;
    void pushProgress();
  }, PUSH_DEBOUNCE_MS);
}
