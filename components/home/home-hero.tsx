/** Homepage hero: outcome-led umbrella positioning; the doors below are the CTAs (2026-07-05). */
export function HomeHero() {
  return (
    <section className="py-12 md:py-16 lg:py-20 relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-warmNeutral-50 dark:bg-warmNeutral-900" />

      <div className="container px-6 md:px-8 lg:px-4 text-center">
        <p className="text-xs font-bold text-tertiary uppercase tracking-widest mb-4 animate-fade-in">
          Natophonetic
        </p>

        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1] animate-slide-up mb-6">
          Productivity for mission-critical work
        </h1>

        <p
          className="text-body-lg text-secondary max-w-2xl mx-auto animate-slide-up"
          style={{ animationDelay: '100ms' }}
        >
          Professional AI tools for split-second decisions, precise communication, and dependable
          everyday work.
        </p>
      </div>
    </section>
  );
}
