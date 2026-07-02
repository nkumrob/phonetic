'use client';

import type { ToolHistoryEntry } from '@/lib/client/tool-history';

interface RecentResultsProps {
  entries: ToolHistoryEntry[];
  onRestore: (entry: ToolHistoryEntry) => void;
  onClear: () => void;
}

/** Presentational list of past AI tool results persisted in localStorage. */
export function RecentResults({ entries, onRestore, onClear }: RecentResultsProps) {
  if (entries.length === 0) return null;

  return (
    <div className="border-t border-warmNeutral-200 dark:border-warmNeutral-700 pt-4 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-semibold text-warmNeutral-700 dark:text-warmNeutral-200">
            Recent results
          </h4>
          <span className="text-xs text-tertiary">stored only on this device</span>
        </div>
        <button
          type="button"
          onClick={onClear}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          Clear
        </button>
      </div>

      {entries.map((entry) => (
        <div key={entry.timestamp} className="flex items-center justify-between">
          <div className="min-w-0 flex-1 mr-3">
            <p className="text-sm text-secondary truncate">{entry.inputPreview}</p>
            <p className="text-xs text-tertiary">{new Date(entry.timestamp).toLocaleString()}</p>
          </div>
          <button
            type="button"
            onClick={() => onRestore(entry)}
            className="px-3 py-1.5 text-sm font-medium rounded-full bg-warmNeutral-100 text-warmNeutral-700 hover:bg-warmNeutral-200 dark:bg-warmNeutral-700 dark:text-warmNeutral-200 dark:hover:bg-warmNeutral-600 transition-colors flex-shrink-0"
          >
            Restore
          </button>
        </div>
      ))}
    </div>
  );
}
