import Link from 'next/link';

const LINK_CLASS = 'text-sm font-semibold text-coolBlue-500 hover:text-coolBlue-600';

/** Two equal entry doors: NATO phonetic and AI work tools (landing positioning, 2026-07-05). */
export function TwoDoors() {
  return (
    <section aria-label="Start here" className="pb-16 md:pb-20">
      <div className="container px-6 md:px-8 lg:px-4">
        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          <div className="p-6 md:p-8 rounded-2xl bg-warmAmber-50/60 dark:bg-warmAmber-900/10 border border-warmAmber-200 dark:border-warmAmber-800/40">
            <p className="text-xs font-bold text-tertiary uppercase tracking-widest mb-3">
              NATO Phonetic Alphabet
            </p>
            <h2 className="text-2xl font-bold mb-3">Split-second clarity</h2>
            <p className="text-body text-secondary mb-6 leading-relaxed">
              The universal standard for communicating letters and codes without error over radio,
              phone, or dispatch.
            </p>
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              <Link href="/tools/phonetic-converter" className={LINK_CLASS}>
                Convert text →
              </Link>
              <a href="/api/pdf" download="nato-phonetic-alphabet-chart.pdf" className={LINK_CLASS}>
                Chart PDF →
              </a>
              <Link href="/learn" className={LINK_CLASS}>
                Learn A to Z →
              </Link>
            </div>
          </div>

          <div className="p-6 md:p-8 rounded-2xl bg-coolBlue-50/60 dark:bg-coolBlue-900/10 border border-coolBlue-200 dark:border-coolBlue-800/40">
            <p className="text-xs font-bold text-tertiary uppercase tracking-widest mb-3">
              AI Work Tools
            </p>
            <h2 className="text-2xl font-bold mb-3">Decisions, faster</h2>
            <p className="text-body text-secondary mb-6 leading-relaxed">
              Draft, summarize, and review with AI to a professional standard. Five tools, no
              sign-up.
            </p>
            <Link href="/tools" className={LINK_CLASS}>
              Open the AI tools →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
