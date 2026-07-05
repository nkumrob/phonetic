'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { HomeAiSection } from '@/components/ai-tools/home-ai-section';
import { HomeHero } from '@/components/home/home-hero';
import { TwoDoors } from '@/components/home/two-doors';
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
      {/* Outcome-led umbrella hero; the doors below are the CTAs */}
      <HomeHero />

      {/* Two equal entry doors: NATO phonetic | AI work tools */}
      <TwoDoors />

      {/* Outcome benefits */}
      <BenefitsSection />

      {/* AI tools showcase (cross-sell, dark console band) */}
      <HomeAiSection />

      {/* Testimonials Section */}
      <section className="border-t border-warmNeutral-200 bg-warmNeutral-50 py-20 dark:border-warmNeutral-700 dark:bg-warmNeutral-900 md:py-24">
        <div className="container px-6 md:px-8 lg:px-4">
          <div className="mb-12 max-w-5xl md:mb-16">
            <p className="mb-4 font-mono text-[12px] font-bold uppercase tracking-[0.2em] text-warmNeutral-500 dark:text-warmNeutral-400">
              Field reports
            </p>
            <h2 className="h2 mb-4">What Our Users Say</h2>
            <p className="max-w-2xl text-body-lg leading-relaxed text-secondary">
              Join thousands of professionals who communicate clearly, with people and with AI
            </p>
          </div>

          {/* Hardcoded Testimonials */}
          <div className="mx-auto mb-16 max-w-7xl">
            <TestimonialsGrid />
          </div>

          {/* Divider */}
          <div className="mx-auto mb-12 max-w-5xl">
            <div className="flex items-center gap-4">
              <div className="h-px flex-1 bg-warmNeutral-200 dark:bg-warmNeutral-700"></div>
              <p className="font-mono text-[12px] font-bold uppercase tracking-[0.15em] text-warmNeutral-500 dark:text-warmNeutral-400">
                Share Your Experience
              </p>
              <div className="h-px flex-1 bg-warmNeutral-200 dark:bg-warmNeutral-700"></div>
            </div>
          </div>

          {/* Famewall Widget - New Reviews */}
          <div className="mx-auto max-w-5xl">
            <FamewallWidget />
          </div>
        </div>
      </section>

      {/* CTA Section — signal band */}
      <section className="relative overflow-hidden bg-coolBlue-600 py-20 dark:bg-coolBlue-700 md:py-24">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-16 right-4 select-none font-mono text-[13rem] font-bold leading-none text-white/[0.06] md:text-[17rem]"
        >
          A→Z
        </span>
        <div className="container relative px-6 md:px-8 lg:px-4">
          <div className="max-w-3xl">
            <p className="mb-4 font-mono text-[12px] font-bold uppercase tracking-[0.2em] text-coolBlue-100">
              Ready when you are
            </p>
            <h2 className="h2 mb-6 text-white">Precision in every deliverable</h2>
            <p className="mb-10 max-w-xl text-xl leading-relaxed text-white/90">
              Free professional tools for clear communication and dependable AI output. No sign-up
              required.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Link
                href="/tools"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-8 py-4 text-lg font-bold text-coolBlue-700 shadow-[0_14px_32px_-12px_rgba(0,0,0,0.4)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-coolBlue-50"
              >
                Open the Tools
                <span aria-hidden="true" className="font-mono">
                  →
                </span>
              </Link>
              <Link
                href="/learn"
                className="inline-flex items-center justify-center rounded-lg border-2 border-white px-8 py-4 text-lg font-bold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-white hover:text-coolBlue-700"
              >
                Learn the Alphabet
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
