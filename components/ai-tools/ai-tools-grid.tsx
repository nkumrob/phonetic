import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { AI_TOOLS } from './tool-registry';

/** Grid of AI tool cards shown on the /tools page. */
export function AiToolsGrid() {
  return (
    <div className="bg-white dark:bg-warmNeutral-800 rounded-xl shadow-lg border border-warmNeutral-200 dark:border-warmNeutral-700 p-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-warmAmber-50 dark:bg-warmAmber-900/20 rounded-xl mx-auto mb-4 flex items-center justify-center">
          <Sparkles size={32} className="text-warmAmber-600" />
        </div>
        <div className="flex items-center justify-center gap-2 mb-3">
          <h3 className="text-2xl font-bold tracking-largeText">AI Productivity Tools</h3>
          <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-warmAmber-100 text-warmAmber-700 dark:bg-warmAmber-900/40 dark:text-warmAmber-300">
            New
          </span>
        </div>
        <p className="text-base text-secondary max-w-2xl mx-auto">
          Clear communication works with AI too. Practical tools for everyday work — prompting,
          writing, summarizing, and checking AI output before you rely on it.
        </p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {AI_TOOLS.map((tool) => (
          <Link
            key={tool.id}
            href={tool.href}
            className="group p-4 rounded-lg border border-warmNeutral-200 dark:border-warmNeutral-700 hover:border-warmAmber-300 dark:hover:border-warmAmber-700 hover:shadow-md transition-all bg-warmNeutral-50 dark:bg-warmNeutral-900"
          >
            <div className="text-2xl mb-2">{tool.emoji}</div>
            <h4 className="font-bold text-warmNeutral-800 dark:text-warmNeutral-100 group-hover:text-warmAmber-700 dark:group-hover:text-warmAmber-400 transition-colors mb-1">
              {tool.name}
            </h4>
            <p className="text-sm text-secondary">{tool.tagline}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
