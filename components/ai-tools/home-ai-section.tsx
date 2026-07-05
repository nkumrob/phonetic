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
            <p className="mb-4 font-mono text-[12px] font-bold uppercase tracking-[0.2em] text-coolBlue-300">
              AI Work Tools / 05 instruments
            </p>
            <h2 className="h2 text-white">Hours of work in minutes</h2>
          </div>
          <p className="max-w-md text-base leading-relaxed text-warmNeutral-200 md:text-lg">
            Draft comms, build briefs, extract action items, and verify AI output before you rely
            on it. The same discipline that keeps radio traffic clear, applied to everyday work.
          </p>
        </div>

        <div className="mb-12 grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool, i) => (
            <Link
              key={tool.id}
              href={tool.href}
              className="group rounded-xl border border-white/15 bg-white/[0.07] p-6 shadow-[0_16px_32px_-16px_rgba(0,0,0,0.6)] transition-all duration-200 hover:-translate-y-1 hover:border-coolBlue-400 hover:bg-white/[0.12]"
            >
              <p className="mb-4 inline-flex h-8 w-8 items-center justify-center rounded bg-coolBlue-500/25 font-mono text-xs font-bold text-coolBlue-200 transition-colors group-hover:bg-coolBlue-500 group-hover:text-white">
                {String(i + 1).padStart(2, '0')}
              </p>
              <h3 className="mb-1.5 text-lg font-bold text-white transition-colors group-hover:text-coolBlue-200">
                {tool.name}
              </h3>
              <p className="text-[15px] leading-relaxed text-warmNeutral-300">{tool.tagline}</p>
            </Link>
          ))}
          <div
            aria-hidden="true"
            className="hidden items-end rounded-xl border border-dashed border-white/15 p-6 lg:flex"
          >
            <p className="font-mono text-[12px] font-semibold uppercase tracking-[0.15em] text-warmNeutral-400">
              Free / no sign-up
            </p>
          </div>
        </div>

        <Link
          href="/tools"
          className="inline-flex items-center gap-3 rounded-lg bg-coolBlue-500 px-8 py-4 text-lg font-bold text-white shadow-[0_14px_32px_-12px_rgba(59,130,246,0.8)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-coolBlue-400"
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
