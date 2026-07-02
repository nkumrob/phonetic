import Link from 'next/link';

const BENEFITS = [
  {
    emoji: '⚡',
    title: 'Comms out in seconds',
    body: 'Status updates, incident emails, and reports drafted from rough notes, sent with confidence.',
    who: 'For anyone reporting up the chain',
    href: '/tools/email-drafter',
    cta: 'Draft an update',
  },
  {
    emoji: '🎯',
    title: 'Brief, don’t bury',
    body: 'Long reports and briefings become key points, risks, and action items you can act on.',
    who: 'For leads, coordinators, and analysts',
    href: '/tools/summarizer',
    cta: 'Build a brief',
  },
  {
    emoji: '🛡️',
    title: 'Verify before you rely',
    body: 'Catch unsupported claims and weak reasoning before they reach an operation or a client.',
    who: 'For everyone who double-checks',
    href: '/tools/output-checker',
    cta: 'Check an AI answer',
  },
];

/** Outcome-focused benefits row (homepage slimming, spec amendment 2026-07-01). */
export function BenefitsSection() {
  return (
    <section className="py-16 md:py-20">
      <div className="container px-6 md:px-8 lg:px-4">
        <div className="text-center mb-10 md:mb-12">
          <h2 className="h2 mb-6">Made for High-Stakes Work</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {BENEFITS.map((b) => (
            <div
              key={b.title}
              className="p-6 rounded-xl bg-white dark:bg-warmNeutral-800 border border-warmNeutral-200 dark:border-warmNeutral-700"
            >
              <div className="text-3xl mb-3" aria-hidden="true">{b.emoji}</div>
              <h3 className="text-xl font-bold mb-2">{b.title}</h3>
              <p className="text-body text-secondary mb-2 leading-relaxed">{b.body}</p>
              <p className="text-sm text-tertiary mb-4">{b.who}</p>
              <Link href={b.href} className="text-sm font-semibold text-coolBlue-500 hover:text-coolBlue-600">
                {b.cta} →
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
