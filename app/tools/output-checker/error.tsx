'use client';

import { ToolErrorFallback } from '@/components/ai-tools/tool-error-fallback';

export default function OutputCheckerError(props: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ToolErrorFallback toolName="AI Output Checker" contextId="output-checker" {...props} />;
}
