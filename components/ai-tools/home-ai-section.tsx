import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { AI_TOOLS } from './tool-registry';

/** Homepage AI section — the five AI tools; the phonetic side leads the page (2026-07-02). */
export function HomeAiSection() {
  return (
    <section className="py-16 md:py-20 bg-gradient-to-br from-warmAmber-50/50 to-coolBlue-50/50 dark:from-warmAmber-900/10 dark:to-coolBlue-900/10">
      <div className="container px-6 md:px-8 lg:px-4">
        <div className="text-center mb-10 md:mb-12">
          <h2 className="h2 mb-6">Hours of work in minutes</h2>
          <p className="text-body-lg text-secondary max-w-3xl mx-auto leading-relaxed">
            Draft comms, build briefs, extract action items, and verify AI output before you rely
            on it. The same discipline that keeps radio traffic clear, applied to everyday work.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto mb-10">
          {AI_TOOLS.filter((tool) => tool.category === 'ai').map((tool) => (
            <Link
              key={tool.id}
              href={tool.href}
              className="group p-5 rounded-xl bg-white dark:bg-warmNeutral-800 border border-warmNeutral-200 dark:border-warmNeutral-700 hover:border-warmAmber-300 dark:hover:border-warmAmber-700 hover:shadow-md transition-all"
            >
              <div className="text-3xl mb-3">{tool.emoji}</div>
              <h3 className="font-bold text-warmNeutral-800 dark:text-warmNeutral-100 group-hover:text-warmAmber-700 dark:group-hover:text-warmAmber-400 transition-colors mb-1">
                {tool.name}
              </h3>
              <p className="text-sm text-secondary">{tool.tagline}</p>
            </Link>
          ))}
        </div>

        <div className="text-center">
          <Link href="/tools" className="btn btn-primary inline-flex items-center gap-2">
            <Sparkles size={18} aria-hidden="true" />
            Open the Tools
          </Link>
        </div>
      </div>
    </section>
  );
}
