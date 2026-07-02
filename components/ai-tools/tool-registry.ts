/**
 * Client-safe display metadata for the AI tools (cards, pages).
 * Server-side behavior (models, prompts, limits) lives in lib/ai/config.ts.
 */

export interface AiToolMeta {
  id: string;
  name: string;
  tagline: string;
  href: string;
  emoji: string;
  category: 'ai' | 'phonetic';
}

export const AI_TOOLS: AiToolMeta[] = [
  {
    id: 'phonetic-converter',
    name: 'Phonetic Converter',
    tagline: 'Spell names, codes, and critical details clearly in calls, support, and field comms',
    href: '/tools/phonetic-converter',
    emoji: '📡',
    category: 'phonetic',
  },
  {
    id: 'prompt-improver',
    name: 'AI Prompt Improver',
    tagline: 'Turn vague requests into structured prompts with context, constraints, and format',
    href: '/tools/prompt-improver',
    emoji: '✨',
    category: 'ai',
  },
  {
    id: 'email-drafter',
    name: 'Email Drafter',
    tagline: 'Convert rough notes into clear professional emails, follow-ups, and replies',
    href: '/tools/email-drafter',
    emoji: '✉️',
    category: 'ai',
  },
  {
    id: 'summarizer',
    name: 'Document Summarizer',
    tagline: 'Extract key points, risks, and action items from long documents and reports',
    href: '/tools/summarizer',
    emoji: '📄',
    category: 'ai',
  },
  {
    id: 'meeting-actions',
    name: 'Meeting Notes → Actions',
    tagline: 'Turn meeting notes into decisions, owners, deadlines, and next steps',
    href: '/tools/meeting-actions',
    emoji: '📋',
    category: 'ai',
  },
  {
    id: 'output-checker',
    name: 'AI Output Checker',
    tagline: 'Review AI answers for gaps, weak reasoning, overclaiming, and missing support',
    href: '/tools/output-checker',
    emoji: '🔍',
    category: 'ai',
  },
];
