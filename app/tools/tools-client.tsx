'use client';

import Link from 'next/link';

import { AI_TOOLS, TimeSavedBanner, type AiToolMeta } from '@/components/ai-tools';

interface ReferenceCard {
  name: string;
  tagline: string;
  href: string;
  emoji: string;
  download?: boolean;
}

const REFERENCE_CARDS: ReferenceCard[] = [
  {
    name: 'Printable Chart',
    tagline: 'A print-ready NATO alphabet reference chart for offline use',
    href: '/api/pdf',
    emoji: '🖨️',
    download: true,
  },
  {
    name: 'Learn the Alphabet',
    tagline: 'All 26 code words with audio pronunciation and memory aids',
    href: '/learn',
    emoji: '📚',
  },
  {
    name: 'Practice & Quiz',
    tagline: 'Drills, quizzes, and achievements to make it stick',
    href: '/practice',
    emoji: '🎯',
  },
];

function ToolCard({
  tool,
}: {
  tool: Pick<AiToolMeta, 'name' | 'tagline' | 'href' | 'emoji'> & { download?: boolean };
}) {
  return (
    <Link
      href={tool.href}
      {...(tool.download ? { download: 'nato-phonetic-alphabet.html' } : {})}
      className="group p-5 rounded-xl bg-white dark:bg-warmNeutral-800 border border-warmNeutral-200 dark:border-warmNeutral-700 hover:border-warmAmber-300 dark:hover:border-warmAmber-700 hover:shadow-md transition-all"
    >
      <div className="text-3xl mb-3" aria-hidden="true">
        {tool.emoji}
      </div>
      <h3 className="font-bold text-warmNeutral-800 dark:text-warmNeutral-100 group-hover:text-warmAmber-700 dark:group-hover:text-warmAmber-400 transition-colors mb-1">
        {tool.name}
      </h3>
      <p className="text-sm text-secondary">{tool.tagline}</p>
    </Link>
  );
}

export default function ToolsPageClient() {
  const aiTools = AI_TOOLS.filter((tool) => tool.category === 'ai');
  const phoneticTool = AI_TOOLS.find((tool) => tool.category === 'phonetic');

  return (
    <div className="min-h-screen">
      <section className="container mx-auto px-4 py-8 sm:py-16">
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-headlines text-center mb-4">
          Productivity Tools
        </h1>
        <p className="text-lg sm:text-xl text-secondary text-center max-w-2xl mx-auto">
          AI productivity for mission-critical work: comms, briefs, action items, and
          verification, plus the phonetic converter that started it all
        </p>
        <TimeSavedBanner />
      </section>

      <div className="container max-w-6xl mx-auto px-4 pb-16 space-y-14">
        <section>
          <h2 className="text-2xl font-bold tracking-largeText mb-6">AI Work Tools</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {aiTools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold tracking-largeText mb-6">
            Phonetic &amp; Reference
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {phoneticTool && <ToolCard tool={phoneticTool} />}
            {REFERENCE_CARDS.map((card) => (
              <ToolCard key={card.name} tool={card} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
