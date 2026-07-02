import { Metadata } from 'next';
import { generateMetadata as baseGenerateMetadata } from '@/lib/seo/metadata';
import ToolsPageClient from './tools-client';

export const metadata: Metadata = baseGenerateMetadata(
  'Tools for Mission-Critical Work — Phonetic Converter & AI Suite',
  'NATO phonetic converter, AI prompt improver, email drafter, summarizer, and output checker — productivity tools for aviation, military, maritime, and emergency professionals',
  '/tools'
);

export default function ToolsPage() {
  return <ToolsPageClient />;
}