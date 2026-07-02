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
      description="Paste a report, policy, or long thread and get a TL;DR, key points ordered by importance, and action items. Faithful to the source, nothing added."
    >
      <AiToolForm
        toolId="summarizer"
        inputLabel="Paste the text to summarize"
        placeholder="Paste a report, policy, incident log, or long email thread (up to 12,000 characters)…"
        buttonText="Summarize"
        loadingText="Summarizing…"
        resultTitle="Summary"
        maxChars={12000}
        rows={10}
      />
    </AiToolPageShell>
  );
}
