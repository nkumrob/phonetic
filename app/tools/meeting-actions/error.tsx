'use client';

import { ToolErrorFallback } from '@/components/ai-tools/tool-error-fallback';

export default function MeetingActionsError(props: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ToolErrorFallback toolName="Meeting Notes → Actions" contextId="meeting-actions" {...props} />
  );
}
