import { Metadata } from 'next';
import { TextConverter } from '@/components/phonetic/text-converter';
import { ReverseLookup } from '@/components/phonetic/reverse-lookup';
import { ErrorBoundary } from '@/components/error-boundary';
import { generateMetadata as baseGenerateMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = baseGenerateMetadata(
  'NATO Phonetic Alphabet Tools',
  'Convert text to phonetic alphabet and lookup code words',
  '/tools'
);

export default function ToolsPage() {
  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center py-8">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Phonetic Tools
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Convert text and lookup NATO phonetic code words instantly
        </p>
      </section>

      {/* Text Converter */}
      <section id="converter">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-semibold mb-2">
            Text to Phonetic Converter
          </h2>
          <p className="text-muted-foreground">
            Convert any text into NATO phonetic alphabet spelling
          </p>
        </div>
        <ErrorBoundary>
          <TextConverter />
        </ErrorBoundary>
      </section>

      <hr className="border-border" />

      {/* Reverse Lookup */}
      <section id="lookup">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-semibold mb-2">
            Reverse Lookup
          </h2>
          <p className="text-muted-foreground">
            Find letters by searching for their phonetic code words
          </p>
        </div>
        <ErrorBoundary>
          <ReverseLookup />
        </ErrorBoundary>
      </section>
    </div>
  );
}