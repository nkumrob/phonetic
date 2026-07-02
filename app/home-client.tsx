'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { HomeAiSection } from '@/components/ai-tools/home-ai-section';
import { HomeHero } from '@/components/home/home-hero';

// Lazy load heavy components for better initial page load
const AudioAlphabetTable = dynamic(() => import('@/components/phonetic/audio-alphabet-table').then(mod => ({ default: mod.AudioAlphabetTable })), {
  loading: () => <div className="h-48 animate-pulse bg-warmNeutral-100 dark:bg-warmNeutral-800 rounded-xl" />,
  ssr: false,
});

const TextConverterWrapper = dynamic(() => import('@/components/phonetic/text-converter-wrapper').then(mod => ({ default: mod.TextConverterWrapper })), {
  loading: () => <div className="h-64 animate-pulse bg-warmNeutral-100 dark:bg-warmNeutral-800 rounded-xl" />,
  ssr: false,
});

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
      {/* Hero — practical AI productivity positioning */}
      <HomeHero />

      {/* The suite grid — all six tools */}
      <HomeAiSection />

      {/* Features Section with Cards */}
      <section className="py-16 md:py-20">
        <div className="container px-6 md:px-8 lg:px-4">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="h2 mb-6">Built on a Proven Communication Foundation</h2>
          <p className="text-body-lg text-secondary max-w-3xl mx-auto leading-relaxed">
            Natophonetic began as a practical tool for spelling and transmitting information clearly.
            Now that same focus on clarity, structure, and accuracy powers AI productivity tools for
            modern work.
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
                Speed & survival modes
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

      {/* Statistics Section */}
      <section className="py-16 md:py-20 bg-warmNeutral-50 dark:bg-warmNeutral-900">
        <div className="container px-6 md:px-8 lg:px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 text-center">
            <div className="animate-scale-in">
              <div className="text-5xl md:text-6xl font-black text-coolBlue-500 mb-3">26</div>
              <div className="text-sm md:text-body text-secondary font-medium">Letters to Master</div>
            </div>
            <div className="animate-scale-in" style={{ animationDelay: '100ms' }}>
              <div className="text-5xl md:text-6xl font-black text-coolBlue-500 mb-3">3</div>
              <div className="text-sm md:text-body text-secondary font-medium">Practice Modes</div>
            </div>
            <div className="animate-scale-in" style={{ animationDelay: '200ms' }}>
              <div className="text-5xl md:text-6xl font-black text-coolBlue-500 mb-3">100%</div>
              <div className="text-sm md:text-body text-secondary font-medium">Free Forever</div>
            </div>
            <div className="animate-scale-in" style={{ animationDelay: '300ms' }}>
              <div className="text-5xl md:text-6xl font-black text-coolBlue-500 mb-3">∞</div>
              <div className="text-sm md:text-body text-secondary font-medium">Practice Sessions</div>
            </div>
          </div>
        </div>
      </section>

      {/* Text Translator Section */}
      <section className="py-16 md:py-20">
        <div className="container px-6 md:px-8 lg:px-4">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="h2 mb-6">NATO Phonetic Translator</h2>
          <p className="text-body-lg text-secondary max-w-3xl mx-auto leading-relaxed">
            Convert any text to NATO phonetic alphabet instantly. Clear communication still matters
            in customer support, logistics, aviation, and any situation where a single wrong letter
            causes a costly error.
          </p>
        </div>

        <TextConverterWrapper showHistory={false} />
        </div>
      </section>

      {/* Quick Reference Preview */}
      <section className="py-16 md:py-20">
        <div className="container px-6 md:px-8 lg:px-4">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="h2 mb-6">Complete NATO Phonetic Alphabet Chart</h2>
          <p className="text-body-lg text-secondary leading-relaxed">
            Quick reference guide to all 26 NATO phonetic code words
          </p>
        </div>

        <div className="mb-8">
          <h3 className="text-xl font-bold text-center mb-6">Interactive Audio Pronunciation Guide</h3>
          <AudioAlphabetTable />
        </div>

        <div className="text-center">
          <Link href="/learn" className="btn btn-primary btn-xl inline-flex items-center">
            View All 26 Letters
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="ml-2">
              <path d="M7.5 5L12.5 10L7.5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
        </div>
        </div>
      </section>

      {/* How to Use Section */}
      <section className="py-16 md:py-20">
        <div className="container px-6 md:px-8 lg:px-4">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="h2 mb-6">How to Use NATO Phonetic Code</h2>
          <p className="text-body-lg text-secondary max-w-3xl mx-auto leading-relaxed">
            Follow these simple steps to master phonetic communication — the same discipline that
            improves prompt writing and task instructions in AI-assisted work.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="space-y-8">
            <div className="flex gap-5">
              <div className="flex-shrink-0 w-12 h-12 md:w-14 md:h-14 bg-coolBlue-500 text-white rounded-full flex items-center justify-center font-bold text-lg md:text-xl">1</div>
              <div>
                <h3 className="text-lg md:text-xl font-bold mb-2">Learn the Alphabet</h3>
                <p className="text-body text-secondary leading-relaxed">Memorize the 26 code words from Alpha to Zulu using our interactive learning tools.</p>
              </div>
            </div>
            <div className="flex gap-5">
              <div className="flex-shrink-0 w-12 h-12 md:w-14 md:h-14 bg-coolBlue-500 text-white rounded-full flex items-center justify-center font-bold text-lg md:text-xl">2</div>
              <div>
                <h3 className="text-lg md:text-xl font-bold mb-2">Practice Pronunciation</h3>
                <p className="text-body text-secondary leading-relaxed">Use our audio guides to perfect your pronunciation of each phonetic word.</p>
              </div>
            </div>
            <div className="flex gap-5">
              <div className="flex-shrink-0 w-12 h-12 md:w-14 md:h-14 bg-coolBlue-500 text-white rounded-full flex items-center justify-center font-bold text-lg md:text-xl">3</div>
              <div>
                <h3 className="text-lg md:text-xl font-bold mb-2">Apply in Communication</h3>
                <p className="text-body text-secondary leading-relaxed">Spell out important information letter by letter using the code words to ensure clarity.</p>
              </div>
            </div>
          </div>
        </div>
        </div>
      </section>

      {/* NATO vs Military Alphabet Section */}
      <section className="py-16 md:py-20 bg-warmNeutral-50 dark:bg-warmNeutral-900">
        <div className="container px-6 md:px-8 lg:px-4">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="h2 mb-6">NATO vs. Military Alphabet: Key Differences</h2>
            <p className="text-body-lg text-secondary max-w-3xl mx-auto leading-relaxed">
              While often used interchangeably, the NATO phonetic alphabet is the internationally
              standardized version adopted by ICAO, ITU, and military organizations worldwide.
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="card p-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-bold mb-4">NATO/ICAO Standard</h3>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Internationally standardized since 1956
                    </li>
                    <li className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Used by aviation, maritime, and emergency services
                    </li>
                    <li className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Consistent across all NATO member countries
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-4">Historical Military Variants</h3>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      Various versions used before 1956
                    </li>
                    <li className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      Some differences in specific services
                    </li>
                    <li className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      Now largely replaced by NATO standard
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 md:py-20" id="faq">
        <div className="container px-6 md:px-8 lg:px-4">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="h2 mb-6">Frequently Asked Questions</h2>
          <p className="text-body-lg text-secondary leading-relaxed">
            Common questions about the NATO phonetic alphabet
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-5">
          <div className="card p-6 md:p-8">
            <h3 className="text-lg md:text-xl font-bold mb-3">What does each letter stand for in the NATO phonetic alphabet?</h3>
            <p className="text-body text-secondary leading-relaxed">The NATO phonetic alphabet assigns a code word to each letter A–Z to ensure clarity over voice channels (e.g., Alpha for A, Bravo for B, Charlie for C).</p>
          </div>

          <div className="card p-6 md:p-8">
            <h3 className="text-lg md:text-xl font-bold mb-3">How do I pronounce the NATO phonetic alphabet correctly?</h3>
            <p className="text-body text-secondary leading-relaxed">Each code word is pronounced with emphasis on its first syllable. Listen to our audio clips or follow our phonetic pronunciation guide for precise enunciation.</p>
          </div>

          <div className="card p-6 md:p-8">
            <h3 className="text-lg md:text-xl font-bold mb-3">Where can I download a printable NATO phonetic alphabet PDF?</h3>
            <p className="text-body text-secondary leading-relaxed">Visit our Printable PDF & Download section or click the download button in our tools section for a free, optimized PDF.</p>
          </div>

          <div className="card p-6 md:p-8">
            <h3 className="text-lg md:text-xl font-bold mb-3">Is there an online NATO phonetic alphabet translator?</h3>
            <p className="text-body text-secondary leading-relaxed">Yes! Try our interactive translator in the Tools section: type any message and see the instant phonetic conversion in real time.</p>
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
              Join thousands of professionals who have mastered the NATO phonetic alphabet
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
          <h2 className="h2 mb-6">Ready to work better with AI?</h2>
          <p className="text-body-lg text-secondary max-w-2xl mx-auto mb-10 leading-relaxed">
            Use practical tools for prompting, writing, summarizing, and reviewing work with more
            speed and confidence.
          </p>
          <Link href="/tools" className="btn btn-primary btn-xl inline-flex items-center justify-center">
            Open Productivity Tools
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="ml-2">
              <path d="M9 6L15 12L9 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
        </div>
      </section>
    </>
  );
}