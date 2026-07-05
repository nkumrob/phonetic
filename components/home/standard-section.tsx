import Link from 'next/link';

const PREVIEW: Array<[string, string]> = [
  ['A', 'Alpha'],
  ['B', 'Bravo'],
  ['C', 'Charlie'],
  ['D', 'Delta'],
  ['E', 'Echo'],
  ['F', 'Foxtrot'],
];

const LINK_CLASS =
  'text-sm font-semibold text-coolBlue-500 hover:text-coolBlue-600 dark:text-coolBlue-400 dark:hover:text-coolBlue-300';

/** Compact keyword-rich NATO provenance section; the single NATO block on the homepage (2026-07-05). */
export function StandardSection() {
  return (
    <section className="py-16 md:py-20 bg-warmNeutral-50 dark:bg-warmNeutral-900">
      <div className="container px-6 md:px-8 lg:px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="h2 mb-6">Built on the NATO Phonetic Alphabet</h2>
          <p className="text-body-lg text-secondary leading-relaxed mb-10">
            The NATO phonetic alphabet assigns a code word to each of the 26 letters, Alpha through
            Zulu, so critical information is heard correctly the first time. Aviation, maritime,
            and emergency professionals rely on it worldwide. Our AI tools bring the same
            discipline to everyday work.
          </p>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-10">
            {PREVIEW.map(([letter, word]) => (
              <div
                key={letter}
                className="p-3 rounded-xl bg-white dark:bg-warmNeutral-800 border border-warmNeutral-200 dark:border-warmNeutral-700"
              >
                <div className="text-2xl font-black text-coolBlue-500">{letter}</div>
                <div className="text-xs font-semibold text-secondary">{word}</div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            <Link href="/tools/phonetic-converter" className={LINK_CLASS}>
              Convert text →
            </Link>
            <a href="/api/pdf" download="nato-phonetic-alphabet-chart.pdf" className={LINK_CLASS}>
              Download the chart →
            </a>
            <Link href="/learn" className={LINK_CLASS}>
              Learn the full alphabet →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
