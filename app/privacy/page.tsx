import { Metadata } from 'next';
import { generateMetadata as baseGenerateMetadata } from '@/lib/seo/metadata';
import Link from 'next/link';

export const metadata: Metadata = baseGenerateMetadata(
  'Privacy Policy',
  'Learn how we protect your privacy while using the NATO Phonetic Alphabet learning platform',
  '/privacy'
);

export default function PrivacyPage() {
  return (
    <div className="container py-12 mb-24">
      <div className="max-w-3xl mx-auto prose prose-lg dark:prose-invert">
        <h1 className="text-5xl font-black tracking-headlines mb-8">Privacy Policy</h1>
        
        <p className="text-xl text-secondary mb-8">
          Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>

        <section className="mb-8">
          <h2 className="text-3xl font-bold mb-4">Overview</h2>
          <p className="text-secondary">
            NATO Phonetic Alphabet is committed to protecting your privacy. This educational platform 
            operates without collecting personal data, using cookies only for essential functionality.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-3xl font-bold mb-4">Data Collection</h2>
          <p className="text-secondary mb-4">We collect minimal data to provide our service:</p>
          <ul className="list-disc pl-6 space-y-2 text-secondary">
            <li>Learning progress stored locally in your browser</li>
            <li>Preferences (theme, sound settings) stored locally</li>
            <li>Anonymous usage analytics via Google Analytics</li>
            <li>No personal information is collected or transmitted</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-3xl font-bold mb-4">Local Storage</h2>
          <p className="text-secondary">
            All your learning data, including quiz scores, flashcard progress, and preferences, 
            are stored locally in your browser. This data never leaves your device and can be 
            cleared at any time through your browser settings.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-3xl font-bold mb-4">Analytics</h2>
          <p className="text-secondary">
            We use Google Analytics to understand how users interact with our platform. 
            This helps us improve the learning experience. Analytics data is anonymous and 
            includes page views, session duration, and general location (country level).
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-3xl font-bold mb-4">Third-Party Services</h2>
          <p className="text-secondary">
            Our platform uses Vercel for hosting and performance monitoring. These services 
            may collect technical data such as IP addresses and browser information for 
            operational purposes.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-3xl font-bold mb-4">Your Rights</h2>
          <p className="text-secondary mb-4">You have the right to:</p>
          <ul className="list-disc pl-6 space-y-2 text-secondary">
            <li>Clear all locally stored data via browser settings</li>
            <li>Disable JavaScript to prevent any data storage</li>
            <li>Use browser privacy modes for ephemeral sessions</li>
            <li>Block analytics through browser extensions</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-3xl font-bold mb-4">Contact</h2>
          <p className="text-secondary">
            For privacy-related questions or concerns, please visit our{' '}
            <Link href="/contact" className="text-primary hover:underline">
              contact page
            </Link>.
          </p>
        </section>

        <div className="mt-12 pt-8 border-t">
          <Link href="/" className="text-primary hover:underline">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}