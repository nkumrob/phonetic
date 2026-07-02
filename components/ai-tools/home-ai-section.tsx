import Link from 'next/link';
import { ShieldCheck, Sparkles } from 'lucide-react';
import { AI_TOOLS } from './tool-registry';

/** Homepage suite grid — all six tools as peers (mission-critical rebrand). */
export function HomeAiSection() {
  return (
    <section className="py-16 md:py-20 bg-gradient-to-br from-warmAmber-50/50 to-coolBlue-50/50 dark:from-warmAmber-900/10 dark:to-coolBlue-900/10">
      <div className="container px-6 md:px-8 lg:px-4">
        <div className="text-center mb-10 md:mb-12">
          <h2 className="h2 mb-6">The Toolkit</h2>
          <p className="text-body-lg text-secondary max-w-3xl mx-auto leading-relaxed">
            Six tools, one standard: say it once, say it right. From spelling a call sign over a
            bad connection to briefing a 40-page report — and verifying what AI tells you before
            you act on it.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto mb-10">
          {AI_TOOLS.map((tool) => (
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

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-center">
          <p className="flex items-center gap-2 text-sm text-secondary max-w-xl">
            <ShieldCheck size={18} className="text-coolBlue-500 flex-shrink-0" />
            Built for verification cultures: these tools handle the paperwork side of
            mission-critical work — reports, briefs, and comms — never operational decisions.
          </p>
          <Link href="/tools" className="btn btn-primary inline-flex items-center gap-2">
            <Sparkles size={18} />
            Open the Tools
          </Link>
        </div>
      </div>
    </section>
  );
}
