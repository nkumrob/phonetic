import { Metadata } from 'next';
import { generateMetadata as baseGenerateMetadata } from '@/lib/seo/metadata';
import ToolsPageClient from './tools-client';

export const metadata: Metadata = baseGenerateMetadata(
  'NATO Phonetic Alphabet Tools',
  'Convert text to phonetic alphabet and lookup code words',
  '/tools'
);

export default function ToolsPage() {
  return <ToolsPageClient />;
}