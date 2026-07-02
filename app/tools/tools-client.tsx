'use client';

import { AiToolsGrid } from '@/components/ai-tools';

export default function ToolsPageClient() {
  return (
    <div className="min-h-screen">
      {/* Hero Section - Mobile Optimized */}
      <section className="container mx-auto px-4 py-8 sm:py-16">
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-headlines text-center mb-4">
          Productivity Tools
        </h1>
        <p className="text-lg sm:text-xl text-secondary text-center max-w-2xl mx-auto">
          Practical AI tools for prompting, writing, summarizing, and reviewing — plus the phonetic
          converter that started it all
        </p>
      </section>

      <div className="container max-w-6xl mx-auto px-4">
        {/* AI Tools Section */}
        <section className="mb-16">
          <AiToolsGrid />
        </section>
      </div>
    </div>
  );
}
