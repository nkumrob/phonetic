import { Metadata } from 'next';
import { generateMetadata as baseGenerateMetadata } from '@/lib/seo/metadata';
import { AiToolPageShell, PromptImprover } from '@/components/ai-tools';

export const metadata: Metadata = baseGenerateMetadata(
  'AI Prompt Improver',
  'Turn rough ideas into clear, effective AI prompts with structured role, context, task, and constraints',
  '/tools/prompt-improver'
);

export default function PromptImproverPage() {
  return (
    <AiToolPageShell
      title="AI Prompt Improver"
      description="Paste a rough prompt and get back a clear, structured version with role, context, task, constraints, and output format, ready to use with any AI assistant."
    >
      <PromptImprover />
    </AiToolPageShell>
  );
}
