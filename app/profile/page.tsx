import { Metadata } from 'next';
import { generateMetadata as baseGenerateMetadata } from '@/lib/seo/metadata';
import ProfileClient from './profile-client';

export const metadata: Metadata = baseGenerateMetadata(
  'Your Profile',
  'View your NATO phonetic alphabet learning progress, quiz history, and customize your profile',
  '/profile'
);

export default function ProfilePage() {
  return <ProfileClient />;
}