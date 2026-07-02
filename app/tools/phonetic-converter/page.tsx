import { Metadata } from 'next';
import { generateMetadata as baseGenerateMetadata } from '@/lib/seo/metadata';
import { ErrorBoundary } from '@/components/error-boundary';
import { LazyReverseLookup } from '@/components/lazy';
import { InlineTextConverter } from '@/components/phonetic/inline-text-converter';
import { Icons } from '@/components/ui/icons';

export const metadata: Metadata = baseGenerateMetadata(
  'NATO Phonetic Alphabet Converter',
  'Convert any text to NATO phonetic code words instantly, with audio, reverse lookup, and a printable chart',
  '/tools/phonetic-converter'
);

export default function PhoneticConverterPage() {
  return (
    <div className="container max-w-4xl mx-auto px-4 py-12 space-y-12">
      <div className="text-center space-y-3">
        <h1 className="text-4xl sm:text-5xl font-black tracking-headlines">
          NATO Phonetic Converter
        </h1>
        <p className="text-lg text-secondary max-w-2xl mx-auto">
          Type or paste any text and get the phonetic spelling instantly. Hear it spoken,
          copy it, or share it.
        </p>
      </div>

      <ErrorBoundary>
        <InlineTextConverter />
      </ErrorBoundary>

      <ErrorBoundary>
        <LazyReverseLookup />
      </ErrorBoundary>

      {/* PDF Download Section */}
      <div className="bg-white dark:bg-warmNeutral-800 rounded-xl shadow-lg border border-warmNeutral-200 dark:border-warmNeutral-700 p-6 space-y-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-50 dark:bg-green-900/20 rounded-xl mx-auto mb-4 flex items-center justify-center">
            <Icons.download size={32} className="text-green-600" />
          </div>
          <h3 className="text-2xl font-bold tracking-largeText mb-3">Printable PDF &amp; Download</h3>
          <p className="text-base text-secondary max-w-2xl mx-auto mb-6">
            Download a professional NATO phonetic alphabet reference chart for offline use
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="/api/pdf"
              download="nato-phonetic-alphabet.html"
              className="btn btn-primary btn-lg inline-flex items-center gap-2"
            >
              <Icons.download size={20} />
              Download PDF Chart
            </a>
            <div className="text-sm text-secondary">
              <p>• Professional A4 format</p>
              <p>• Clear pronunciation guide</p>
              <p>• Print-ready design</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tips section */}
      <div className="grid sm:grid-cols-2 gap-4 sm:gap-8">
        <div className="bg-white dark:bg-warmNeutral-800 rounded-xl shadow-lg border border-warmNeutral-200 dark:border-warmNeutral-700 p-6">
          <h3 className="text-xl font-bold tracking-largeText mb-3">Quick Tips</h3>
          <ul className="space-y-2 text-secondary">
            <li className="flex items-start gap-2">
              <Icons.checkCircle size={20} className="text-green-500 mt-0.5 flex-shrink-0" />
              <span>Use uppercase letters for clearer phonetic conversion</span>
            </li>
            <li className="flex items-start gap-2">
              <Icons.checkCircle size={20} className="text-green-500 mt-0.5 flex-shrink-0" />
              <span>Numbers and special characters are spelled out automatically</span>
            </li>
            <li className="flex items-start gap-2">
              <Icons.checkCircle size={20} className="text-green-500 mt-0.5 flex-shrink-0" />
              <span>Copy results with one click for easy sharing</span>
            </li>
          </ul>
        </div>

        <div className="bg-white dark:bg-warmNeutral-800 rounded-xl shadow-lg border border-warmNeutral-200 dark:border-warmNeutral-700 p-6">
          <h3 className="text-xl font-bold tracking-largeText mb-3">Common Uses</h3>
          <ul className="space-y-2 text-secondary">
            <li className="flex items-start gap-2">
              <span className="text-coolBlue-500 mt-1">•</span>
              <span>Spelling names over the phone or radio</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-coolBlue-500 mt-1">•</span>
              <span>Communicating serial numbers clearly</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-coolBlue-500 mt-1">•</span>
              <span>Professional aviation and maritime communications</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
