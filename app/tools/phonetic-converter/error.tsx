'use client';

import { ToolErrorFallback } from '@/components/ai-tools/tool-error-fallback';

export default function PhoneticConverterError(props: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ToolErrorFallback toolName="Phonetic Converter" contextId="phonetic-converter" {...props} />;
}
