import Link from 'next/link';

const CLARITY: Array<[string, string]> = [
  ['C', 'Charlie'],
  ['L', 'Lima'],
  ['A', 'Alpha'],
  ['R', 'Romeo'],
  ['I', 'India'],
  ['T', 'Tango'],
  ['Y', 'Yankee'],
];

/** Homepage hero: outcome-led umbrella positioning; the doors below are the CTAs (2026-07-05). */
export function HomeHero() {
  return (
    <section className="relative overflow-hidden bg-warmNeutral-50 dark:bg-warmNeutral-900">
      {/* hairline engineering grid */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-30 dark:opacity-[0.1]"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(120, 113, 108, 0.16) 1px, transparent 1px), linear-gradient(to bottom, rgba(120, 113, 108, 0.16) 1px, transparent 1px)',
          backgroundSize: '72px 72px',
        }}
      />
      {/* soft signal glow */}
      <div
        aria-hidden="true"
        className="absolute -top-48 right-[-10%] h-[560px] w-[560px] rounded-full bg-coolBlue-300/40 blur-3xl dark:bg-coolBlue-500/15"
      />

      <div className="container relative px-6 md:px-8 lg:px-4 py-16 md:py-24 lg:py-28">
        <div className="max-w-4xl">
          <h1 className="mb-8 animate-slide-up text-5xl font-black leading-[1.02] tracking-[-0.025em] sm:text-6xl md:text-7xl lg:text-[5.25rem]">
            Productivity for{' '}
            <span className="text-coolBlue-600 dark:text-coolBlue-400">mission-critical</span> work
          </h1>

          <p
            className="mb-10 max-w-2xl animate-slide-up text-xl leading-relaxed text-gray-600 dark:text-warmNeutral-200 md:text-2xl"
            style={{ animationDelay: '100ms' }}
          >
            Professional AI tools for split-second decisions, precise communication, and dependable
            everyday work.
          </p>

          {/* clear primary actions */}
          <div
            className="mb-14 flex animate-slide-up flex-col gap-4 sm:flex-row"
            style={{ animationDelay: '175ms' }}
          >
            <Link
              href="/tools"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-coolBlue-600 px-8 py-4 text-lg font-bold text-white shadow-[0_12px_28px_-10px_rgba(37,99,235,0.6)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-coolBlue-500 hover:shadow-[0_16px_32px_-10px_rgba(37,99,235,0.7)]"
            >
              Open the AI Tools
              <span aria-hidden="true">→</span>
            </Link>
            <Link
              href="/learn"
              className="inline-flex items-center justify-center rounded-lg border-2 border-stone-900 bg-white px-8 py-4 text-lg font-bold text-stone-900 transition-all duration-200 hover:-translate-y-0.5 hover:bg-stone-900 hover:text-white dark:border-warmNeutral-100 dark:bg-transparent dark:text-warmNeutral-100 dark:hover:bg-warmNeutral-100 dark:hover:text-warmNeutral-900"
            >
              Learn the NATO Alphabet
            </Link>
          </div>

          {/* signature: CLARITY spelled in phonetic code words */}
          <div
            aria-hidden="true"
            className="animate-fade-in border-t border-warmNeutral-200 pt-5 dark:border-warmNeutral-600"
            style={{ animationDelay: '250ms' }}
          >
            <div className="flex flex-wrap gap-x-6 gap-y-2 font-mono text-[13px] uppercase tracking-[0.12em]">
              {CLARITY.map(([letter, word]) => (
                <span key={word} className="whitespace-nowrap">
                  <span className="font-bold text-coolBlue-700 dark:text-coolBlue-300">
                    {letter}
                  </span>
                  <span className="mx-1.5 text-gray-400 dark:text-warmNeutral-500">·</span>
                  <span className="font-semibold text-gray-600 dark:text-warmNeutral-200">
                    {word}
                  </span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
