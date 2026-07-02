/**
 * Client-safe display metadata for the AI tools (cards, pages, sitemap).
 * Server-side behavior (models, prompts, limits) lives in lib/ai/config.ts.
 */

export interface AiToolMeta {
  id: string;
  name: string;
  tagline: string;
  href: string;
  emoji: string;
}

export const AI_TOOLS: AiToolMeta[] = [
  {
    id: 'prompt-improver',
    name: 'AI Prompt Improver',
    tagline: 'Turn a rough idea into a clear, structured AI prompt',
    href: '/tools/prompt-improver',
    emoji: '✨',
  },
  {
    id: 'email-drafter',
    name: 'Email Drafter',
    tagline: 'Rough notes in, professional ready-to-send email out',
    href: '/tools/email-drafter',
    emoji: '✉️',
  },
  {
    id: 'summarizer',
    name: 'Document Summarizer',
    tagline: 'Long reports and threads condensed into decision-ready takeaways',
    href: '/tools/summarizer',
    emoji: '📄',
  },
  {
    id: 'meeting-actions',
    name: 'Meeting Notes → Actions',
    tagline: 'Raw meeting notes turned into decisions, owners, and deadlines',
    href: '/tools/meeting-actions',
    emoji: '📋',
  },
  {
    id: 'output-checker',
    name: 'AI Output Checker',
    tagline: 'Spot unverified claims and weak reasoning before you rely on AI answers',
    href: '/tools/output-checker',
    emoji: '🔍',
  },
];
