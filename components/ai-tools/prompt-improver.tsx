'use client';

import { AiToolForm } from './ai-tool-form';

/** The Prompt Improver tool: rough prompt in, structured prompt out. */
export function PromptImprover() {
  return (
    <AiToolForm
      toolId="prompt-improver"
      inputLabel="Your rough prompt"
      placeholder="e.g. write an email to my landlord about the broken heater"
      buttonText="Improve My Prompt"
      loadingText="Improving…"
      resultTitle="Improved prompt"
      maxChars={2000}
      rows={4}
    />
  );
}
