'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <>
      {/* Hero Section with Gradient Background */}
      <section className="hero">
        {/* Background Pattern */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-amber-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwMDAwMDA4IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-[0.03]" />
        </div>

        <div className="hero-content">
          <div className="hero-eyebrow animate-fade-in">
            International Radiotelephony Spelling Alphabet
          </div>
          
          <h1 className="hero-headline animate-slide-up">
            Master the <span className="text-gradient">NATO Phonetic</span> Alphabet
          </h1>
          
          <p className="hero-description animate-slide-up" style={{ animationDelay: '100ms' }}>
            Learn the universal communication standard used by military forces, aviation professionals, 
            and emergency services worldwide. Interactive lessons, real-time practice, and gamified learning.
          </p>
          
          <div className="hero-actions animate-slide-up" style={{ animationDelay: '200ms' }}>
            <Link href="/learn" className="btn btn-primary btn-xl">
              Start Learning Now
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M7.5 5L12.5 10L7.5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
            <Link href="/practice" className="btn btn-secondary btn-xl">
              Test Your Skills
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="mt-16 animate-fade-in" style={{ animationDelay: '300ms' }}>
            <p className="text-sm text-tertiary uppercase tracking-widest mb-4">Trusted by professionals</p>
            <div className="flex items-center justify-center gap-8 opacity-60">
              <span className="text-2xl font-bold">✈️ Aviation</span>
              <span className="text-2xl font-bold">🚢 Maritime</span>
              <span className="text-2xl font-bold">🚔 Emergency</span>
              <span className="text-2xl font-bold">📡 Military</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section with Cards */}
      <section className="container py-24">
        <div className="text-center mb-16">
          <h2 className="h2 mb-4">Everything You Need to Master Phonetic Communication</h2>
          <p className="text-body-lg text-secondary max-w-3xl mx-auto">
            Comprehensive tools and interactive features designed to help you learn, practice, and perfect 
            the NATO phonetic alphabet with confidence.
          </p>
        </div>

        <div className="feature-grid stagger">
          {/* Learn Card */}
          <Link href="/learn" className="card card-interactive group">
            <div className="feature-icon">
              <span>📚</span>
            </div>
            <h3 className="text-2xl font-bold mb-3 group-hover:text-gradient transition-all">
              Interactive Learning
            </h3>
            <p className="text-secondary mb-6">
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
            <div className="feature-icon">
              <span>🎯</span>
            </div>
            <h3 className="text-2xl font-bold mb-3 group-hover:text-gradient transition-all">
              Gamified Practice
            </h3>
            <p className="text-secondary mb-6">
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
            <div className="feature-icon">
              <span>🛠️</span>
            </div>
            <h3 className="text-2xl font-bold mb-3 group-hover:text-gradient transition-all">
              Professional Tools
            </h3>
            <p className="text-secondary mb-6">
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
      <section className="py-24 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="container">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div className="animate-scale-in">
              <div className="text-5xl font-black text-gradient mb-2">26</div>
              <div className="text-lg text-secondary">Letters to Master</div>
            </div>
            <div className="animate-scale-in" style={{ animationDelay: '100ms' }}>
              <div className="text-5xl font-black text-gradient mb-2">10+</div>
              <div className="text-lg text-secondary">Practice Modes</div>
            </div>
            <div className="animate-scale-in" style={{ animationDelay: '200ms' }}>
              <div className="text-5xl font-black text-gradient mb-2">100%</div>
              <div className="text-lg text-secondary">Free Forever</div>
            </div>
            <div className="animate-scale-in" style={{ animationDelay: '300ms' }}>
              <div className="text-5xl font-black text-gradient mb-2">∞</div>
              <div className="text-lg text-secondary">Practice Sessions</div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Reference Preview */}
      <section className="container py-24">
        <div className="text-center mb-12">
          <h2 className="h3 mb-4">Quick Reference</h2>
          <p className="text-body-lg text-secondary">
            Get a glimpse of the NATO phonetic alphabet
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {['A-Alpha', 'B-Bravo', 'C-Charlie', 'D-Delta', 'E-Echo', 'F-Foxtrot'].map((item, index) => (
            <div 
              key={item} 
              className="phonetic-card phonetic-card-mini animate-scale-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <span className="text-3xl font-black text-primary">{item.split('-')[0]}</span>
              <span className="text-lg font-semibold">{item.split('-')[1]}</span>
            </div>
          ))}
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

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-blue-50 to-amber-50 dark:from-slate-900 dark:to-slate-800">
        <div className="container text-center">
          <h2 className="h2 mb-6">Ready to Master Professional Communication?</h2>
          <p className="text-xl text-secondary max-w-2xl mx-auto mb-8">
            Join thousands of aviation professionals, military personnel, and radio operators 
            who have perfected their phonetic alphabet skills.
          </p>
          <Link href="/learn" className="btn btn-primary btn-xl">
            Begin Your Journey
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M9 6L15 12L9 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
        </div>
      </section>
    </>
  );
}