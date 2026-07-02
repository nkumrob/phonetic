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
    id: 'phonetic-converter',
    name: 'Phonetic Converter',
    tagline: 'Spell anything with zero ambiguity — the NATO alphabet, instantly',
    href: '/tools',
    emoji: '📡',
  },
  {
    id: 'prompt-improver',
    name: 'AI Prompt Improver',
    tagline: 'Turn a rough request into a precise, structured AI instruction',
    href: '/tools/prompt-improver',
    emoji: '✨',
  },
  {
    id: 'email-drafter',
    name: 'Email Drafter',
    tagline: 'Status updates, incident comms, and reports — drafted in seconds',
    href: '/tools/email-drafter',
    emoji: '✉️',
  },
  {
    id: 'summarizer',
    name: 'Document Summarizer',
    tagline: 'Long reports and briefings condensed into decision-ready takeaways',
    href: '/tools/summarizer',
    emoji: '📄',
  },
  {
    id: 'meeting-actions',
    name: 'Meeting Notes → Actions',
    tagline: 'Debriefs and meetings turned into decisions, owners, and deadlines',
    href: '/tools/meeting-actions',
    emoji: '📋',
  },
  {
    id: 'output-checker',
    name: 'AI Output Checker',
    tagline: 'Verify before you rely — flag unverified claims and weak reasoning',
    href: '/tools/output-checker',
    emoji: '🔍',
  },
];
