import { Metadata } from 'next';
import { generateMetadata as baseGenerateMetadata } from '@/lib/seo/metadata';
import { ErrorBoundary } from '@/components/error-boundary';
import { PromptImprover } from '@/components/ai-tools';

export const metadata: Metadata = baseGenerateMetadata(
  'AI Prompt Improver',
  'Turn rough ideas into clear, effective AI prompts with structured role, context, task, and constraints',
  '/tools/prompt-improver'
);

export default function PromptImproverPage() {
  return (
    <div className="container max-w-3xl mx-auto px-4 py-12 space-y-8">
      <div className="text-center space-y-3">
        <h1 className="text-4xl sm:text-5xl font-black tracking-headlines">
          AI Prompt Improver
        </h1>
        <p className="text-lg text-secondary max-w-2xl mx-auto">
          Paste a rough prompt and get back a clear, structured version with role, context,
          task, constraints, and output format — ready to use with any AI assistant.
        </p>
      </div>
      <ErrorBoundary>
        <PromptImprover />
      </ErrorBoundary>
    </div>
  );
}
