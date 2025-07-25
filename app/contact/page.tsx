import { Metadata } from 'next';
import { generateMetadata as baseGenerateMetadata } from '@/lib/seo/metadata';
import Link from 'next/link';

export const metadata: Metadata = baseGenerateMetadata(
  'Contact',
  'Get in touch with us about the NATO Phonetic Alphabet learning platform',
  '/contact'
);

export default function ContactPage() {
  return (
    <div className="container py-12 mb-24">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-5xl font-black tracking-headlines mb-8">Contact</h1>
        
        <div className="prose prose-lg dark:prose-invert">
          <p className="text-xl text-secondary mb-8">
            Have questions, feedback, or suggestions? We&apos;d love to hear from you!
          </p>

          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">Get in Touch</h2>
            
            <div className="space-y-6">
              <div className="p-6 bg-warmNeutral-50 dark:bg-warmNeutral-900 rounded-xl border-2 border-border">
                <h3 className="text-xl font-semibold mb-3">Developer Contact</h3>
                <p className="text-secondary mb-4">
                  This educational platform was created to help people learn the NATO phonetic alphabet effectively.
                </p>
                <div className="space-y-3">
                  <a 
                    href="https://www.linkedin.com/in/appiahrobert/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-primary hover:underline"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                    Connect on LinkedIn
                  </a>
                </div>
              </div>

              <div className="p-6 bg-warmNeutral-50 dark:bg-warmNeutral-900 rounded-xl border-2 border-border">
                <h3 className="text-xl font-semibold mb-3">Feedback & Suggestions</h3>
                <p className="text-secondary">
                  Your feedback helps improve this learning platform. Whether you&apos;ve found a bug, 
                  have a feature request, or just want to share your experience, we appreciate 
                  hearing from you.
                </p>
              </div>

            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">About This Project</h2>
            <p className="text-secondary mb-4">
              The NATO Phonetic Alphabet platform is a free educational resource designed to help 
              aviation professionals, military personnel, radio operators, and anyone interested 
              in learning the international radiotelephony spelling alphabet.
            </p>
            <p className="text-secondary">
              Our goal is to provide an effective, interactive, and enjoyable learning experience 
              that helps users master the phonetic alphabet through various practice modes and tools.
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t">
          <Link href="/" className="text-primary hover:underline">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}