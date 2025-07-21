# Claude Memories - Phonetic Alphabet Project

## Critical Fixes & Lessons

### 2025-01-21
- **Tailwind CSS v4 incompatibility**: Downgraded to v3.4.0 as v4 isn't stable yet
- **Event handlers in Server Components**: Added 'use client' directive to pages using onClick
- **Speech synthesis initialization**: Needs time to load voices, implemented proper loading state
- **Speech synthesis errors**: Added robust error handling with custom hook (useSpeechSynthesis)
- **TypeScript strict mode**: Cast OpenGraph type as 'website' and Twitter card as 'summary_large_image'
- **Not-found page needs client directive**: Server components can't have event handlers
- **Bundle size optimization**: Achieved 115KB first load JS (excellent performance)
- **Speech synthesis "canceled" error**: Cancel() followed immediately by speak() causes issues - add 50ms delay
- **Browser compatibility**: Some browsers need voices loaded before speech works

## Project Structure Decisions
- Used Next.js 14 App Router with TypeScript
- Implemented custom UI components instead of external libraries
- Browser-based TTS instead of external audio files
- Session-only history (no database required)
- Error boundaries for each major component
- SEO optimized with metadata, sitemap, and structured data

## Key Features Implemented
- Interactive NATO alphabet grid with keyboard navigation
- Real-time text-to-phonetic converter with 1000 char limit
- Fuzzy search reverse lookup with typo tolerance
- Dark/light mode toggle
- Loading states with skeleton components
- Comprehensive error handling and 404 page
- Full accessibility compliance (ARIA labels, keyboard nav)

## Performance Metrics
- Build size: 115KB First Load JS
- 28 unit tests passing
- Production build successful
- No critical vulnerabilities

## Next Phase Priorities
- Deploy to Vercel
- Cross-browser testing
- Add printable PDF generation
- Implement learning mode with quizzes
- Add localization for multiple languages

## Phase 2 Implementation (2025-01-21)
- **Enhanced Quiz System**: Added 5 difficulty levels (easy to nightmare) with 10 question types
- **Gamification Features**: Level system, XP, achievements, unlockable modes, combo multipliers
- **Session Context**: Centralized state management for user progress, achievements, and history
- **Quiz Modes**: Classic, Speed Run, Survival, Perfectionist, Nightmare - each unlocked at different levels
- **Achievement System**: 9 achievements across quiz, learning, streak, and special categories
- **Profile Page**: Shows user stats, level, XP, achievements progress, and reset option
- **Improved UX**: Tabbed navigation in practice page, animated transitions, progress tracking

## Premium Design Overhaul (2025-01-21)
- **Typography System**: Perfect fourth scale (1.333 ratio) with Inter font, 900 weight headlines
- **Color System**: Cool blue primary with warm amber secondary, proper WCAG AA contrast
- **Spacing Grid**: Mathematical 8px base grid system with consistent spacing scale
- **Premium Components**: Redesigned cards with hover effects, gradient accents, micro-animations
- **Hero Section**: Gradient backgrounds, animated elements, trust indicators
- **Interactive Elements**: Smooth transitions, hover states, focus management
- **Responsive Design**: Mobile-first approach with fluid typography and spacing