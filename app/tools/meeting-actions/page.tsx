import { Metadata } from 'next';
import { generateMetadata as baseGenerateMetadata } from '@/lib/seo/metadata';
import { AiToolForm, AiToolPageShell } from '@/components/ai-tools';

export const metadata: Metadata = baseGenerateMetadata(
  'Meeting Notes to Action Items',
  'Turn raw meeting notes into organized decisions, action items with owners, and follow-ups',
  '/tools/meeting-actions'
);

export default function MeetingActionsPage() {
  return (
    <AiToolPageShell
      title="Meeting Notes → Action Items"
      description="Paste your raw meeting notes or a transcript excerpt and get back the decisions made, action items with owners and deadlines, open questions, and follow-ups. Nothing invented, nothing missed."
    >
      <AiToolForm
        toolId="meeting-actions"
        inputLabel="Paste your meeting notes"
        placeholder="Paste meeting notes, shift-handoff notes, or a transcript excerpt (up to 12,000 characters)…"
        buttonText="Extract Action Items"
        loadingText="Extracting…"
        resultTitle="Decisions & action items"
        maxChars={12000}
        rows={10}
      />
    </AiToolPageShell>
  );
}
