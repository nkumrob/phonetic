import Link from 'next/link';

export function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-warmNeutral-100 dark:bg-warmNeutral-900 border-t border-border">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <h3 className="text-xl font-black tracking-tight">NATO Phonetic</h3>
            <p className="text-sm text-secondary">
              Master the international radiotelephony spelling alphabet used by aviation, maritime, and military professionals worldwide.
            </p>
          </div>
          
          {/* Learn Section */}
          <div>
            <h4 className="font-semibold mb-4">Learn</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/learn" className="text-sm text-secondary hover:text-primary transition-colors">
                  Interactive Alphabet
                </Link>
              </li>
              <li>
                <Link href="/practice" className="text-sm text-secondary hover:text-primary transition-colors">
                  Practice Quizzes
                </Link>
              </li>
              <li>
                <Link href="/practice" className="text-sm text-secondary hover:text-primary transition-colors">
                  Flashcards
                </Link>
              </li>
              <li>
                <Link href="/learn" className="text-sm text-secondary hover:text-primary transition-colors">
                  Pronunciation Guide
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Tools Section */}
          <div>
            <h4 className="font-semibold mb-4">Tools</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/tools" className="text-sm text-secondary hover:text-primary transition-colors">
                  Text Converter
                </Link>
              </li>
              <li>
                <Link href="/tools" className="text-sm text-secondary hover:text-primary transition-colors">
                  Reverse Lookup
                </Link>
              </li>
              <li>
                <Link href="/tools" className="text-sm text-secondary hover:text-primary transition-colors">
                  PDF Generator
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Resources Section */}
          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/#faq" className="text-sm text-secondary hover:text-primary transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <a
                  href="mailto:support@natophonetic.com"
                  className="text-sm text-secondary hover:text-primary transition-colors inline-flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Support
                </a>
              </li>
              <li>
                <a href="https://en.wikipedia.org/wiki/NATO_phonetic_alphabet" target="_blank" rel="noopener noreferrer" className="text-sm text-secondary hover:text-primary transition-colors">
                  Wikipedia
                </a>
              </li>
              <li>
                <a href="https://www.icao.int/" target="_blank" rel="noopener noreferrer" className="text-sm text-secondary hover:text-primary transition-colors">
                  ICAO Standards
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex flex-col items-center md:items-start gap-2">
              <p className="text-sm text-secondary">
                © {currentYear} NATO Phonetic Alphabet. Educational resource for learning the international radiotelephony spelling alphabet.
              </p>
              <div className="flex items-center gap-2 text-sm text-secondary">
                <span>Made with</span>
                <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                </svg>
                <span>by</span>
                <a
                  href="https://www.linkedin.com/in/appiahrobert/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-coolBlue-500 hover:text-coolBlue-600 dark:text-coolBlue-400 dark:hover:text-coolBlue-300 transition-colors inline-flex items-center gap-1"
                >
                  Bob
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>
            <div className="flex gap-6">
              <Link href="/privacy" className="text-sm text-secondary hover:text-primary transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-sm text-secondary hover:text-primary transition-colors">
                Terms of Use
              </Link>
              <a
                href="mailto:support@natophonetic.com"
                className="text-sm text-secondary hover:text-primary transition-colors"
              >
                Contact
              </a>
            </div>
          </div>
        </div>
      </div>
      
      {/* Schema.org markup for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "NATO Phonetic Alphabet",
            "url": "https://natophonetic.com",
            "description": "Learn the NATO phonetic alphabet with interactive tools, quizzes, and pronunciation guides.",
            "potentialAction": {
              "@type": "SearchAction",
              "target": {
                "@type": "EntryPoint",
                "urlTemplate": "https://natophonetic.com/tools?q={search_term_string}"
              },
              "query-input": "required name=search_term_string"
            }
          })
        }}
      />
    </footer>
  );
}