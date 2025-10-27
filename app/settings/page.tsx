import { Metadata } from 'next';
import { generateMetadata as baseGenerateMetadata } from '@/lib/seo/metadata';
import SettingsClient from './settings-client';

export const metadata: Metadata = baseGenerateMetadata(
  'Settings',
  'Customize your NATO phonetic alphabet learning experience with theme and sound preferences',
  '/settings'
);

export default function SettingsPage() {
  return <SettingsClient />;
}