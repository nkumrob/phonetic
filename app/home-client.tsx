'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { HomeAiSection } from '@/components/ai-tools/home-ai-section';
import { HomeHero } from '@/components/home/home-hero';
import { TwoDoors } from '@/components/home/two-doors';
import { BenefitsSection } from '@/components/home/benefits-section';

const ApprovedReviewsWall = dynamic(() => import('@/components/reviews/approved-reviews-wall').then(mod => ({ default: mod.ApprovedReviewsWall })), {
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

      {/* Testimonials Section */}
      <section className="border-t border-warmNeutral-200 bg-white py-20 dark:border-warmNeutral-700 dark:bg-warmNeutral-900 md:py-24">
        <div className="container px-6 md:px-8 lg:px-4">
          <div className="mb-12 max-w-5xl md:mb-16">
            <h2 className="h2 mb-4">What Our Users Say</h2>
            <p className="max-w-2xl text-lg leading-relaxed text-gray-600 dark:text-warmNeutral-300">
              Join thousands of professionals who communicate clearly, with people and with AI
            </p>
          </div>

          {/* First-party reviews: real submissions, moderated in /admin */}
          <div className="mx-auto max-w-7xl">
            <ApprovedReviewsWall />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-coolBlue-600 py-20 dark:bg-coolBlue-700 md:py-24">
        <div className="container px-6 md:px-8 lg:px-4">
          <div className="max-w-3xl">
            <h2 className="mb-6 text-4xl font-black tracking-tight text-white md:text-5xl">
              Precision in every deliverable
            </h2>
            <p className="mb-10 max-w-xl text-xl leading-relaxed text-white/90">
              Free professional tools for clear communication and dependable AI output. No sign-up
              required.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Link
                href="/tools"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-8 py-4 text-lg font-bold text-coolBlue-700 shadow-[0_14px_32px_-12px_rgba(0,0,0,0.35)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-coolBlue-50"
              >
                Open the Tools
                <span aria-hidden="true">→</span>
              </Link>
              <Link
                href="/learn"
                className="inline-flex items-center justify-center rounded-lg border-2 border-white px-8 py-4 text-lg font-bold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-white hover:text-coolBlue-700"
              >
                Master NATO Comms
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
