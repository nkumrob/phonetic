'use client';

import { type ToolTemplate } from '@/lib/ai/templates';

interface TemplateStripProps {
  templates: ToolTemplate[];
  onSelect: (input: string) => void;
}

/**
 * Horizontal strip of starter-template pill buttons.
 * Returns null when the tool has no templates.
 */
export function TemplateStrip({ templates, onSelect }: TemplateStripProps) {
  if (templates.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-secondary">Start from an example:</span>
      {templates.map((template) => (
        <button
          key={template.label}
          type="button"
          onClick={() => onSelect(template.input)}
          className="px-3 py-1.5 text-sm font-medium rounded-full bg-warmNeutral-100 text-warmNeutral-700 hover:bg-warmNeutral-200 dark:bg-warmNeutral-700 dark:text-warmNeutral-200 dark:hover:bg-warmNeutral-600 transition-colors"
        >
          {template.label}
        </button>
      ))}
    </div>
  );
}
