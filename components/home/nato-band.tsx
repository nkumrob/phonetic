import Link from 'next/link';

/** Compact NATO entry point — replaces the deep NATO sections on the homepage. */
export function NatoBand() {
  return (
    <section className="py-16 md:py-20 bg-coolBlue-50 dark:bg-coolBlue-900/10">
      <div className="container px-6 md:px-8 lg:px-4 text-center">
        <h2 className="h2 mb-4">Need the NATO alphabet right now?</h2>
        <p className="text-body-lg text-secondary max-w-2xl mx-auto mb-8 leading-relaxed">
          The converter, the full A–Z chart with audio, and practice drills are one click away.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/tools/phonetic-converter" className="btn btn-primary inline-flex items-center justify-center">
            Try the Converter
          </Link>
          <Link href="/learn" className="btn btn-secondary inline-flex items-center justify-center">
            Learn the Alphabet
          </Link>
          <Link href="/api/pdf" download="nato-phonetic-alphabet.html" className="btn btn-secondary inline-flex items-center justify-center">
            Download the Chart
          </Link>
        </div>
      </div>
    </section>
  );
}
