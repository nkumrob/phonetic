import { Metadata } from 'next';
import { generateMetadata as baseGenerateMetadata } from '@/lib/seo/metadata';
import { AiToolForm, AiToolPageShell } from '@/components/ai-tools';

export const metadata: Metadata = baseGenerateMetadata(
  'AI Document Summarizer',
  'Condense long reports, articles, and email threads into decision-ready takeaways',
  '/tools/summarizer'
);

export default function SummarizerPage() {
  return (
    <AiToolPageShell
      title="AI Document Summarizer"
      description="Paste a report, article, policy, or long email thread and get a TL;DR, the key points ordered by importance, and any action items — with nothing added that isn't in the original."
    >
      <AiToolForm
        toolId="summarizer"
        inputLabel="Paste the text to summarize"
        placeholder="Paste a report, article, policy document, or email thread (up to 12,000 characters)…"
        buttonText="Summarize"
        loadingText="Summarizing…"
        resultTitle="Summary"
        maxChars={12000}
        rows={10}
      />
    </AiToolPageShell>
  );
}
