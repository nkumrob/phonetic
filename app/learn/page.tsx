import { Metadata } from 'next';
import { AlphabetGrid } from '@/components/phonetic/alphabet-grid';
import { DownloadChart } from '@/components/phonetic/download-chart';
import { ErrorBoundary } from '@/components/error-boundary';
import { generateMetadata as baseGenerateMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = baseGenerateMetadata(
  'Learn NATO Phonetic Alphabet',
  'Interactive guide to learn the NATO phonetic alphabet with audio pronunciation and visual aids',
  '/learn'
);

export default function LearnPage() {
  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center py-8">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Learn the NATO Alphabet
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Master each letter with interactive cards, audio pronunciation, and helpful mnemonics
        </p>
      </section>

      {/* Alphabet Grid */}
      <section>
        <ErrorBoundary>
          <AlphabetGrid />
        </ErrorBoundary>
      </section>

      {/* Download Section */}
      <section className="text-center">
        <h2 className="text-2xl font-semibold mb-4">
          Take It With You
        </h2>
        <p className="text-muted-foreground mb-6">
          Download or print a reference chart for offline use
        </p>
        <ErrorBoundary>
          <DownloadChart />
        </ErrorBoundary>
      </section>
    </div>
  );
}