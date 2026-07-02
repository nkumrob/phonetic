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

### 2025-01-23
- **Phonetic Translator Widget**: Created standalone embeddable widget component (PhoneticTranslatorWidget)
- **Widget Features**: Compact/normal modes, customizable styling, copy functionality, onTranslate callback
- **Widget Integration**: Exported from phonetic components index, created demo page at /widget-demo
- **Widget Use Cases**: Sidebar embed, modal popup, form integration, blog post embed examples
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

## Practice Experience Redesign (2025-01-21)
- **Unified Practice Hub**: Single entry point replacing 3 confusing tabs (Enhanced, Classic, Flashcards)
- **Simplified Modes**: Consolidated into 3 clear options - Learn (flashcards), Practice (no timer), Challenge (timed)
- **Quick Start Feature**: One-click practice with smart difficulty selection based on user level
- **Progress Dashboard**: Sidebar showing level, XP, streak, daily goals, and next achievement
- **Daily Goals System**: 3 daily goals with XP rewards that reset at midnight
- **Session Saved Indicators**: Visual confirmation when progress is saved
- **Improved Navigation**: Removed tab navigation, clear back buttons, consistent UI patterns
- **Fixed Issues**: Session persistence visibility, endless quiz bug, achievement tracking integration

## Critical Gaps Identified in Gamification (2025-01-21)
- **No Onboarding**: Users don't understand XP, levels, or why to learn NATO alphabet
- **Meaningless Progression**: XP and levels unlock nothing tangible
- **Broken Quick Start**: Just rotates modes, not actually smart/adaptive
- **No Spaced Repetition**: Learning isn't optimized for memory retention
- **Flat Reward Structure**: No variable rewards, bonuses, or multipliers that matter
- **Silent Progression**: Level ups and achievements happen without celebration
- **No Social Elements**: No leaderboards, sharing, or competition
- **Learning Not Personalized**: Doesn't track struggling letters or adapt difficulty
- **Daily Goals Issues**: Reset on refresh, not midnight; no completion streak
- **Core Problem**: Feels like a study tool, not an engaging game where you learn

## Gamification System Implementation (2025-01-21)
- **Spaced Repetition Algorithm**: SM-2 based system tracking letter memory states and intervals
- **Web Audio API Sound Effects**: Generated sounds for correct/incorrect/streaks without external files
- **Celebration System**: Particle animations for achievements, streaks, level ups with presets
- **XP Gain Animations**: Floating XP numbers that show exactly where points come from
- **Daily Goals v2**: Fixed midnight reset logic with proper localStorage persistence and streak tracking
- **Onboarding Flow**: Interactive tutorial teaching NATO alphabet purpose and first letter (Alpha)
- **Level Up Ceremony**: Full-screen celebration with rank progression and unlock displays
- **Streak Display Component**: Visual fire animation for streaks with size variants
- **Integration Points**: All gamification hooks into unified quiz and practice hub seamlessly
- **Key Fix**: Daily goals now persist correctly using date-based storage keys and timezone handling
- **XP Animation Loop Fix**: Removed circular dependency in useEffect by removing unstable onComplete callback from deps
- **Duplicate Key Errors Fix**: Added debouncing (50ms), crypto.randomUUID for unique IDs, and position-based filtering
- **Strict Progression System**: 70% pass for practice, 80% for challenge, XP penalties (-3 wrong, -5/-10 retry)
- **Quiz Failure Screen**: Shows accuracy vs requirement, retry with XP penalty, helpful tips
- **Level Gates**: Challenge mode requires Level 3+, 70% accuracy, 5 streak achievement
- **XP Overflow Fix**: Added level-up logic to updateProgress preventing impossible XP displays (600/500)
- **Intelligent Distractors**: Phonetically similar options, civilian alternatives, common mistakes by difficulty
- **Print/PDF Color Fix**: Print preview and PDFs need black text (#000000) not colored text; add print-color-adjust: exact
- **XP Calculation Bug**: XP was being subtracted during level-ups! Now store total XP, calculate level from that
- **Multiple Streak Systems**: Quiz has session streak (resets each quiz), global streak (persistent), daily streak (goals)
- **Race Conditions**: localStorage saves debounced 500ms can cause XP updates to overwrite each other
- **Enhanced Flashcards**: Replaced old flashcards with gamified version - XP rewards, mastery tracking, review/test modes
- **Flashcard Mastery System**: 0-5 star rating per letter, XP scaled by mastery level, visual progress indicators

## Internationalization (i18n) Implementation (2025-01-22) - REMOVED
- **Attempted Setup**: Implemented next-intl with [locale] routing, 5 languages, translation files
- **Issues Found**: Language selector navigation complexity, translation overhead for simple app
- **Decision**: Removed i18n implementation per user request - app remains English-only
- **Key Learning**: NATO alphabet is international standard - code words don't change per language
- **Future Option**: Can use free services like LibreTranslate API or community translations if needed

## Critical Practice/Quiz System Analysis (2025-01-22)
- **XP Display Bug**: XP bar shows total XP (600) instead of current level XP (0-99), causing impossible displays like 600/500
- **Race Conditions**: Multiple simultaneous XP updates with 500ms debounced saves cause lost progress
- **Failed Quiz Handling**: Failed quizzes don't save any progress, only passed quizzes are recorded
- **Multiple Streak Types**: Session streak, best streak, current streak (unused), daily streak cause confusion
- **Daily Goals Reset Bug**: Can reset on page refresh instead of midnight due to poor date checking
- **State Fragmentation**: Game state split across 7+ localStorage keys instead of single source of truth
- **Level Calculation Duplication**: Level calculated differently in session-context vs xp-calculations
- **Missing Spaced Repetition**: SM-2 algorithm implemented but never used for adaptive learning
- **Onboarding Repeat Bug**: Shows again if localStorage fails, no fallback check for existing progress
- **Root Cause**: Incremental feature additions without refactoring core state management system

## XP/Progress System Fixes (2025-01-22)
- **Fixed XP Calculation**: Created centralized xp-system.ts for consistent XP calculations across components
- **Fixed XP Display**: Now shows correct XP (e.g., "+10 XP +5 streak" not "2024 XP")
- **Fixed Negative XP**: Wrong answers now properly deduct XP with floor of -50 (was showing 0)
- **Fixed Onboarding Loop**: Added check for existing progress not just localStorage flag
- **Fixed Race Conditions**: Immediate saves for XP updates, 500ms debounce for non-critical updates
- **Fixed Failed Quiz Saves**: Quiz results now always saved for tracking, not just when passed
- **Reduced Debounce**: From 500ms to 100ms for faster saves (later reverted to 500ms for non-XP)
- **Key Insight**: XP updates need immediate saves, other updates can be debounced for performance
- **Streak Consolidation**: Created unified streak types definition documenting all 5 streak systems
- **Daily Goals Reset**: Logic is correct - uses date comparison and checks every minute
- **Unused Code**: Spaced repetition algorithm exists but never integrated into quiz system

## State Management Refactoring (2025-01-22)
- **Created Unified State System**: Single source of truth in nato_game_state_v3
- **Centralized Level System**: LevelSystem class handles all level calculations
- **State Migration**: Automatic migration from 11+ localStorage keys to unified state
- **React Hook**: useUnifiedState hook for easy component integration
- **Type Safety**: Full TypeScript types for entire game state
- **Immediate XP Saves**: Critical updates save immediately, others debounced
- **Backwards Compatible**: Migration preserves all existing user data
- **Adaptive Quiz System**: Integrated spaced repetition (SM-2) algorithm for intelligent learning
- **Letter Memory Tracking**: Each letter tracked with interval, ease factor, and performance
- **Context Variation**: Questions adapt type based on user performance (audio, visual, spelling)
- **Migration Layer**: useSessionCompat provides backwards compatibility during transition
- **SSR Fix**: Added window checks to prevent localStorage access on server side
- **Level Calculation Fix**: Removed duplicate level calculation in addQuizResult that was subtracting XP
- **Reset Progress Fix**: Added clearing of nato_game_state_v3 to resetSession function
- **Hydration Error Fix**: Added isClient checks to prevent server/client mismatches in PracticeHubV2
- **Streak Systems Analysis**: Found 5 different streak types: sessionStreak (per quiz), globalBestStreak, dailyPracticeStreak, dailyGoalStreak, currentStreak (deprecated)
- **Streak Display Components**: StreakDisplay component with fire animations, StreakCalendar for daily tracking
- **Streak Storage**: globalBestStreak in stats, dailyPracticeStreak in stats, dailyGoalStreak in daily goals localStorage, sessionStreak temporary per quiz
- **Streak Achievements**: streakMaster (20 streak), dailyPlayer (7 days), shown in profile and practice hub
- **Potential Issues**: Multiple overlapping streak concepts may confuse users, currentStreak field deprecated but still in interfaces
- **Sound Settings Not Reactive**: Fixed by adding React state to track settings, initialized from localStorage
- **Speech Synthesis Volume**: Created centralized speechManager utility that respects global sound settings across all components
- **Quiz Accuracy Closure Bug**: Fixed state closure issue in endQuiz callback causing 0% accuracy - now passes finalStats parameter explicitly
- **Level-Up Animation Loop**: Fixed infinite loop caused by 3 components (UnifiedQuiz, PracticeHub, PracticeHubV2) all showing ceremony for same event
- **Level-Up Duplicate Fix**: Only UnifiedQuiz shows ceremony now, others just clear the event or play sounds
- **XP Streak Bonus Discovery**: Each consecutive correct answer adds +5 XP streak bonus - 5 correct in a row = 100 XP total (triggers level 2)
- **Level-Up During Quiz**: Fixed confusing mid-quiz level-ups by deferring ceremony until quiz completion, shows pending indicator instead
- **Question Counter Skip Bug**: Fixed double nextQuestion() calls on timeout causing quiz to skip questions (e.g., showing Q4 with only 2 answers)
- **Testing Strategy**: Always analyze fully before making changes, create regression tests to prevent breaking existing functionality
- **Test-Driven Development**: Implemented comprehensive TDD methodology with templates, utilities, and CI/CD pipeline for maintaining code quality
- **TDD Structure**: Created test templates for components, hooks, and integration tests with proper mocking and assertions
- **Testing Dependencies**: Added @testing-library/user-event, jest-axe for accessibility, husky for pre-commit hooks
- **CI/CD Pipeline**: GitHub Actions workflow runs tests on every push/PR with coverage reporting to ensure quality
- **Test Coverage**: Set 80% minimum coverage thresholds for branches, functions, lines, and statements
- **Pre-commit Hooks**: Husky runs tests and linting before commits to catch issues early in development
- **Misleading Quiz Failure Message**: Fixed "no XP awarded" text that confused users - XP is earned per correct answer during quiz, not at end
- **XP Progress Bar Visibility**: Added border and minimum background color to make empty progress bar visible, set minimum width to 0.5% for 0 XP states
- **Level Calculation Mismatch**: Fixed issue where Level 2 with 309 XP showed as 0/150 XP - added fallbacks and total XP display for debugging
- **Progress Section Fix (2025-01-22)**: Fixed incorrect progress display by migrating profile, header, achievements to use unified state via useSessionCompat hook
- **Dual State Management Issue**: App was using both old session-context and new unified-state-manager causing data inconsistencies - migrated components to unified state
- **XP Display Consistency**: All components now calculate level from total XP using LevelSystem.calculateLevel() ensuring consistent display across profile, header, practice hub
- **XP Not Saving Bug (2025-01-22)**: Quiz earned XP wasn't persisting - fixed by migrating UnifiedQuiz and EnhancedFlashcards to use useSessionCompat instead of old useSession hook
- **Unified State Migration**: Critical components (quiz, flashcards) were still using old session context causing XP updates to be lost - now all use unified state manager
- **Level-Up Gating System (2025-01-22)**: Implemented proper level progression requiring BOTH sufficient XP AND passing quiz (70%+ accuracy) - prevents awkward mid-quiz level-ups
- **Pending Level-Up State**: Added currentLevel and pendingLevelUp fields to track when XP is enough but quiz completion required for actual level advancement
- **Level Confirmation Flow**: XP accumulates but level only increases after confirmLevelUp() called on successful quiz - ensures competency before progression
- **XP Display Fix (2025-01-22)**: Quiz failure screen was misleadingly showing earned XP without deductions - now shows net XP (earned minus penalties) matching navbar
- **XP Display Consistency (2025-01-22)**: Fixed confusing XP displays - header now shows level progress (96/200 XP) instead of total XP, matching progress section for clarity
- **Total XP Location**: Total XP is shown in profile page prominently and as a separate line item in practice hub stats to avoid confusion with level progress
- **Daily Goals Reset Fix (2025-01-22)**: Daily goals weren't clearing on reset - fixed by adding localStorage.removeItem('dailyGoals_v2') to UnifiedStateManager.reset() method
- **Gamification Removal Started (2025-01-22)**: Created parallel simple state system alongside existing to gradually remove gamification without breaking existing functionality
- **Simple State Architecture**: Created SimpleAppState, SimpleStateManager, useSimpleState hook, and SimpleAppContext for non-gamified state management
- **Simple Components Created**: SimpleQuiz (no XP/streaks), SimpleFlashcards (basic reviews), SimplePracticeHub (no levels/achievements), SimpleHeader (no XP display)
- **Gradual Migration Strategy**: Keep both systems running in parallel at /practice-simple, /profile-simple, /settings-simple routes for safe testing before full migration
- **Gamification Removal Completed (2025-01-22)**: Successfully removed all gamification components, replaced with simple state management system
- **Simple State Migration**: Migrated all main routes (practice, profile, settings) to use SimpleAppState without XP, levels, achievements, or streaks
- **Clean Architecture Achieved**: Removed ~40% of code, simplified state management, focused purely on learning NATO phonetic alphabet
- **Preserved Features**: Kept profile customization (name/avatar), flashcards, quiz modes (practice 70%, challenge 80%), and basic progress tracking
- **Quiz Reset Bug Fix (2025-01-22)**: Fixed issue where clicking "Try Again" after quiz completion would show first answer as already selected and incorrect - added reset of selectedAnswer and showResult states in startQuiz()
- **Design System Overhaul (2025-01-22)**: Implemented comprehensive design system following style guide - created design tokens, fixed typography (Inter 900 for headlines), proper color temperature mixing (warm neutrals + cool accents), 8px grid spacing, removed AI slop (generic gradients)
- **Typography Fix**: Headlines now use font-black (900 weight) with proper letter-spacing (-0.04em for 48px+), implemented perfect fourth scale (1.333 ratio)
- **Color System**: Replaced generic blue/purple gradients with warm neutral base (cream/brown) and cool blue accents, proper text opacity hierarchy (100%, 70%, 50%, 30%)
- **Component Redesign**: Buttons follow style guide with 2px borders, proper padding, transform hover effects; Cards use clean shadows (8px, 16px depths); Removed excessive rounded corners
- **Animation System**: Replaced linear transitions with proper easing curves (easeOutCubic, easeOutBack), consistent duration scale, micro-interactions on hover
- **Hero Section**: Implemented asymmetric split layout (1.2fr 1fr) following golden ratio principles, removed gradient backgrounds for clean design
- **Mobile Optimization**: Applied responsive typography classes (text-5xl sm:text-6xl lg:text-7xl), mobile-first grids, proper touch targets
- **Accessibility**: WCAG AA compliant focus states, proper contrast ratios, skip links, reduced motion support across all components
- **Pages Updated**: Home, Learn, Tools, Profile, Settings, Error, Not-Found - all now follow design system consistently
- **Contrast Issues Fix (2025-01-22)**: Fixed multiple contrast issues - practice hub icons barely visible on colored backgrounds, changed from light (50) to dark (500) backgrounds
- **Flashcard Audio Fix (2025-01-22)**: Fixed pronunciation saying "Alpha Alpha" instead of "A for Alpha" by adding comma for natural pause in speech synthesis
- **Button Contrast Fix**: Fixed Play Sound button on flashcards being invisible on light backgrounds by using solid dark button (warmNeutral-900) instead of transparent overlay
- **Production Readiness (2025-01-23)**: Started comprehensive production preparation - security headers, environment configuration, memory leak fixes, logger utility
- **Security Headers Added**: Implemented X-Frame-Options (DENY), X-Content-Type-Options (nosniff), Referrer-Policy, Content-Security-Policy in next.config.ts
- **Environment Configuration**: Created centralized env.ts config with validation, .env.local and .env.example files for proper environment management
- **Logger Utility**: Replaced all console.log/error with production-safe logger that only outputs in development, includes context and error metadata
- **Memory Leak Fixes**: Fixed setTimeout without cleanup in AlphabetGrid, ReverseLookup, and Settings components - added proper useRef and cleanup effects
- **Timer Cleanup Pattern**: Always use timerRef.current to store timer IDs, clear existing timers before setting new ones, cleanup on unmount with useEffect return
- **Rate Limiting Implementation**: Created RateLimiter utility with in-memory store, withRateLimit middleware wrapper for API routes, configurable per route
- **Rate Limit Headers**: X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset, Retry-After when limit exceeded
- **PDF API Rate Limit**: 20 downloads per hour per IP to prevent abuse while allowing legitimate use
- **Health API**: Created /api/health endpoint for monitoring with no caching (realtime config)
- **Error Boundaries Added**: Page-specific error boundaries for practice, learn, and tools pages with contextual error messages
- **Error Boundary Pattern**: useEffect to log errors, env.isDevelopment() for conditional error details, user-friendly messages
- **Font Optimization**: Replaced @fontsource imports with Next.js font optimization, removed 3 packages, uses variable fonts with swap display
- **Font Strategy**: Only load critical weights (400, 600, 900), preconnect to Google Fonts, proper fallback chain for better UX
- **Lazy Loading Implementation**: Created dynamic imports for SimplePracticeHub, SimpleQuiz, SimpleFlashcards, AlphabetGrid, TextConverter, ReverseLookup
- **Lazy Loading Benefits**: Reduces initial bundle by ~40%, improves Time to Interactive, maintains SEO with SSR enabled
- **Cache Headers Utility**: Created getCacheHeaders with presets - static (24h CDN), dynamic (1m CDN), private (browser only), realtime (no cache)
- **Vercel CDN Support**: Added CDN-Cache-Control and Vercel-CDN-Cache-Control headers for edge caching
- **API Caching Strategy**: PDF route uses static config (cacheable), health route uses realtime config (no cache)
- **Production Readiness Complete**: All 10 critical and medium priority tasks completed with E2E tests for verification
- **useRef Import Fix (2025-07-23)**: Fixed missing useRef import in reverse-lookup.tsx causing "useRef is not defined" error - added to React imports
- **Settings Page Hydration Fix (2025-07-23)**: Fixed settings page not working by adding useEffect to sync state after mount and mounted check to prevent hydration mismatches
- **Settings Real-time Updates (2025-07-23)**: Removed save button, made settings instant - theme uses useTheme hook, sound uses useSoundEffects hook directly, both persist to localStorage
- **Quiz Difficulty Enhancement (2025-07-23)**: Made quiz more challenging by adding phonetically similar distractors, commonly confused pairs, and similar-looking letter options instead of random choices
- **Hydration Error Fix (2025-07-23)**: Fixed emoji hydration mismatch by replacing complex emoji (🧑‍✈️) with simple airplane (✈️), added mounted check to ensure client-side rendering for dynamic content
- **Mobile Spacing Fixes (2025-07-23)**: Fixed cramped mobile UI - reduced header logo size, hide theme/settings on mobile, show "Back" instead of full text, reduced button spacing, adjusted flashcard heights
- **Chunk Loading Error Fix (2025-07-23)**: Fixed SimpleQuiz chunk loading error by clearing Next.js cache and restarting dev server - webpack was serving 404 HTML instead of JS chunk
- **Critters Module Fix (2025-07-23)**: Fixed "Cannot find module 'critters'" error by installing missing dependency - Next.js 15 requires it for CSS optimization but doesn't auto-install
- **Vercel Analytics Integration (2025-07-23)**: Added @vercel/analytics to track web vitals alongside Google Analytics for user behavior - both serve different purposes
- **SEO Implementation (2025-07-23)**: Implemented comprehensive SEO strategy - enhanced meta tags, FAQ schema, OG image generation, GA4 integration, favicon generation, audio pronunciation features
- **Google Analytics GA4 Integration (2025-07-25)**: Added Google Analytics tracking code (G-J1E4GKFXVT) to root layout.tsx, cleaned up leftover gamification components and duplicate sitemap file
- **Pronunciation Fix (2025-07-25)**: Updated speech synthesis to say "A for Alpha" format instead of just "Alpha" - updated alphabet-grid, reverse-lookup, and quiz components
- **Pronunciation Comma Fix (2025-07-25)**: Fixed "Alpha Alpha" concatenation issue by adding comma for natural pause - now says "A, for Alpha" matching flashcards implementation
- **Enhanced Text Translator (2025-07-25)**: Added TextConverter to home page with audio feature - speaks original text first, then phonetic translation letter by letter ("hello" then "H for Hotel, E for Echo...")
- **SEO-Optimized Footer (2025-07-25)**: Created semantic footer with sitemap links, social media, resources, schema.org markup, and proper navigation structure for improved SEO
- **Hydration Error Fix in SimplePracticeHub (2025-07-25)**: Fixed React hydration mismatch by adding mounted state to handle client-side localStorage values (userName, stats) - prevents server/client rendering differences
- **Speech Cancel on Navigation (2025-07-25)**: Enhanced speech synthesis cancellation with multiple cancel calls, pause/cancel combo, and explicit onClick handlers on all nav links to stop speech
- **Text Converter State Clear on Navigation (2025-07-25)**: Added pathname detection to clear text converter input/output state on route changes - prevents stale translations after navigation
- **Light Mode as Default (2025-07-25)**: Changed default theme from system preference to light mode - removed automatic dark mode switching, users can still change to dark/system in settings

### 2025-10-27 - SEO Fixes for Google Search Console
- **Duplicate Sitemap Issue**: Removed duplicate `app/sitemap.xml.ts` file - Next.js only needs `app/sitemap.ts`
- **Incomplete Sitemap**: Added missing pages to sitemap - /contact, /privacy, /terms, /reviews, /settings (was only 5 pages, now 10)
- **Client Component Metadata**: Fixed SEO for client components by separating into server wrapper + client component pattern
  - Created reviews-client.tsx, profile-client.tsx, settings-client.tsx with 'use client' directive
  - Updated page.tsx files to be server components that export metadata and render client components
- **Robots.txt Enhancement**: Added explicit disallow rules for /api/, /admin/, /_next/, /widget-demo
- **Canonical URLs**: All pages now have proper canonical URLs via generateMetadata function
- **Sitemap Priorities**: Organized sitemap with proper priorities - homepage (1.0), core learning (0.9), content (0.7), legal (0.4)
- **Key Learning**: Next.js client components can't export metadata - must use server component wrapper pattern
### 2026-07-01 - AI Tools Platform (Prompt Improver) + Turso Migration
- **AI Productivity Pivot**: Site expanding from phonetic utility into AI productivity tools (EB2 NIW economic-evidence strategy). First tool: Prompt Improver at /tools/prompt-improver.
- **Model Swap Seam**: Models are env-swappable, never code: `AI_MODEL_<TOOL>` → `AI_DEFAULT_MODEL` → `claude-haiku-4-5` fallback; provider behind `AiProvider` interface selected by `AI_PROVIDER` (lib/ai/provider-factory.ts). To change models, edit .env.local only.
- **Turso Replaces Supabase**: All persistence now Turso/libSQL via lib/db/client.ts (`TURSO_DATABASE_URL`; `file:./local.db` works for local dev with no account). Reviews routes migrated to lib/db/reviews-repo.ts; lib/supabase/ deleted; @supabase/supabase-js was never in package.json (feature was broken). Schema in lib/db/schema.sql, apply with `npm run db:init`.
- **Metrics Are Fire-and-Forget**: lib/ai/metrics.ts lazily imports the db client and never throws — AI responses must never fail because metrics failed. tool_usage table logs tokens/latency/anonymized session hash + one-tap time-saved feedback (petition evidence data).
- **Generic AI Route Pattern**: One route app/api/ai/[tool]/route.ts serves all AI tools; tool slug from pathname because withRateLimit drops the route context param. New tool = config entry in lib/ai/config.ts + system prompt file. Rate limit 10/hr/IP (calls cost money).
- **Jest Env Lesson (CRITICAL)**: Default jest env is jsdom; anything importing next/server or @anthropic-ai/sdk fails with "Request is not defined" — backend test files need `/** @jest-environment node */` docblock, and jest.setup.js browser mocks must be guarded with `typeof window !== 'undefined'`.
- **Jest userEvent Clipboard**: userEvent.setup() installs its own clipboard stub — assert via `await navigator.clipboard.readText()`, don't mock writeText.
- **Jest Is Slow Cold**: First jest run in this environment takes 3-5 min (SWC compile/haste crawl); warm cache runs are <1s. Use --runInBand; parallel workers hung. Don't assume a 2-min silent jest run is broken.
- **Cleanup**: Deleted stray duplicate "components/ui/input 2.tsx".
- **Full AI Tool Suite Shipped (2026-07-01)**: 5 tools live (prompt-improver, email-drafter, summarizer, meeting-actions, output-checker) all through the one generic route; frontend generalized to AiToolForm + AiToolPageShell + tool-registry.ts in components/ai-tools/ — a new tool needs only a prompt file, config entry, registry entry, page + error.tsx, sitemap line.
- **Mission-Critical Rebrand Task 1 (2026-07-01)**: Added phonetic-converter as first entry in AI_TOOLS (tool-registry.ts) with href='/tools' (not an LLM tool — links to NATO converter page). Audience taglines updated for all 6 tools. Test file created at components/ai-tools/__tests__/tool-registry.test.ts. 9/9 tests pass. Committed on feature/mission-critical-rebrand.
- **Next.js Route Export Constraint**: route.ts may ONLY export HTTP method handlers — testable factories must live in a colocated handler.ts (`.next/types` typecheck rejects extra exports once dev server regenerates types).
- **Hybrid Homepage**: NATO hero kept for SEO; AI tools introduced via subtitle bridge + HomeAiSection after features grid. home-client.tsx at 471 lines — extract any future additions into components.
- **Mission-Critical Rebrand Task 2 (2026-07-01)**: Added .micro-label CSS class to app/premium-design.css (appended 21 lines). Uppercase letter-spaced badge with warm amber/orange accent (#b4530a light, #f5a862 dark). Used sparingly as caution indicator. No tests required (pure CSS). Commit: 2b371074d805d795ee985c91f834e447. Ready for HomeHero component integration in Task 3.
- **Mission-Critical Rebrand Task 3 (2026-07-01)**: Created components/home/home-hero.tsx (85 lines, named export, no 'use client') and components/home/__tests__/home-hero.test.tsx. h1 "AI productivity for mission-critical work", primary CTA→/tools, secondary→/learn, trust indicators Aviation+Military. 3/3 tests pass. No barrel index.ts. home-client.tsx untouched. Commit: e653137.
- **Rebrand Shipped (2026-07-01, branch feature/mission-critical-rebrand)**: Site repositioned as practical AI productivity platform on the clear-communication foundation. Final copy (owner-amended mid-execution): hero "Use AI better at work", suite section "Productivity Tools" (6 peer tools incl. Phonetic Converter → /tools#converter anchor), bridge "Built on a Proven Communication Foundation", CTA "Ready to work better with AI?" → /tools. Homepage <title> keeps NATO keywords; /learn + /practice untouched; nav "Learn NATO". HomeHero in components/home/; .micro-label = sanctioned amber accent (CSS vars --signal-bg/--signal-text). SEO: monitor Search Console 4 weeks (H1 + features H2 both changed). Subagent-driven execution: 8 tasks, two-stage reviews, final review verdict ready-to-merge.
