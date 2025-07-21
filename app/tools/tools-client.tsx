'use client';

import { TextConverter } from '@/components/phonetic/text-converter-fixed';
import { ReverseLookup } from '@/components/phonetic/reverse-lookup';
import { ErrorBoundary } from '@/components/error-boundary';

export default function ToolsPageClient() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="hero-content py-16">
        <h1 className="h1 text-center mb-4">
          Phonetic <span className="text-gradient">Tools</span>
        </h1>
        <p className="hero-description text-center max-w-2xl mx-auto">
          Convert text and lookup NATO phonetic code words instantly with our professional-grade tools
        </p>
      </section>

      <div className="container max-w-6xl mx-auto">
        {/* Text Converter Section */}
        <section className="mb-24">
          <div className="card card-interactive p-8 lg:p-12">
            <div className="text-center mb-10">
              <div className="feature-icon mx-auto mb-4">
                <span>🔄</span>
              </div>
              <h2 className="h3 mb-3">Text to Phonetic Converter</h2>
              <p className="text-body-lg text-secondary max-w-2xl mx-auto">
                Transform any text into NATO phonetic alphabet spelling for clear communication
              </p>
            </div>
            <ErrorBoundary>
              <TextConverter />
            </ErrorBoundary>
          </div>
        </section>

        {/* Reverse Lookup Section */}
        <section className="mb-24">
          <div className="card card-interactive p-8 lg:p-12">
            <div className="text-center mb-10">
              <div className="feature-icon mx-auto mb-4">
                <span>🔍</span>
              </div>
              <h2 className="h3 mb-3">Reverse Lookup</h2>
              <p className="text-body-lg text-secondary max-w-2xl mx-auto">
                Find letters by searching for their phonetic code words with intelligent fuzzy matching
              </p>
            </div>
            <ErrorBoundary>
              <ReverseLookup />
            </ErrorBoundary>
          </div>
        </section>

        {/* Additional Features */}
        <section className="grid md:grid-cols-2 gap-8 mb-16">
          <div className="card p-6">
            <h3 className="text-xl font-semibold mb-3">Quick Tips</h3>
            <ul className="space-y-2 text-secondary">
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span>Use uppercase letters for clearer phonetic conversion</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span>Numbers and special characters are spelled out automatically</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span>Copy results with one click for easy sharing</span>
              </li>
            </ul>
          </div>

          <div className="card p-6">
            <h3 className="text-xl font-semibold mb-3">Common Uses</h3>
            <ul className="space-y-2 text-secondary">
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>Spelling names over the phone or radio</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>Communicating serial numbers clearly</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>Professional aviation and maritime communications</span>
              </li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}