import { Metadata } from 'next';
import { generateMetadata as baseGenerateMetadata } from '@/lib/seo/metadata';
import { AiToolForm, AiToolPageShell } from '@/components/ai-tools';

export const metadata: Metadata = baseGenerateMetadata(
  'AI Output Checker',
  'Review AI-generated text for unverified claims, weak reasoning, and missing context before you rely on it',
  '/tools/output-checker'
);

export default function OutputCheckerPage() {
  return (
    <AiToolPageShell
      title="AI Output Checker"
      description="Before you act on an AI answer, get a reliability read: which specific claims to verify, signs of weak reasoning or overconfidence, and what context is missing. Built for people who double-check."
    >
      <AiToolForm
        toolId="output-checker"
        inputLabel="Paste the AI output to check"
        placeholder="Paste the AI-generated text you want reviewed (up to 12,000 characters)…"
        buttonText="Check This Output"
        loadingText="Reviewing…"
        resultTitle="Reliability review"
        maxChars={12000}
        rows={10}
      />
    </AiToolPageShell>
  );
}
