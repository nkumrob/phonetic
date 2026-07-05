import Link from 'next/link';

const BENEFITS = [
  {
    title: 'Comms out in seconds',
    body: 'Status updates, incident emails, and reports drafted from rough notes, sent with confidence.',
    who: 'For anyone reporting up the chain.',
    href: '/tools/email-drafter',
    cta: 'Draft an update',
  },
  {
    title: 'Brief, don’t bury',
    body: 'Long reports and briefings become key points, risks, and action items you can act on.',
    who: 'For leads, coordinators, and analysts.',
    href: '/tools/summarizer',
    cta: 'Build a brief',
  },
  {
    title: 'Verify before you rely',
    body: 'Catch unsupported claims and weak reasoning before they reach an operation or a client.',
    who: 'For everyone who double-checks.',
    href: '/tools/output-checker',
    cta: 'Check an AI answer',
  },
];

/** Outcome-focused benefits row (homepage slimming, spec amendment 2026-07-01). */
export function BenefitsSection() {
  return (
    <section className="border-t border-warmNeutral-200 bg-white py-20 dark:border-warmNeutral-700 dark:bg-warmNeutral-900 md:py-24">
      <div className="container px-6 md:px-8 lg:px-4">
        <div className="mb-12 max-w-5xl md:mb-16">
          <h2 className="h2">Made for High-Stakes Work</h2>
        </div>
        <div className="grid max-w-5xl gap-10 md:grid-cols-3 md:gap-8">
          {BENEFITS.map((b) => (
            <div key={b.title}>
              <h3 className="mb-3 text-xl font-bold tracking-tight">{b.title}</h3>
              <p className="mb-2 text-base leading-relaxed text-gray-600 dark:text-warmNeutral-300">
                {b.body}
              </p>
              <p className="mb-5 text-sm text-gray-500 dark:text-warmNeutral-400">{b.who}</p>
              <Link
                href={b.href}
                className="text-sm font-semibold text-coolBlue-600 transition-colors hover:text-coolBlue-700 hover:underline dark:text-coolBlue-300 dark:hover:text-coolBlue-200"
              >
                {b.cta} →
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
