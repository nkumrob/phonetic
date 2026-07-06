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
const SYNC_OUTPUT_MAX_CHARS = 2000;
const SYNC_PAYLOAD_MAX_BYTES = 30 * 1024;

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

/**
 * Returns a copy of `data` safe to send over the wire:
 * 1. Truncates every entry's `output` to SYNC_OUTPUT_MAX_CHARS.
 * 2. Drops the globally oldest entry (by timestamp) repeatedly until the
 *    JSON byte length is within SYNC_PAYLOAD_MAX_BYTES. Emptied tool keys
 *    are removed so the server upsert cleans them up.
 */
function boundProgressPayload(data: ProgressData): ProgressData {
  // Step 1 — truncate outputs.
  const toolHistory: Record<string, ToolHistoryEntry[]> = {};
  for (const [toolId, entries] of Object.entries(data.toolHistory)) {
    toolHistory[toolId] = entries.map((e) => ({
      ...e,
      output: e.output.slice(0, SYNC_OUTPUT_MAX_CHARS),
    }));
  }

  let bounded: ProgressData = { toolHistory, timeSavedMinutes: data.timeSavedMinutes };

  // Step 2 — drop oldest entries until under the byte cap.
  // Use TextEncoder when available (browsers); fall back to Buffer in Node / test envs.
  const getByteLen = (str: string): number =>
    typeof TextEncoder !== 'undefined'
      ? new TextEncoder().encode(str).length
      : Buffer.byteLength(str, 'utf-8');

  while (true) {
    const json = JSON.stringify(bounded);
    const byteLen = getByteLen(json);
    if (byteLen <= SYNC_PAYLOAD_MAX_BYTES) break;

    // Find the globally oldest entry across all tools.
    let oldestTs = Infinity;
    let oldestToolId: string | null = null;
    for (const [toolId, entries] of Object.entries(bounded.toolHistory)) {
      for (const entry of entries) {
        if (entry.timestamp < oldestTs) {
          oldestTs = entry.timestamp;
          oldestToolId = toolId;
        }
      }
    }


    if (oldestToolId === null) break; // Nothing left to drop.

    const remaining = bounded.toolHistory[oldestToolId].filter((e) => e.timestamp !== oldestTs);
    if (remaining.length === 0) {
      // Remove the now-empty tool key entirely.
      const { [oldestToolId]: _removed, ...rest } = bounded.toolHistory;
      bounded = { ...bounded, toolHistory: rest };
    } else {
      bounded = {
        ...bounded,
        toolHistory: { ...bounded.toolHistory, [oldestToolId]: remaining },
      };
    }
  }

  return bounded;
}

async function pushProgress(): Promise<void> {
  try {
    await fetch('/api/progress', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(boundProgressPayload(collectLocalProgress())),
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
    // Compare what we *would* push (bounded merged) against the server copy.
    // Without bounding here we'd always push when local outputs exceed 2000 chars,
    // even if the bounded snapshot is identical to what's already on the server.
    if (JSON.stringify(boundProgressPayload(merged)) !== JSON.stringify(remote)) {
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
