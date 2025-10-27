import { Metadata } from 'next';
import { generateMetadata as baseGenerateMetadata } from '@/lib/seo/metadata';
import ReviewsClient from './reviews-client';

export const metadata: Metadata = baseGenerateMetadata(
  'Reviews & Testimonials',
  'Read user reviews and testimonials about learning the NATO phonetic alphabet with our platform',
  '/reviews'
);

export default function ReviewsPage() {
  return <ReviewsClient />;
}

