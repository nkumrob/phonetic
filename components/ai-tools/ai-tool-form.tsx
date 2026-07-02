'use client';

import { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { runAiTool, type AiToolResult } from '@/lib/services/ai-tool-service';
import { cn } from '@/lib/utils/cn';
import { addHistoryEntry, clearHistory, getHistory, type ToolHistoryEntry } from '@/lib/client/tool-history';
import { ResultPanel } from './result-panel';
import { TimeSavedFeedback } from './time-saved-feedback';
import { RecentResults } from './recent-results';

export interface AiToolFormProps {
  toolId: string;
  inputLabel: string;
  placeholder: string;
  buttonText: string;
  loadingText: string;
  resultTitle: string;
  maxChars: number;
  rows?: number;
}

/**
 * Generic input → AI → result form shared by every AI tool page.
 * Tool behavior comes entirely from server-side config (lib/ai/config.ts);
 * this component only knows presentation.
 */
export function AiToolForm({
  toolId,
  inputLabel,
  placeholder,
  buttonText,
  loadingText,
  resultTitle,
  maxChars,
  rows = 6,
}: AiToolFormProps) {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AiToolResult | null>(null);
  const [history, setHistory] = useState<ToolHistoryEntry[]>([]);

  useEffect(() => {
    setHistory(getHistory(toolId));
  }, [toolId]);

  const charCount = input.length;
  const nearLimit = charCount > maxChars * 0.9;

  const handleSubmit = async () => {
    if (!input.trim() || isLoading) return;
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      const response = await runAiTool(toolId, input);
      setResult(response);
      setHistory(addHistoryEntry(toolId, input, response.output));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-warmNeutral-800 rounded-xl shadow-lg border border-warmNeutral-200 dark:border-warmNeutral-700 p-6 space-y-4">
      <div>
        <label
          htmlFor={`${toolId}-input`}
          className="block text-sm font-semibold text-warmNeutral-700 dark:text-warmNeutral-200 mb-2"
        >
          {inputLabel}
        </label>
        <textarea
          id={`${toolId}-input`}
          value={input}
          onChange={(event) => setInput(event.target.value.slice(0, maxChars))}
          placeholder={placeholder}
          rows={rows}
          className="w-full rounded-lg border border-warmNeutral-200 dark:border-warmNeutral-600 bg-white dark:bg-warmNeutral-900 p-3 text-warmNeutral-800 dark:text-warmNeutral-100 placeholder:italic placeholder:text-warmNeutral-400 focus:outline-none focus:ring-2 focus:ring-coolBlue-500"
        />
        <div className="mt-1 flex items-center justify-between">
          <span className={cn('text-xs', nearLimit ? 'text-warning font-medium' : 'text-tertiary')}>
            {charCount.toLocaleString()} / {maxChars.toLocaleString()}
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!input.trim() || isLoading}
        className="btn btn-primary w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Sparkles size={18} className="mr-2" />
        {isLoading ? loadingText : buttonText}
      </button>

      {error && (
        <div
          role="alert"
          className="p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-300"
        >
          {error}
        </div>
      )}

      {result && (
        <div className="space-y-3 animate-fade-in">
          <ResultPanel text={result.output} title={resultTitle} />
          {result.usageId && <TimeSavedFeedback usageId={result.usageId} />}
        </div>
      )}

      <RecentResults
        entries={history}
        onRestore={(entry) => {
          setResult({ output: entry.output, usageId: null });
          setError(null);
        }}
        onClear={() => {
          clearHistory(toolId);
          setHistory([]);
        }}
      />
    </div>
  );
}
