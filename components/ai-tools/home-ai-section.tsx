import Link from 'next/link';
import { AI_TOOLS } from './tool-registry';

/** Homepage AI section — the five AI tools on the site's warm surface (2026-07-05). */
export function HomeAiSection() {
  const tools = AI_TOOLS.filter((tool) => tool.category === 'ai');

  return (
    <section className="bg-warmNeutral-50 py-20 dark:bg-warmNeutral-900 md:py-24">
      <div className="container px-6 md:px-8 lg:px-4">
        <div className="mb-12 flex max-w-5xl flex-col gap-6 md:mb-16 md:flex-row md:items-end md:justify-between">
          <h2 className="h2">Hours of work in minutes</h2>
          <p className="max-w-md text-base leading-relaxed text-gray-600 dark:text-warmNeutral-300 md:text-lg">
            Draft comms, build briefs, extract action items, and verify AI output before you rely
            on it. The same discipline that keeps radio traffic clear, applied to everyday work.
          </p>
        </div>

        <div className="mb-12 grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => (
            <Link
              key={tool.id}
              href={tool.href}
              className="group rounded-xl border border-warmNeutral-200 bg-white p-6 shadow-[0_16px_32px_-20px_rgba(41,37,36,0.35)] transition-all duration-200 hover:-translate-y-1 hover:border-coolBlue-400 hover:shadow-[0_24px_44px_-20px_rgba(37,99,235,0.3)] dark:border-warmNeutral-700 dark:bg-warmNeutral-800 dark:hover:border-coolBlue-500"
            >
              <h3 className="mb-1.5 text-lg font-bold transition-colors group-hover:text-coolBlue-600 dark:group-hover:text-coolBlue-300">
                {tool.name}
              </h3>
              <p className="text-[15px] leading-relaxed text-gray-600 dark:text-warmNeutral-300">
                {tool.tagline}
              </p>
            </Link>
          ))}
        </div>

        <Link
          href="/tools"
          className="inline-flex items-center gap-2 rounded-lg bg-coolBlue-600 px-8 py-4 text-lg font-bold text-white shadow-[0_14px_32px_-12px_rgba(37,99,235,0.6)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-coolBlue-500"
        >
          Open the Tools
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </section>
  );
}
