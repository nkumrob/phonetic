import { Metadata } from 'next';
import { generateMetadata as baseGenerateMetadata } from '@/lib/seo/metadata';
import Link from 'next/link';

export const metadata: Metadata = baseGenerateMetadata(
  'Terms of Use',
  'Terms and conditions for using the NATO Phonetic Alphabet learning platform',
  '/terms'
);

export default function TermsPage() {
  return (
    <div className="container py-12 mb-24">
      <div className="max-w-3xl mx-auto prose prose-lg dark:prose-invert">
        <h1 className="text-5xl font-black tracking-headlines mb-8">Terms of Use</h1>
        
        <p className="text-xl text-secondary mb-8">
          Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>

        <section className="mb-8">
          <h2 className="text-3xl font-bold mb-4">Acceptance of Terms</h2>
          <p className="text-secondary">
            By accessing and using the NATO Phonetic Alphabet learning platform, you agree to be 
            bound by these Terms of Use. If you do not agree to these terms, please do not use 
            our service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-3xl font-bold mb-4">Educational Purpose</h2>
          <p className="text-secondary">
            This platform is provided for educational purposes only. It is designed to help users 
            learn and practice the NATO phonetic alphabet. The content is provided &quot;as is&quot; for 
            informational and educational use.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-3xl font-bold mb-4">Use License</h2>
          <p className="text-secondary mb-4">Under this license you may:</p>
          <ul className="list-disc pl-6 space-y-2 text-secondary">
            <li>Access and use the platform for personal, educational purposes</li>
            <li>Practice and learn the NATO phonetic alphabet</li>
            <li>Share the platform with others for educational purposes</li>
          </ul>
          <p className="text-secondary mt-4">You may not:</p>
          <ul className="list-disc pl-6 space-y-2 text-secondary">
            <li>Use the platform for commercial purposes without permission</li>
            <li>Attempt to disrupt or interfere with the platform&apos;s operation</li>
            <li>Scrape or harvest data from the platform</li>
            <li>Misrepresent the source or ownership of the content</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-3xl font-bold mb-4">Disclaimer</h2>
          <p className="text-secondary">
            The materials on this platform are provided on an &apos;as is&apos; basis. We make no 
            warranties, expressed or implied, and hereby disclaim and negate all other warranties 
            including, without limitation, implied warranties or conditions of merchantability, 
            fitness for a particular purpose, or non-infringement of intellectual property.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-3xl font-bold mb-4">Limitations</h2>
          <p className="text-secondary">
            In no event shall our platform or its suppliers be liable for any damages (including, 
            without limitation, damages for loss of data or profit, or due to business interruption) 
            arising out of the use or inability to use the materials on our platform.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-3xl font-bold mb-4">Accuracy of Materials</h2>
          <p className="text-secondary">
            While we strive to ensure accuracy, the materials appearing on our platform could 
            include technical, typographical, or photographic errors. We do not warrant that 
            any of the materials are accurate, complete, or current.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-3xl font-bold mb-4">Links</h2>
          <p className="text-secondary">
            We have not reviewed all of the sites linked to our platform and are not responsible 
            for the contents of any such linked site. The inclusion of any link does not imply 
            endorsement. Use of any linked website is at the user&apos;s own risk.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-3xl font-bold mb-4">Modifications</h2>
          <p className="text-secondary">
            We may revise these terms of use at any time without notice. By using this platform, 
            you are agreeing to be bound by the then current version of these terms of use.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-3xl font-bold mb-4">Contact Information</h2>
          <p className="text-secondary">
            If you have any questions about these Terms of Use, please visit our{' '}
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