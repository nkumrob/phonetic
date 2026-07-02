import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { AI_TOOLS } from './tool-registry';

/** Homepage section introducing the AI productivity tools (hybrid-hero strategy). */
export function HomeAiSection() {
  return (
    <section className="py-16 md:py-20 bg-gradient-to-br from-warmAmber-50/50 to-coolBlue-50/50 dark:from-warmAmber-900/10 dark:to-coolBlue-900/10">
      <div className="container px-6 md:px-8 lg:px-4">
        <div className="text-center mb-10 md:mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-warmAmber-100 dark:bg-warmAmber-900/30 text-warmAmber-700 dark:text-warmAmber-300 text-xs font-bold uppercase tracking-widest rounded-full mb-6">
            <Sparkles size={14} />
            New: AI Productivity Tools
          </div>
          <h2 className="h2 mb-6">Clear Communication Works With AI Too</h2>
          <p className="text-body-lg text-secondary max-w-3xl mx-auto leading-relaxed">
            The same clarity that makes phonetic spelling work makes AI work. Free, practical
            tools for everyday tasks — write better prompts, draft emails, summarize documents,
            and check AI answers before you rely on them.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 max-w-6xl mx-auto mb-10">
          {AI_TOOLS.map((tool) => (
            <Link
              key={tool.id}
              href={tool.href}
              className="group p-4 rounded-xl bg-white dark:bg-warmNeutral-800 border border-warmNeutral-200 dark:border-warmNeutral-700 hover:border-warmAmber-300 dark:hover:border-warmAmber-700 hover:shadow-md transition-all text-center"
            >
              <div className="text-3xl mb-2">{tool.emoji}</div>
              <h3 className="text-sm font-bold text-warmNeutral-800 dark:text-warmNeutral-100 group-hover:text-warmAmber-700 dark:group-hover:text-warmAmber-400 transition-colors">
                {tool.name}
              </h3>
            </Link>
          ))}
        </div>

        <div className="text-center">
          <Link
            href="/tools/prompt-improver"
            className="btn btn-primary btn-lg inline-flex items-center gap-2"
          >
            <Sparkles size={20} />
            Try the Prompt Improver Free
          </Link>
        </div>
      </div>
    </section>
  );
}
