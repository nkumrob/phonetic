import { Metadata } from 'next';
import { generateMetadata as baseGenerateMetadata } from '@/lib/seo/metadata';
import { FeatureRequestForm } from '@/components/feedback/feature-request-form';

export const metadata: Metadata = baseGenerateMetadata(
  'Feature Requests',
  'Tell us what would make the AI tools or NATO comms training more useful for your work.',
  '/feature-request'
);

export default function FeatureRequestPage() {
  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-2xl">
        <div className="mb-10 text-center">
          <p className="font-mono text-[13px] uppercase tracking-[0.12em] text-tertiary">
            Feature requests
          </p>
          <h1 className="mt-2 text-4xl font-black tracking-headlines md:text-5xl">
            What should we build next?
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-gray-600 dark:text-warmNeutral-300">
            Tell us what would make the AI tools or NATO comms training more useful for your work.
          </p>
        </div>
        <div className="rounded-xl border border-warmNeutral-200 bg-white p-6 shadow-[0_16px_32px_-20px_rgba(92,54,38,0.35)] dark:border-warmNeutral-700 dark:bg-warmNeutral-800 md:p-8">
          <FeatureRequestForm />
        </div>
      </div>
    </div>
  );
}
