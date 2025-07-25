'use client';

import Link from 'next/link';
import { AudioAlphabetTable } from '@/components/phonetic/audio-alphabet-table';
import { TextConverter } from '@/components/phonetic/text-converter';

export default function Home() {
  return (
    <>
      {/* Hero Section - Asymmetric Split Layout */}
      <section className="min-h-[90vh] flex items-center py-24 overflow-hidden relative">
        {/* Warm neutral background */}
        <div className="absolute inset-0 -z-10 bg-warmNeutral-50 dark:bg-warmNeutral-900" />

        <div className="container">
          <div className="grid lg:grid-cols-[1.2fr,1fr] gap-16 items-center">
            {/* Content */}
            <div className="space-y-8">
              <div className="inline-block px-4 py-2 bg-coolBlue-50 dark:bg-coolBlue-900/20 text-coolBlue-600 dark:text-coolBlue-400 text-sm font-semibold uppercase tracking-widest rounded-full animate-fade-in">
                International Radiotelephony Spelling Alphabet
              </div>
              
              <h1 className="text-7xl lg:text-8xl font-black tracking-headlines leading-none animate-slide-up">
                NATO Phonetic Alphabet: A to Z
              </h1>
              
              <p className="text-xl text-secondary leading-relaxed max-w-2xl animate-slide-up" style={{ animationDelay: '100ms' }}>
                Learn the universal communication standard used by military forces, aviation professionals, 
                and emergency services worldwide. Interactive lessons and real-time practice.
              </p>
          
              <div className="flex flex-wrap gap-4 animate-slide-up" style={{ animationDelay: '200ms' }}>
                <Link href="/learn" className="btn btn-primary btn-xl">
                  Start Learning Now
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="ml-2">
                    <path d="M7.5 5L12.5 10L7.5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Link>
                <Link href="/practice" className="btn btn-secondary btn-xl">
                  Test Your Skills
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="pt-12 animate-fade-in" style={{ animationDelay: '300ms' }}>
                <p className="text-sm text-tertiary uppercase tracking-widest mb-4">Trusted by professionals</p>
                <div className="flex flex-wrap items-center gap-8">
                  <span className="text-lg font-semibold text-secondary">✈️ Aviation</span>
                  <span className="text-lg font-semibold text-secondary">🚢 Maritime</span>
                  <span className="text-lg font-semibold text-secondary">🚔 Emergency</span>
                  <span className="text-lg font-semibold text-secondary">📡 Military</span>
                </div>
              </div>
            </div>
            
            {/* Visual Element */}
            <div className="relative">
              <div className="absolute inset-0 bg-coolBlue-100 dark:bg-coolBlue-900/20 rounded-3xl transform rotate-3" />
              <div className="relative bg-white dark:bg-warmNeutral-800 rounded-3xl p-12 shadow-2xl">
                <div className="grid grid-cols-3 gap-6">
                  {['A-Alpha', 'B-Bravo', 'C-Charlie', 'D-Delta', 'E-Echo', 'F-Foxtrot'].slice(0, 6).map((item) => (
                    <div key={item} className="text-center p-6 rounded-xl bg-warmNeutral-50 dark:bg-warmNeutral-900 hover:shadow-md transition-all duration-200">
                      <div className="text-4xl font-black text-coolBlue-500 mb-2">{item.split('-')[0]}</div>
                      <div className="text-sm font-semibold text-secondary">{item.split('-')[1]}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section with Cards */}
      <section className="container py-24">
        <div className="text-center mb-16">
          <h2 className="h2 mb-4">What Is the NATO Phonetic Alphabet?</h2>
          <p className="text-body-lg text-secondary max-w-3xl mx-auto">
            The NATO phonetic alphabet is a standardized set of 26 code words used to clearly communicate
            letters over radio and telephone. Each letter from A to Z is assigned a specific word (Alpha, Bravo, Charlie, etc.)
            to eliminate confusion in voice communications.
          </p>
        </div>

        <div className="feature-grid stagger">
          {/* Learn Card */}
          <Link href="/learn" className="card card-interactive group">
            <div className="w-16 h-16 bg-warmAmber-50 dark:bg-warmAmber-900/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-200">
              <span className="text-3xl">📚</span>
            </div>
            <h3 className="text-2xl font-bold mb-3 group-hover:text-coolBlue-500 transition-colors">
              Interactive Learning
            </h3>
            <p className="text-body text-secondary mb-6">
              Explore all 26 letters with professional audio pronunciation, visual memory aids, 
              and proven mnemonic techniques.
            </p>
            <ul className="space-y-2 text-sm text-tertiary">
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
            <div className="w-16 h-16 bg-coolBlue-50 dark:bg-coolBlue-900/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-200">
              <span className="text-3xl">🎯</span>
            </div>
            <h3 className="text-2xl font-bold mb-3 group-hover:text-coolBlue-500 transition-colors">
              Practice Modes
            </h3>
            <p className="text-body text-secondary mb-6">
              Challenge yourself with adaptive quizzes, unlock achievements, and track your progress 
              through multiple difficulty levels.
            </p>
            <ul className="space-y-2 text-sm text-tertiary">
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
            <div className="w-16 h-16 bg-warmNeutral-100 dark:bg-warmNeutral-800 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-200">
              <span className="text-3xl">🛠️</span>
            </div>
            <h3 className="text-2xl font-bold mb-3 group-hover:text-coolBlue-500 transition-colors">
              Professional Tools
            </h3>
            <p className="text-body text-secondary mb-6">
              Convert text instantly, perform reverse lookups, and generate professional PDF reference 
              charts for offline use.
            </p>
            <ul className="space-y-2 text-sm text-tertiary">
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
      </section>

      {/* Statistics Section */}
      <section className="py-24 bg-warmNeutral-50 dark:bg-warmNeutral-900">
        <div className="container">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div className="animate-scale-in">
              <div className="text-6xl font-black text-coolBlue-500 mb-2">26</div>
              <div className="text-lg text-secondary">Letters to Master</div>
            </div>
            <div className="animate-scale-in" style={{ animationDelay: '100ms' }}>
              <div className="text-6xl font-black text-coolBlue-500 mb-2">3</div>
              <div className="text-lg text-secondary">Practice Modes</div>
            </div>
            <div className="animate-scale-in" style={{ animationDelay: '200ms' }}>
              <div className="text-6xl font-black text-coolBlue-500 mb-2">100%</div>
              <div className="text-lg text-secondary">Free Forever</div>
            </div>
            <div className="animate-scale-in" style={{ animationDelay: '300ms' }}>
              <div className="text-6xl font-black text-coolBlue-500 mb-2">∞</div>
              <div className="text-lg text-secondary">Practice Sessions</div>
            </div>
          </div>
        </div>
      </section>

      {/* Text Translator Section */}
      <section className="container py-24">
        <div className="text-center mb-12">
          <h2 className="h2 mb-4">Instant NATO Phonetic Translator</h2>
          <p className="text-body-lg text-secondary max-w-3xl mx-auto">
            Convert any text to NATO phonetic alphabet instantly. Type your message and hear it spoken in both regular and phonetic form.
          </p>
        </div>
        
        <TextConverter showHistory={false} />
      </section>

      {/* Quick Reference Preview */}
      <section className="container py-24">
        <div className="text-center mb-12">
          <h2 className="h2 mb-4">Complete NATO Phonetic Alphabet Chart</h2>
          <p className="text-body-lg text-secondary">
            Quick reference guide to all 26 NATO phonetic code words
          </p>
        </div>

        <div className="mb-8">
          <h3 className="text-xl font-bold text-center mb-6">Interactive Audio Pronunciation Guide</h3>
          <AudioAlphabetTable />
        </div>

        <div className="text-center">
          <Link href="/learn" className="btn btn-primary btn-lg">
            View All 26 Letters
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M7.5 5L12.5 10L7.5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
        </div>
      </section>

      {/* How to Use Section */}
      <section className="container py-24">
        <div className="text-center mb-12">
          <h2 className="h2 mb-4">How to Use NATO Phonetic Code</h2>
          <p className="text-body-lg text-secondary max-w-3xl mx-auto">
            Follow these simple steps to master phonetic communication
          </p>
        </div>
        
        <div className="max-w-3xl mx-auto">
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-coolBlue-500 text-white rounded-full flex items-center justify-center font-bold">1</div>
              <div>
                <h3 className="text-xl font-bold mb-2">Learn the Alphabet</h3>
                <p className="text-secondary">Memorize the 26 code words from Alpha to Zulu using our interactive learning tools.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-coolBlue-500 text-white rounded-full flex items-center justify-center font-bold">2</div>
              <div>
                <h3 className="text-xl font-bold mb-2">Practice Pronunciation</h3>
                <p className="text-secondary">Use our audio guides to perfect your pronunciation of each phonetic word.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-coolBlue-500 text-white rounded-full flex items-center justify-center font-bold">3</div>
              <div>
                <h3 className="text-xl font-bold mb-2">Apply in Communication</h3>
                <p className="text-secondary">Spell out important information letter by letter using the code words to ensure clarity.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* NATO vs Military Alphabet Section */}
      <section className="py-24 bg-warmNeutral-50 dark:bg-warmNeutral-900">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="h2 mb-4">NATO vs. Military Alphabet: Key Differences</h2>
            <p className="text-body-lg text-secondary max-w-3xl mx-auto">
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
      <section className="container py-24" id="faq">
        <div className="text-center mb-12">
          <h2 className="h2 mb-4">Frequently Asked Questions (FAQs)</h2>
          <p className="text-body-lg text-secondary">
            Common questions about the NATO phonetic alphabet
          </p>
        </div>
        
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="card p-6">
            <h3 className="text-xl font-bold mb-3">What does each letter stand for in the NATO phonetic alphabet?</h3>
            <p className="text-secondary">The NATO phonetic alphabet assigns a code word to each letter A–Z to ensure clarity over voice channels (e.g., Alpha for A, Bravo for B, Charlie for C).</p>
          </div>
          
          <div className="card p-6">
            <h3 className="text-xl font-bold mb-3">How do I pronounce the NATO phonetic alphabet correctly?</h3>
            <p className="text-secondary">Each code word is pronounced with emphasis on its first syllable. Listen to our audio clips or follow our phonetic pronunciation guide for precise enunciation.</p>
          </div>
          
          <div className="card p-6">
            <h3 className="text-xl font-bold mb-3">Where can I download a printable NATO phonetic alphabet PDF?</h3>
            <p className="text-secondary">Visit our Printable PDF & Download section or click the download button in our tools section for a free, optimized PDF.</p>
          </div>
          
          <div className="card p-6">
            <h3 className="text-xl font-bold mb-3">Is there an online NATO phonetic alphabet translator?</h3>
            <p className="text-secondary">Yes! Try our interactive translator in the Tools section: type any message and see the instant phonetic conversion in real time.</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-coolBlue-50 dark:bg-coolBlue-900/10">
        <div className="container text-center">
          <h2 className="text-5xl font-black mb-6 tracking-headlines">Ready to Master Professional Communication?</h2>
          <p className="text-xl text-secondary max-w-2xl mx-auto mb-8">
            Join thousands of aviation professionals, military personnel, and radio operators 
            who have perfected their phonetic alphabet skills.
          </p>
          <Link href="/learn" className="btn btn-primary btn-xl">
            Begin Your Journey
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="ml-2">
              <path d="M9 6L15 12L9 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
        </div>
      </section>
    </>
  );
}