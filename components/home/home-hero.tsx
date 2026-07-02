import Link from 'next/link';

/** Homepage hero — mission-critical positioning (rebrand spec 2026-07-01). */
export function HomeHero() {
  return (
    <section className="py-12 md:py-16 lg:py-20 overflow-hidden relative">
      <div className="absolute inset-0 -z-10 bg-warmNeutral-50 dark:bg-warmNeutral-900" />

      <div className="container px-6 md:px-8 lg:px-4">
        <div className="grid lg:grid-cols-[1.2fr,1fr] gap-12 md:gap-16 lg:gap-20 items-center">
          <div className="space-y-6 md:space-y-8">
            <div className="text-center lg:text-left">
              <div className="micro-label animate-fade-in">For Mission-Critical Work</div>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1] animate-slide-up text-center lg:!text-left">
              AI productivity for mission-critical work
            </h1>

            <p
              className="text-body-lg text-secondary max-w-2xl mx-auto lg:mx-0 animate-slide-up text-center lg:!text-left"
              style={{ animationDelay: '100ms' }}
            >
              Draft comms, build briefs, extract action items, and verify AI output — tools built
              with the discipline of the professions that invented clear communication.
            </p>

            <div
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-slide-up"
              style={{ animationDelay: '200ms' }}
            >
              <Link
                href="/tools"
                className="btn btn-primary btn-xl whitespace-nowrap inline-flex items-center justify-center"
              >
                Open the Tools
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="ml-2">
                  <path
                    d="M7.5 5L12.5 10L7.5 15"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
              <Link
                href="/learn"
                className="btn btn-secondary btn-xl whitespace-nowrap inline-flex items-center justify-center"
              >
                Learn the Alphabet
              </Link>
            </div>

            <div
              className="pt-6 md:pt-8 animate-fade-in text-center lg:!text-left"
              style={{ animationDelay: '300ms' }}
            >
              <p className="text-xs font-bold text-tertiary uppercase tracking-widest mb-4">
                Built for the professions that can&apos;t afford miscommunication
              </p>
              <div className="flex flex-wrap items-center justify-center lg:!justify-start gap-4 md:gap-6">
                <span className="text-sm font-semibold text-secondary">✈️ Aviation</span>
                <span className="text-sm font-semibold text-secondary">🚢 Maritime</span>
                <span className="text-sm font-semibold text-secondary">🚔 Emergency</span>
                <span className="text-sm font-semibold text-secondary">📡 Military</span>
              </div>
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div className="absolute inset-0 bg-coolBlue-100 dark:bg-coolBlue-900/20 rounded-3xl transform rotate-3" />
            <div className="relative bg-white dark:bg-warmNeutral-800 rounded-3xl p-8 lg:p-12 shadow-2xl">
              <div className="grid grid-cols-3 gap-4 lg:gap-6">
                {['A-Alpha', 'B-Bravo', 'C-Charlie', 'D-Delta', 'E-Echo', 'F-Foxtrot'].map(
                  (item) => (
                    <div
                      key={item}
                      className="text-center p-4 lg:p-6 rounded-xl bg-warmNeutral-50 dark:bg-warmNeutral-900 hover:shadow-md transition-all duration-200"
                    >
                      <div className="text-3xl lg:text-4xl font-black text-coolBlue-500 mb-2">
                        {item.split('-')[0]}
                      </div>
                      <div className="text-xs lg:text-sm font-semibold text-secondary">
                        {item.split('-')[1]}
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
