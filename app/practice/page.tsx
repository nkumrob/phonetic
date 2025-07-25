import { Metadata } from 'next';
import { generateMetadata as baseGenerateMetadata } from '@/lib/seo/metadata';
import SimplePracticeClient from './simple-practice-client';

export const metadata: Metadata = baseGenerateMetadata(
  'Practice NATO Phonetic Alphabet',
  'Test your knowledge with interactive quizzes and flashcards',
  '/practice'
);

export default function PracticePage() {
  return <SimplePracticeClient />;
}