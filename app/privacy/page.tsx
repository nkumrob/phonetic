import { Metadata } from 'next';
import { generateMetadata as baseGenerateMetadata } from '@/lib/seo/metadata';
import Link from 'next/link';

export const metadata: Metadata = baseGenerateMetadata(
  'Privacy Policy',
  'How natophonetic.com handles your data across our AI productivity tools and NATO comms training',
  '/privacy'
);

const LAST_UPDATED = 'July 8, 2026';

export default function PrivacyPage() {
  return (
    <div className="container py-12 mb-24">
      <div className="max-w-3xl mx-auto prose prose-lg dark:prose-invert">
        <h1 className="text-5xl font-black tracking-headlines mb-8">Privacy Policy</h1>

        <p className="text-xl text-secondary mb-8">Last updated: {LAST_UPDATED}</p>

        <section className="mb-8">
          <h2 className="text-3xl font-bold mb-4">Overview</h2>
          <p className="text-secondary">
            natophonetic.com provides AI productivity tools and NATO comms training. We collect the
            minimum data needed to run the service and measure whether it helps people. We do not
            require accounts, we do not sell data, and we do not build advertising profiles. This
            page describes exactly what is collected and where it goes.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-3xl font-bold mb-4">Anonymous Visitor ID</h2>
          <p className="text-secondary">
            When you visit, we set a cookie named <code>np_anon</code> containing a random
            identifier. It holds no personal information and is not linked to your name, email, or
            IP address. We use it to count unique visitors, to understand how the tools are used,
            and to keep your practice progress and tool history available when you return. It
            expires after a year of inactivity, and you can delete it at any time through your
            browser settings.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-3xl font-bold mb-4">Usage Analytics</h2>
          <p className="text-secondary mb-4">
            We run our own first-party analytics. When you use the site we record events such as
            page views, phonetic converter uses, practice sessions and completions, and AI tool
            runs. Each event may include:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-secondary">
            <li>The anonymous visitor ID described above</li>
            <li>Which tool or page was used, and when</li>
            <li>
              Your approximate location (country and city), derived from our hosting provider&apos;s
              network headers. We never store your IP address
            </li>
            <li>
              For AI tools: the model used, token counts, response time, and your optional one-tap
              &ldquo;time saved&rdquo; feedback, but never the content of what you typed
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-3xl font-bold mb-4">AI Tool Inputs</h2>
          <p className="text-secondary">
            Text you submit to the AI tools (for example, notes you want summarized or an email you
            want drafted) is sent to our AI model provider (currently OpenAI and/or Anthropic) to
            generate the response, subject to their API data policies. We do not store your inputs
            or the AI outputs on our servers; only the usage metadata listed above is recorded.
            Avoid submitting information you are not permitted to share, and treat AI output as a
            draft to verify, not a final authority.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-3xl font-bold mb-4">Progress Sync</h2>
          <p className="text-secondary">
            Your recent tool history and time-saved tally are kept in your browser&apos;s local
            storage and also synced to our database under your anonymous visitor ID, so they
            survive a cleared browser. Clearing the <code>np_anon</code> cookie permanently
            disconnects you from that server copy.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-3xl font-bold mb-4">Reviews</h2>
          <p className="text-secondary">
            If you submit a review, we store the name, rating, and text you provide, and your email
            address if you choose to include one. Emails are used only to verify authenticity and
            are never displayed publicly or shared.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-3xl font-bold mb-4">Third-Party Services</h2>
          <ul className="list-disc pl-6 space-y-2 text-secondary">
            <li>
              <strong>Vercel</strong> hosts the site and may process technical data (IP address,
              browser information) to serve requests and provide performance monitoring.
            </li>
            <li>
              <strong>Turso</strong> stores our analytics and progress database.
            </li>
            <li>
              <strong>OpenAI / Anthropic</strong> process AI tool inputs as described above.
            </li>
            <li>
              <strong>Google Analytics</strong> may run when enabled; it is currently used only in
              aggregate and can be blocked by standard browser tools without affecting the site.
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-3xl font-bold mb-4">Your Choices</h2>
          <ul className="list-disc pl-6 space-y-2 text-secondary">
            <li>Delete the <code>np_anon</code> cookie to reset your anonymous identity</li>
            <li>Clear local storage via browser settings to remove on-device history</li>
            <li>Use private browsing for sessions that leave nothing behind</li>
            <li>
              Ask us to delete the data associated with your anonymous ID or review via the contact
              page
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-3xl font-bold mb-4">Contact</h2>
          <p className="text-secondary">
            For privacy-related questions, corrections, or deletion requests, please visit our{' '}
            <Link href="/contact" className="text-primary hover:underline">
              contact page
            </Link>
            .
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
