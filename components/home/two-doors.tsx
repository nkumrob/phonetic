import Link from 'next/link';

const LINK_CLASS =
  'inline-flex items-center font-mono text-[13px] font-bold tracking-tight text-coolBlue-600 hover:text-coolBlue-700 dark:text-coolBlue-400 dark:hover:text-coolBlue-300 transition-colors';

/** Two equal entry doors: NATO phonetic and AI work tools (landing positioning, 2026-07-05). */
export function TwoDoors() {
  return (
    <section
      aria-label="Start here"
      className="relative bg-warmNeutral-50 pb-20 dark:bg-warmNeutral-900 md:pb-24"
    >
      <div className="container px-6 md:px-8 lg:px-4">
        <div className="grid max-w-5xl gap-5 md:grid-cols-2 lg:gap-6">
          <div className="group relative overflow-hidden rounded-2xl border border-warmNeutral-200 bg-white p-8 transition-all duration-300 hover:-translate-y-1 hover:border-warmAmber-400 hover:shadow-[0_24px_48px_-24px_rgba(180,83,10,0.35)] dark:border-warmNeutral-700 dark:bg-warmNeutral-800 dark:hover:border-warmAmber-600 md:p-10">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -right-4 -top-12 select-none font-mono text-[11rem] font-bold leading-none text-warmAmber-600/[0.07] transition-transform duration-500 group-hover:scale-110 dark:text-warmAmber-400/[0.08]"
            >
              A
            </span>
            <p className="mb-4 font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-warmAmber-700 dark:text-warmAmber-400">
              NATO Phonetic Alphabet
            </p>
            <h2 className="mb-3 text-2xl font-black tracking-tight md:text-3xl">
              Split-second clarity
            </h2>
            <p className="mb-8 max-w-md text-body leading-relaxed text-secondary">
              The NATO phonetic alphabet is the universal standard for communicating letters and
              codes without error over radio, phone, or dispatch.
            </p>
            <div className="relative flex flex-wrap gap-x-6 gap-y-3 border-t border-warmNeutral-100 pt-5 dark:border-warmNeutral-700">
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

          <div className="group relative overflow-hidden rounded-2xl border border-warmNeutral-200 bg-white p-8 transition-all duration-300 hover:-translate-y-1 hover:border-coolBlue-400 hover:shadow-[0_24px_48px_-24px_rgba(37,99,235,0.35)] dark:border-warmNeutral-700 dark:bg-warmNeutral-800 dark:hover:border-coolBlue-500 md:p-10">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -right-6 -top-12 select-none font-mono text-[11rem] font-bold leading-none text-coolBlue-600/[0.07] transition-transform duration-500 group-hover:scale-110 dark:text-coolBlue-400/[0.08]"
            >
              »
            </span>
            <p className="mb-4 font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-coolBlue-600 dark:text-coolBlue-400">
              AI Work Tools
            </p>
            <h2 className="mb-3 text-2xl font-black tracking-tight md:text-3xl">
              Decisions, faster
            </h2>
            <p className="mb-8 max-w-md text-body leading-relaxed text-secondary">
              Draft, summarize, and review with AI to a professional standard. Five tools, no
              sign-up.
            </p>
            <div className="relative border-t border-warmNeutral-100 pt-5 dark:border-warmNeutral-700">
              <Link href="/tools" className={LINK_CLASS}>
                Open the AI tools →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
