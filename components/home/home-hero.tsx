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
      {/* layered signal glows */}
      <div
        aria-hidden="true"
        className="absolute -top-48 right-[-10%] h-[560px] w-[560px] rounded-full bg-coolBlue-300/50 blur-3xl dark:bg-coolBlue-500/15"
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-56 left-[-12%] h-[480px] w-[480px] rounded-full bg-warmAmber-200/50 blur-3xl dark:bg-warmAmber-500/10"
      />
      {/* oversized watermark glyph */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-10 top-6 select-none font-mono text-[22rem] font-bold leading-none text-warmNeutral-900/[0.04] dark:text-white/[0.04]"
      >
        A
      </span>

      <div className="container relative px-6 md:px-8 lg:px-4 py-16 md:py-24 lg:py-28">
        <div className="max-w-4xl">
          <p className="mb-7 flex animate-fade-in items-center gap-3 font-mono text-[12px] font-bold uppercase tracking-[0.22em]">
            <span className="inline-block h-2 w-2 rounded-full bg-coolBlue-500 shadow-[0_0_12px_rgba(59,130,246,0.9)]" />
            <span className="text-coolBlue-700 dark:text-coolBlue-300">Natophonetic</span>
            <span className="text-warmNeutral-500 dark:text-warmNeutral-400">/ signal clear</span>
          </p>

          <h1 className="mb-8 animate-slide-up text-5xl font-black leading-[1.02] tracking-[-0.025em] sm:text-6xl md:text-7xl lg:text-[5.25rem]">
            Productivity for{' '}
            <span className="text-coolBlue-600 dark:text-coolBlue-400">mission-critical</span> work
          </h1>

          <p
            className="mb-10 max-w-2xl animate-slide-up text-xl leading-relaxed text-warmNeutral-700 dark:text-warmNeutral-200 md:text-2xl"
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
              <span aria-hidden="true" className="font-mono">
                →
              </span>
            </Link>
            <Link
              href="/tools/phonetic-converter"
              className="inline-flex items-center justify-center rounded-lg border-2 border-warmNeutral-900 bg-white px-8 py-4 text-lg font-bold text-warmNeutral-900 transition-all duration-200 hover:-translate-y-0.5 hover:bg-warmNeutral-900 hover:text-white dark:border-warmNeutral-100 dark:bg-transparent dark:text-warmNeutral-100 dark:hover:bg-warmNeutral-100 dark:hover:text-warmNeutral-900"
            >
              NATO Phonetic Converter
            </Link>
          </div>

          {/* signature: CLARITY spelled in phonetic code words */}
          <div
            aria-hidden="true"
            className="animate-fade-in border-t-2 border-warmNeutral-300 pt-5 dark:border-warmNeutral-600"
            style={{ animationDelay: '250ms' }}
          >
            <div className="flex flex-wrap gap-x-6 gap-y-2 font-mono text-[13px] uppercase tracking-[0.12em]">
              {CLARITY.map(([letter, word]) => (
                <span key={word} className="whitespace-nowrap">
                  <span className="font-bold text-coolBlue-700 dark:text-coolBlue-300">
                    {letter}
                  </span>
                  <span className="mx-1.5 text-warmNeutral-400 dark:text-warmNeutral-500">·</span>
                  <span className="font-semibold text-warmNeutral-700 dark:text-warmNeutral-200">
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
