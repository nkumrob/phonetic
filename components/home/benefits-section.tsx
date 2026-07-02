import Link from 'next/link';

const BENEFITS = [
  {
    emoji: '⚡',
    title: 'Write faster',
    body: 'Emails, updates, and reports drafted from rough notes in seconds — not sessions.',
    who: 'For anyone whose day is half writing',
    href: '/tools/email-drafter',
    cta: 'Draft an email',
  },
  {
    emoji: '🎯',
    title: 'Decide with confidence',
    body: 'Long documents become key points, risks, and action items you can act on.',
    who: 'For managers, analysts, and coordinators',
    href: '/tools/summarizer',
    cta: 'Summarize a document',
  },
  {
    emoji: '🛡️',
    title: 'Trust what AI tells you',
    body: 'Catch unsupported claims, weak reasoning, and overclaiming before they cost you.',
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
          <h2 className="h2 mb-6">What You Get</h2>
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
