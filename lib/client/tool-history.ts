import { notifyProgressChanged } from './progress-sync';

export interface ToolHistoryEntry {
  inputPreview: string;
  output: string;
  timestamp: number;
}

const MAX_ENTRIES = 5;
const key = (toolId: string) => `tool-history:${toolId}`;

function safeParse(raw: string | null): ToolHistoryEntry[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function getHistory(toolId: string): ToolHistoryEntry[] {
  if (typeof window === 'undefined') return [];
  return safeParse(window.localStorage.getItem(key(toolId)));
}

export function addHistoryEntry(
  toolId: string,
  input: string,
  output: string
): ToolHistoryEntry[] {
  if (typeof window === 'undefined') return [];
  const entry: ToolHistoryEntry = {
    inputPreview: input.trim().slice(0, 80),
    output,
    timestamp: Date.now(),
  };
  const next = [entry, ...getHistory(toolId)].slice(0, MAX_ENTRIES);
  try {
    window.localStorage.setItem(key(toolId), JSON.stringify(next));
  } catch {
    // Storage full/blocked — history is best-effort.
  }
  notifyProgressChanged();
  return next;
}

export function clearHistory(toolId: string): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(key(toolId));
}
