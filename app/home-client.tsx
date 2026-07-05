'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { HomeAiSection } from '@/components/ai-tools/home-ai-section';
import { HomeHero } from '@/components/home/home-hero';
import { TwoDoors } from '@/components/home/two-doors';
import { BenefitsSection } from '@/components/home/benefits-section';
import { StandardSection } from '@/components/home/standard-section';

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
      {/* Outcome-led umbrella hero; the doors below are the CTAs */}
      <HomeHero />

      {/* Two equal entry doors: NATO phonetic | AI work tools */}
      <TwoDoors />

      {/* Outcome benefits */}
      <BenefitsSection />

      {/* AI tools showcase (cross-sell) */}
      <HomeAiSection />

      {/* The one compact keyword-rich NATO section */}
      <StandardSection />

      {/* Testimonials Section */}
      <section className="py-16 md:py-20 bg-warmNeutral-50 dark:bg-warmNeutral-900">
        <div className="container px-6 md:px-8 lg:px-4">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="h2 mb-6">What Our Users Say</h2>
            <p className="text-body-lg text-secondary max-w-3xl mx-auto leading-relaxed">
              Join thousands of professionals who communicate clearly, with people and with AI
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
          <h2 className="h2 mb-6">Precision in every deliverable</h2>
          <p className="text-body-lg text-secondary max-w-2xl mx-auto mb-10 leading-relaxed">
            Free professional tools for clear communication and dependable AI output. No sign-up
            required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/tools" className="btn btn-primary btn-xl inline-flex items-center justify-center">
              Open the Tools
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="ml-2" aria-hidden="true">
                <path d="M9 6L15 12L9 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
            <Link href="/learn" className="btn btn-secondary btn-xl inline-flex items-center justify-center">
              Learn the Alphabet
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
