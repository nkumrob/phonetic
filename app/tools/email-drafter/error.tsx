'use client';

import { ToolErrorFallback } from '@/components/ai-tools/tool-error-fallback';

export default function EmailDrafterError(props: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ToolErrorFallback toolName="Email Drafter" contextId="email-drafter" {...props} />;
}
