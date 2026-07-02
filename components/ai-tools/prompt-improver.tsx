'use client';

import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { improvePrompt, type ImprovePromptResult } from '@/lib/services/ai-tool-service';
import { cn } from '@/lib/utils/cn';
import { ResultPanel } from './result-panel';
import { TimeSavedFeedback } from './time-saved-feedback';

const MAX_CHARACTERS = 2000;

/** The Prompt Improver tool: rough prompt in, structured prompt out. */
export function PromptImprover() {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ImprovePromptResult | null>(null);

  const charCount = input.length;
  const nearLimit = charCount > MAX_CHARACTERS * 0.9;

  const handleSubmit = async () => {
    if (!input.trim() || isLoading) return;
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      setResult(await improvePrompt(input));
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
          htmlFor="prompt-input"
          className="block text-sm font-semibold text-warmNeutral-700 dark:text-warmNeutral-200 mb-2"
        >
          Your rough prompt
        </label>
        <textarea
          id="prompt-input"
          value={input}
          onChange={(event) => setInput(event.target.value.slice(0, MAX_CHARACTERS))}
          placeholder="e.g. write an email to my landlord about the broken heater"
          rows={4}
          className="w-full rounded-lg border border-warmNeutral-200 dark:border-warmNeutral-600 bg-white dark:bg-warmNeutral-900 p-3 text-warmNeutral-800 dark:text-warmNeutral-100 placeholder:italic placeholder:text-warmNeutral-400 focus:outline-none focus:ring-2 focus:ring-coolBlue-500"
        />
        <div className="mt-1 flex items-center justify-between">
          <span className={cn('text-xs', nearLimit ? 'text-warning font-medium' : 'text-tertiary')}>
            {charCount.toLocaleString()} / {MAX_CHARACTERS.toLocaleString()}
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
        {isLoading ? 'Improving…' : 'Improve My Prompt'}
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
          <ResultPanel text={result.improvedPrompt} />
          {result.usageId && <TimeSavedFeedback usageId={result.usageId} />}
        </div>
      )}
    </div>
  );
}
