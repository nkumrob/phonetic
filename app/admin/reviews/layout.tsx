import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Review Management | Admin',
  description: 'Manage and moderate user reviews',
  robots: 'noindex, nofollow', // Don't index admin pages
};

export default function AdminReviewsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

