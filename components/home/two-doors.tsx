import Link from 'next/link';

const TEXT_LINK =
  'inline-flex items-center text-sm font-semibold text-gray-700 underline decoration-gray-300 decoration-2 underline-offset-4 transition-colors hover:text-coolBlue-600 hover:decoration-coolBlue-400 dark:text-warmNeutral-200 dark:decoration-warmNeutral-500 dark:hover:text-coolBlue-300 dark:hover:decoration-coolBlue-400';

const CARD =
  'relative overflow-hidden rounded-2xl border bg-white p-8 shadow-[0_20px_45px_-22px_rgba(41,37,36,0.35)] transition-all duration-300 hover:-translate-y-1 dark:bg-warmNeutral-800 md:p-10';

/** Two equal entry doors: NATO phonetic and AI work tools (landing positioning, 2026-07-05). */
export function TwoDoors() {
  return (
    <section
      aria-label="Start here"
      className="relative bg-warmNeutral-50 pb-20 dark:bg-warmNeutral-900 md:pb-24"
    >
      <div className="container px-6 md:px-8 lg:px-4">
        <div className="grid max-w-5xl gap-6 md:grid-cols-2">
          <div
            className={`${CARD} border-warmNeutral-200 hover:border-warmAmber-500 hover:shadow-[0_28px_56px_-22px_rgba(180,83,10,0.35)] dark:border-warmNeutral-700 dark:hover:border-warmAmber-500`}
          >
            <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1.5 bg-warmAmber-500" />
            <p className="mb-4 font-mono text-[12px] font-bold uppercase tracking-[0.2em] text-warmAmber-700 dark:text-warmAmber-400">
              NATO Phonetic Alphabet
            </p>
            <h2 className="mb-3 text-2xl font-black tracking-tight md:text-3xl">
              Split-second clarity
            </h2>
            <p className="mb-8 max-w-md text-base leading-relaxed text-gray-600 dark:text-warmNeutral-300">
              The NATO phonetic alphabet is the universal standard for communicating letters and
              codes without error over radio, phone, or dispatch.
            </p>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
              <Link
                href="/tools/phonetic-converter"
                className="inline-flex items-center gap-2 rounded-lg bg-stone-900 px-6 py-3 font-bold text-white shadow-[0_10px_24px_-10px_rgba(28,25,23,0.6)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-stone-800 dark:bg-warmNeutral-100 dark:text-warmNeutral-900 dark:hover:bg-white"
              >
                Convert text
                <span aria-hidden="true">→</span>
              </Link>
              <a href="/api/pdf" download="nato-phonetic-alphabet-chart.pdf" className={TEXT_LINK}>
                Chart PDF
              </a>
              <Link href="/learn" className={TEXT_LINK}>
                Learn A to Z
              </Link>
            </div>
          </div>

          <div
            className={`${CARD} border-warmNeutral-200 hover:border-coolBlue-500 hover:shadow-[0_28px_56px_-22px_rgba(37,99,235,0.35)] dark:border-warmNeutral-700 dark:hover:border-coolBlue-500`}
          >
            <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1.5 bg-coolBlue-500" />
            <p className="mb-4 font-mono text-[12px] font-bold uppercase tracking-[0.2em] text-coolBlue-700 dark:text-coolBlue-300">
              AI Work Tools
            </p>
            <h2 className="mb-3 text-2xl font-black tracking-tight md:text-3xl">
              Decisions, faster
            </h2>
            <p className="mb-8 max-w-md text-base leading-relaxed text-gray-600 dark:text-warmNeutral-300">
              Draft, summarize, and review with AI to a professional standard. Five tools, no
              sign-up.
            </p>
            <div>
              <Link
                href="/tools"
                className="inline-flex items-center gap-2 rounded-lg bg-coolBlue-600 px-6 py-3 font-bold text-white shadow-[0_10px_24px_-10px_rgba(37,99,235,0.6)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-coolBlue-500"
              >
                Open the AI tools
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
