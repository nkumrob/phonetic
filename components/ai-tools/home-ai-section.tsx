import Link from 'next/link';
import { AI_TOOLS } from './tool-registry';

/** Homepage AI section — the five AI tools as a dark console band (2026-07-05). */
export function HomeAiSection() {
  const tools = AI_TOOLS.filter((tool) => tool.category === 'ai');

  return (
    <section className="relative overflow-hidden bg-warmNeutral-900 py-20 md:py-24">
      {/* hairline grid on the console surface */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(255, 255, 255, 0.4) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.4) 1px, transparent 1px)',
          backgroundSize: '72px 72px',
        }}
      />

      <div className="container relative px-6 md:px-8 lg:px-4">
        <div className="mb-12 flex max-w-5xl flex-col gap-6 md:mb-16 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-4 font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-coolBlue-400">
              AI Work Tools / 05 instruments
            </p>
            <h2 className="h2 text-white">Hours of work in minutes</h2>
          </div>
          <p className="max-w-md text-body leading-relaxed text-warmNeutral-400">
            Draft comms, build briefs, extract action items, and verify AI output before you rely
            on it. The same discipline that keeps radio traffic clear, applied to everyday work.
          </p>
        </div>

        <div className="mb-12 grid max-w-5xl gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool, i) => (
            <Link
              key={tool.id}
              href={tool.href}
              className="group rounded-xl border border-white/10 bg-white/[0.04] p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-coolBlue-400/60 hover:bg-white/[0.08]"
            >
              <p className="mb-4 font-mono text-xs font-bold text-warmNeutral-500 transition-colors group-hover:text-coolBlue-400">
                {String(i + 1).padStart(2, '0')}
              </p>
              <h3 className="mb-1 font-bold text-warmNeutral-50 transition-colors group-hover:text-coolBlue-300">
                {tool.name}
              </h3>
              <p className="text-sm leading-relaxed text-warmNeutral-400">{tool.tagline}</p>
            </Link>
          ))}
          <div
            aria-hidden="true"
            className="hidden items-end rounded-xl border border-dashed border-white/10 p-6 lg:flex"
          >
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-warmNeutral-600">
              Free / no sign-up / rate-limited fairly
            </p>
          </div>
        </div>

        <Link
          href="/tools"
          className="inline-flex items-center gap-3 rounded-lg bg-coolBlue-500 px-7 py-3.5 font-bold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-coolBlue-400"
        >
          Open the Tools
          <span aria-hidden="true" className="font-mono">
            →
          </span>
        </Link>
      </div>
    </section>
  );
}
