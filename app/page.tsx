import { Metadata } from 'next';
import { generateMetadata as baseGenerateMetadata } from '@/lib/seo/metadata';
import HomeClient from './home-client';

export const metadata: Metadata = baseGenerateMetadata();

export default function Home() {
  return <HomeClient />;
}
