'use client';

import { LazyTextConverter, LazyReverseLookup } from '@/components/lazy';
import { ErrorBoundary } from '@/components/error-boundary';
import { Icons } from '@/components/ui/icons';

export default function ToolsPageClient() {
  return (
    <div className="min-h-screen">
      {/* Hero Section - Mobile Optimized */}
      <section className="container mx-auto px-4 py-8 sm:py-16">
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-headlines text-center mb-4">
          Phonetic Tools
        </h1>
        <p className="text-lg sm:text-xl text-secondary text-center max-w-2xl mx-auto">
          Convert text and lookup NATO phonetic code words instantly with our professional-grade tools
        </p>
      </section>

      <div className="container max-w-6xl mx-auto px-4">
        {/* Text Converter Section */}
        <section className="mb-12 sm:mb-24">
          <div className="bg-background border-2 border-border rounded-xl p-6 sm:p-8 lg:p-12 hover:border-primary hover:shadow-lg transition-all duration-200">
            <div className="text-center mb-8 sm:mb-10">
              <div className="w-16 h-16 bg-coolBlue-50 dark:bg-coolBlue-900/20 rounded-xl mx-auto mb-4 flex items-center justify-center">
                <Icons.convert size={32} className="text-coolBlue-500" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-black tracking-largeText mb-3">Text to Phonetic Converter</h2>
              <p className="text-base sm:text-lg text-secondary max-w-2xl mx-auto">
                Transform any text into NATO phonetic alphabet spelling for clear communication
              </p>
            </div>
            <ErrorBoundary>
              <LazyTextConverter />
            </ErrorBoundary>
          </div>
        </section>

        {/* Reverse Lookup Section */}
        <section className="mb-12 sm:mb-24">
          <div className="bg-background border-2 border-border rounded-xl p-6 sm:p-8 lg:p-12 hover:border-primary hover:shadow-lg transition-all duration-200">
            <div className="text-center mb-8 sm:mb-10">
              <div className="w-16 h-16 bg-warmAmber-50 dark:bg-warmAmber-900/20 rounded-xl mx-auto mb-4 flex items-center justify-center">
                <Icons.search size={32} className="text-warmAmber-600" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-black tracking-largeText mb-3">Reverse Lookup</h2>
              <p className="text-base sm:text-lg text-secondary max-w-2xl mx-auto">
                Find letters by searching for their phonetic code words with intelligent fuzzy matching
              </p>
            </div>
            <ErrorBoundary>
              <LazyReverseLookup />
            </ErrorBoundary>
          </div>
        </section>

        {/* PDF Download Section */}
        <section className="mb-12 sm:mb-24">
          <div className="bg-background border-2 border-border rounded-xl p-6 sm:p-8 lg:p-12 hover:border-primary hover:shadow-lg transition-all duration-200">
            <div className="text-center mb-8 sm:mb-10">
              <div className="w-16 h-16 bg-green-50 dark:bg-green-900/20 rounded-xl mx-auto mb-4 flex items-center justify-center">
                <Icons.download size={32} className="text-green-600" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-black tracking-largeText mb-3">Printable PDF & Download</h2>
              <p className="text-base sm:text-lg text-secondary max-w-2xl mx-auto mb-8">
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
        </section>

        {/* Additional Features - Mobile Responsive */}
        <section className="grid sm:grid-cols-2 gap-4 sm:gap-8 mb-16">
          <div className="bg-background border-2 border-border rounded-xl p-6 hover:shadow-md transition-all duration-200">
            <h3 className="text-2xl font-bold tracking-largeText mb-3">Quick Tips</h3>
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

          <div className="bg-background border-2 border-border rounded-xl p-6 hover:shadow-md transition-all duration-200">
            <h3 className="text-2xl font-bold tracking-largeText mb-3">Common Uses</h3>
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
        </section>
      </div>
    </div>
  );
}