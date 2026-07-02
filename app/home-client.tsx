'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { HomeAiSection } from '@/components/ai-tools/home-ai-section';
import { HomeHero } from '@/components/home/home-hero';
import { BenefitsSection } from '@/components/home/benefits-section';

const FamewallWidget = dynamic(() => import('@/components/famewall').then(mod => ({ default: mod.FamewallWidget })), {
  loading: () => <div className="h-96 animate-pulse bg-warmNeutral-100 dark:bg-warmNeutral-800 rounded-xl" />,
  ssr: false,
});

const TestimonialsGrid = dynamic(() => import('@/components/testimonials').then(mod => ({ default: mod.TestimonialsGrid })), {
  loading: () => <div className="h-96 animate-pulse bg-warmNeutral-100 dark:bg-warmNeutral-800 rounded-xl" />,
  ssr: false,
});

export default function HomeClient() {
  return (
    <>
      {/* Hero — NATO phonetic leads, AI bridge in subhead */}
      <HomeHero />

      {/* NATO features — the main product */}
      <section className="py-16 md:py-20">
        <div className="container px-6 md:px-8 lg:px-4">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="h2 mb-6">What Is the NATO Phonetic Alphabet?</h2>
          <p className="text-body-lg text-secondary max-w-3xl mx-auto leading-relaxed">
            The NATO phonetic alphabet is a standardized set of 26 code words used to clearly communicate
            letters over radio and telephone. Each letter from A to Z is assigned a specific word (Alpha, Bravo, Charlie, etc.)
            to eliminate confusion in voice communications.
          </p>
        </div>

        <div className="feature-grid stagger">
          {/* Learn Card */}
          <Link href="/learn" className="card card-interactive group">
            <div className="w-14 h-14 md:w-16 md:h-16 bg-warmAmber-50 dark:bg-warmAmber-900/20 rounded-xl flex items-center justify-center mb-5 md:mb-6 group-hover:scale-110 transition-transform duration-200">
              <span className="text-3xl md:text-4xl">📚</span>
            </div>
            <h3 className="text-xl md:text-2xl font-bold mb-3 group-hover:text-coolBlue-500 transition-colors">
              Interactive Learning
            </h3>
            <p className="text-body text-secondary mb-6 leading-relaxed">
              Learn clear communication through short lessons, guided practice, and real workplace
              scenarios.
            </p>
            <ul className="space-y-3 text-sm text-tertiary">
              <li className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Native speaker pronunciation
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                IPA phonetic notation
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Keyboard navigation support
              </li>
            </ul>
          </Link>

          {/* Practice Card */}
          <Link href="/practice" className="card card-interactive group">
            <div className="w-14 h-14 md:w-16 md:h-16 bg-coolBlue-50 dark:bg-coolBlue-900/20 rounded-xl flex items-center justify-center mb-5 md:mb-6 group-hover:scale-110 transition-transform duration-200">
              <span className="text-3xl md:text-4xl">🎯</span>
            </div>
            <h3 className="text-xl md:text-2xl font-bold mb-3 group-hover:text-coolBlue-500 transition-colors">
              Practice Modes
            </h3>
            <p className="text-body text-secondary mb-6 leading-relaxed">
              Improve performance through drills, prompt exercises, and repeatable workflow practice.
            </p>
            <ul className="space-y-3 text-sm text-tertiary">
              <li className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                5 difficulty levels
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Speed &amp; survival modes
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Achievement system
              </li>
            </ul>
          </Link>

          {/* Tools Card */}
          <Link href="/tools" className="card card-interactive group">
            <div className="w-14 h-14 md:w-16 md:h-16 bg-warmNeutral-100 dark:bg-warmNeutral-800 rounded-xl flex items-center justify-center mb-5 md:mb-6 group-hover:scale-110 transition-transform duration-200">
              <span className="text-3xl md:text-4xl">🛠️</span>
            </div>
            <h3 className="text-xl md:text-2xl font-bold mb-3 group-hover:text-coolBlue-500 transition-colors">
              Professional Tools
            </h3>
            <p className="text-body text-secondary mb-6 leading-relaxed">
              Use production-ready utilities for writing, summarizing, reviewing, and structured
              communication.
            </p>
            <ul className="space-y-3 text-sm text-tertiary">
              <li className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Real-time converter
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Fuzzy search lookup
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                PDF generation
              </li>
            </ul>
          </Link>
        </div>
        </div>
      </section>

      {/* AI tools — the supporting act */}
      <HomeAiSection />

      {/* Outcome-focused benefits */}
      <BenefitsSection />

      {/* Statistics Section */}
      <section className="py-16 md:py-20 bg-warmNeutral-50 dark:bg-warmNeutral-900">
        <div className="container px-6 md:px-8 lg:px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 text-center">
            <div className="animate-scale-in">
              <div className="text-5xl md:text-6xl font-black text-coolBlue-500 mb-3">6</div>
              <div className="text-sm md:text-body text-secondary font-medium">Work Tools</div>
            </div>
            <div className="animate-scale-in" style={{ animationDelay: '100ms' }}>
              <div className="text-5xl md:text-6xl font-black text-coolBlue-500 mb-3">26</div>
              <div className="text-sm md:text-body text-secondary font-medium">Code Words</div>
            </div>
            <div className="animate-scale-in" style={{ animationDelay: '200ms' }}>
              <div className="text-5xl md:text-6xl font-black text-coolBlue-500 mb-3">100%</div>
              <div className="text-sm md:text-body text-secondary font-medium">Free Forever</div>
            </div>
            <div className="animate-scale-in" style={{ animationDelay: '300ms' }}>
              <div className="text-5xl md:text-6xl font-black text-coolBlue-500 mb-3">0</div>
              <div className="text-sm md:text-body text-secondary font-medium">Sign-ups Required</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 md:py-20 bg-warmNeutral-50 dark:bg-warmNeutral-900">
        <div className="container px-6 md:px-8 lg:px-4">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="h2 mb-6">What Our Users Say</h2>
            <p className="text-body-lg text-secondary max-w-3xl mx-auto leading-relaxed">
              Join thousands of professionals who communicate clearly — with people and with AI
            </p>
          </div>

          {/* Hardcoded Testimonials */}
          <div className="max-w-7xl mx-auto mb-16">
            <TestimonialsGrid />
          </div>

          {/* Divider */}
          <div className="max-w-5xl mx-auto mb-12">
            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-warmNeutral-200 dark:bg-warmNeutral-700"></div>
              <p className="text-sm font-semibold text-tertiary uppercase tracking-wider">
                Share Your Experience
              </p>
              <div className="flex-1 h-px bg-warmNeutral-200 dark:bg-warmNeutral-700"></div>
            </div>
          </div>

          {/* Famewall Widget - New Reviews */}
          <div className="max-w-5xl mx-auto">
            <FamewallWidget />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20 bg-coolBlue-50 dark:bg-coolBlue-900/10">
        <div className="container px-6 md:px-8 lg:px-4 text-center">
          <h2 className="h2 mb-6">Master clear communication — with people and with AI</h2>
          <p className="text-body-lg text-secondary max-w-2xl mx-auto mb-10 leading-relaxed">
            Learn the alphabet that keeps radio traffic unambiguous, and use the AI tools that
            bring the same discipline to your comms, briefs, and reports.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/learn" className="btn btn-primary btn-xl inline-flex items-center justify-center">
              Start Learning
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="ml-2" aria-hidden="true">
                <path d="M9 6L15 12L9 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
            <Link href="/tools" className="btn btn-secondary btn-xl inline-flex items-center justify-center">
              Open AI Tools
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
