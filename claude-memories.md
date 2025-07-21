# Claude Memories - Phonetic Alphabet Project

## Critical Lessons Learned

### 2025-01-21
- Next.js 14 App Router: Server Components by default, need 'use client' for interactivity
- Fixed: Event handlers require 'use client' directive on components using onClick
- Tailwind v4 incompatible with Next.js setup, downgraded to v3.4.0 for stability
- PostCSS config must use object syntax: `{ tailwindcss: {}, autoprefixer: {} }`
- Clear .next cache when encountering routes-manifest.json errors
- Use browser's speechSynthesis API instead of external audio files or APIs
- Always check if component needs 'use client' when adding event handlers