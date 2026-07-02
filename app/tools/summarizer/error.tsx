'use client';

import { ToolErrorFallback } from '@/components/ai-tools/tool-error-fallback';

export default function SummarizerError(props: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ToolErrorFallback toolName="Document Summarizer" contextId="summarizer" {...props} />;
}
