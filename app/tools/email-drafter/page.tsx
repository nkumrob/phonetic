import { Metadata } from 'next';
import { generateMetadata as baseGenerateMetadata } from '@/lib/seo/metadata';
import { AiToolForm, AiToolPageShell } from '@/components/ai-tools';

export const metadata: Metadata = baseGenerateMetadata(
  'AI Email Drafter',
  'Turn rough notes into a professional, ready-to-send email in seconds',
  '/tools/email-drafter'
);

export default function EmailDrafterPage() {
  return (
    <AiToolPageShell
      title="AI Email Drafter"
      description="Type what you need to say — rough notes, bullet points, or a one-line description — and get back a polished, professional email with subject line, ready to send."
    >
      <AiToolForm
        toolId="email-drafter"
        inputLabel="What does the email need to say?"
        placeholder="e.g. tell my team the launch moved to Friday, apologize for short notice, ask everyone to update their tasks by Wednesday"
        buttonText="Draft My Email"
        loadingText="Drafting…"
        resultTitle="Draft email"
        maxChars={4000}
        rows={5}
      />
    </AiToolPageShell>
  );
}
