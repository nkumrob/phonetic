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
        className="absolute inset-0 opacity-40 dark:opacity-[0.12]"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(120, 113, 108, 0.14) 1px, transparent 1px), linear-gradient(to bottom, rgba(120, 113, 108, 0.14) 1px, transparent 1px)',
          backgroundSize: '72px 72px',
        }}
      />
      {/* soft signal glow, upper right */}
      <div
        aria-hidden="true"
        className="absolute -top-48 right-[-12%] h-[520px] w-[520px] rounded-full bg-coolBlue-200/40 blur-3xl dark:bg-coolBlue-500/10"
      />

      <div className="container relative px-6 md:px-8 lg:px-4 py-16 md:py-24 lg:py-28">
        <div className="max-w-4xl">
          <p className="mb-6 animate-fade-in font-mono text-[11px] font-bold uppercase tracking-[0.35em] text-coolBlue-600 dark:text-coolBlue-400">
            Natophonetic{' '}
            <span className="text-warmNeutral-400 dark:text-warmNeutral-500">/ signal clear</span>
          </p>

          <h1 className="mb-8 animate-slide-up text-5xl font-black leading-[0.95] tracking-[-0.03em] sm:text-6xl md:text-7xl lg:text-[5.25rem]">
            Productivity for{' '}
            <span className="text-coolBlue-600 dark:text-coolBlue-400">mission-critical</span> work
          </h1>

          <p
            className="mb-12 max-w-2xl animate-slide-up text-body-lg text-secondary"
            style={{ animationDelay: '100ms' }}
          >
            Professional AI tools for split-second decisions, precise communication, and dependable
            everyday work.
          </p>

          {/* signature: CLARITY spelled in phonetic code words */}
          <div
            aria-hidden="true"
            className="animate-fade-in border-t border-warmNeutral-200 pt-5 dark:border-warmNeutral-700"
            style={{ animationDelay: '250ms' }}
          >
            <div className="flex flex-wrap gap-x-5 gap-y-2 font-mono text-[11px] uppercase tracking-[0.18em] text-tertiary">
              {CLARITY.map(([letter, word]) => (
                <span key={word} className="whitespace-nowrap">
                  <span className="font-bold text-warmNeutral-700 dark:text-warmNeutral-200">
                    {letter}
                  </span>
                  <span className="mx-1 text-warmNeutral-300 dark:text-warmNeutral-600">·</span>
                  {word}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
