import { Metadata } from 'next';
import { generateMetadata as baseGenerateMetadata } from '@/lib/seo/metadata';
import ToolsPageClient from './tools-client';

export const metadata: Metadata = baseGenerateMetadata(
  'Productivity Tools — Phonetic Converter & AI Suite',
  'NATO phonetic converter plus AI tools for prompting, writing, summarizing, and reviewing work — practical productivity tools for professionals and teams',
  '/tools'
);

export default function ToolsPage() {
  return <ToolsPageClient />;
}