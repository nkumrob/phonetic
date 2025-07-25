import Link from 'next/link';

export function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-warmNeutral-100 dark:bg-warmNeutral-900 border-t border-border mt-24">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <h3 className="text-xl font-black tracking-tight">NATO Phonetic</h3>
            <p className="text-sm text-secondary">
              Master the international radiotelephony spelling alphabet used by aviation, maritime, and military professionals worldwide.
            </p>
            <div className="flex gap-4">
              <a 
                href="https://twitter.com/natophonetic" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-secondary hover:text-primary transition-colors"
                aria-label="Follow us on Twitter"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"/>
                </svg>
              </a>
              <a 
                href="https://github.com/natophonetic" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-secondary hover:text-primary transition-colors"
                aria-label="View our GitHub"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"/>
                </svg>
              </a>
            </div>
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
                <Link href="/practice#flashcards" className="text-sm text-secondary hover:text-primary transition-colors">
                  Flashcards
                </Link>
              </li>
              <li>
                <a href="#pronunciation-guide" className="text-sm text-secondary hover:text-primary transition-colors">
                  Pronunciation Guide
                </a>
              </li>
            </ul>
          </div>
          
          {/* Tools Section */}
          <div>
            <h4 className="font-semibold mb-4">Tools</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/tools#converter" className="text-sm text-secondary hover:text-primary transition-colors">
                  Text Converter
                </Link>
              </li>
              <li>
                <Link href="/tools#lookup" className="text-sm text-secondary hover:text-primary transition-colors">
                  Reverse Lookup
                </Link>
              </li>
              <li>
                <Link href="/tools#pdf" className="text-sm text-secondary hover:text-primary transition-colors">
                  PDF Generator
                </Link>
              </li>
              <li>
                <Link href="/widget-demo" className="text-sm text-secondary hover:text-primary transition-colors">
                  Widget Embed
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Resources Section */}
          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-2">
              <li>
                <a href="#faq" className="text-sm text-secondary hover:text-primary transition-colors">
                  FAQ
                </a>
              </li>
              <li>
                <Link href="/sitemap.xml" className="text-sm text-secondary hover:text-primary transition-colors">
                  Sitemap
                </Link>
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
            <p className="text-sm text-secondary">
              © {currentYear} NATO Phonetic Alphabet. Educational resource for learning the international radiotelephony spelling alphabet.
            </p>
            <div className="flex gap-6">
              <Link href="/privacy" className="text-sm text-secondary hover:text-primary transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-sm text-secondary hover:text-primary transition-colors">
                Terms of Use
              </Link>
              <Link href="/accessibility" className="text-sm text-secondary hover:text-primary transition-colors">
                Accessibility
              </Link>
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