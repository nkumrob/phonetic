'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, Copy } from 'lucide-react';

interface ResultPanelProps {
  text: string;
}

/** Displays the improved prompt with a copy-to-clipboard action. */
export function ResultPanel({ text }: ResultPanelProps) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable (permissions/http) — silently ignore.
    }
  };

  return (
    <div className="rounded-lg bg-gradient-to-br from-coolBlue-50 to-warmAmber-50 dark:from-coolBlue-900/20 dark:to-warmAmber-900/20 border border-warmNeutral-200 dark:border-warmNeutral-700 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-warmNeutral-700 dark:text-warmNeutral-200">
          Improved prompt
        </h3>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg bg-warmNeutral-100 text-warmNeutral-700 hover:bg-warmNeutral-200 dark:bg-warmNeutral-700 dark:text-warmNeutral-200 dark:hover:bg-warmNeutral-600 transition-colors"
        >
          {copied ? (
            <>
              <Check size={16} className="text-success" />
              Copied
            </>
          ) : (
            <>
              <Copy size={16} />
              Copy
            </>
          )}
        </button>
      </div>
      <p className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-warmNeutral-800 dark:text-warmNeutral-100">
        {text}
      </p>
    </div>
  );
}
