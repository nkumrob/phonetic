# Mission-Critical Rebrand Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reposition natophonetic.com as "the AI productivity suite for mission-critical work," with the Phonetic Converter as a peer tool and NATO content as the credibility pillar, per `docs/superpowers/specs/2026-07-01-mission-critical-rebrand-design.md`.

**Architecture:** Copy/presentation-layer change only — no API, prompt, or schema changes. The tool registry (`components/ai-tools/tool-registry.ts`) becomes the single source of truth for all six tool cards. The homepage hero is extracted to `components/home/home-hero.tsx` (keeps `home-client.tsx` under the 500-line cap) and sections reorder to: hero → suite grid → NATO credibility → verification. Visual direction B: existing palette, amber restricted to a "signal" accent + new uppercase micro-label style.

**Tech Stack:** Next.js 15 App Router, Tailwind (tokens in `lib/design/tokens.ts`), Jest + RTL (jsdom for components; `@jest-environment node` docblock for backend — not needed here), design classes from `app/premium-design.css`.

**Conventions that apply to every task:** kebab-case filenames; `'use client'` only where interactive; run tests with `npx jest <path> --runInBand --forceExit` (first cold run in this environment can take minutes — do not assume a hang before 5 minutes); commit after each task; never push.

---

### Task 1: Add Phonetic Converter to the tool registry + audience taglines

**Files:**
- Modify: `components/ai-tools/tool-registry.ts`
- Test: `components/ai-tools/__tests__/tool-registry.test.ts` (create)

- [ ] **Step 1: Write the failing test**

```ts
// components/ai-tools/__tests__/tool-registry.test.ts
import { AI_TOOLS } from '../tool-registry';

describe('tool registry', () => {
  it('contains all six suite tools', () => {
    expect(AI_TOOLS.map((t) => t.id)).toEqual([
      'phonetic-converter',
      'prompt-improver',
      'email-drafter',
      'summarizer',
      'meeting-actions',
      'output-checker',
    ]);
  });

  it('routes the phonetic converter to the tools page', () => {
    const phonetic = AI_TOOLS.find((t) => t.id === 'phonetic-converter');
    expect(phonetic?.href).toBe('/tools');
  });

  it('gives every tool a name, tagline, and href', () => {
    for (const tool of AI_TOOLS) {
      expect(tool.name.length).toBeGreaterThan(3);
      expect(tool.tagline.length).toBeGreaterThan(10);
      expect(tool.href.startsWith('/tools')).toBe(true);
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest components/ai-tools/__tests__/tool-registry.test.ts --runInBand --forceExit`
Expected: FAIL — received array has 5 entries, no `phonetic-converter`.

- [ ] **Step 3: Update the registry**

Replace the `AI_TOOLS` array in `components/ai-tools/tool-registry.ts` (keep the `AiToolMeta` interface unchanged):

```ts
export const AI_TOOLS: AiToolMeta[] = [
  {
    id: 'phonetic-converter',
    name: 'Phonetic Converter',
    tagline: 'Spell anything with zero ambiguity — the NATO alphabet, instantly',
    href: '/tools',
    emoji: '📡',
  },
  {
    id: 'prompt-improver',
    name: 'AI Prompt Improver',
    tagline: 'Turn a rough request into a precise, structured AI instruction',
    href: '/tools/prompt-improver',
    emoji: '✨',
  },
  {
    id: 'email-drafter',
    name: 'Email Drafter',
    tagline: 'Status updates, incident comms, and reports — drafted in seconds',
    href: '/tools/email-drafter',
    emoji: '✉️',
  },
  {
    id: 'summarizer',
    name: 'Document Summarizer',
    tagline: 'Long reports and briefings condensed into decision-ready takeaways',
    href: '/tools/summarizer',
    emoji: '📄',
  },
  {
    id: 'meeting-actions',
    name: 'Meeting Notes → Actions',
    tagline: 'Debriefs and meetings turned into decisions, owners, and deadlines',
    href: '/tools/meeting-actions',
    emoji: '📋',
  },
  {
    id: 'output-checker',
    name: 'AI Output Checker',
    tagline: 'Verify before you rely — flag unverified claims and weak reasoning',
    href: '/tools/output-checker',
    emoji: '🔍',
  },
];
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx jest components/ai-tools --runInBand --forceExit`
Expected: PASS (registry test + existing prompt-improver component suite; the grid renders from this array so no other test changes).

- [ ] **Step 5: Commit**

```bash
git add components/ai-tools/tool-registry.ts components/ai-tools/__tests__/tool-registry.test.ts
git commit -m "feat(rebrand): add phonetic converter as peer tool in registry, audience taglines"
```

---

### Task 2: Signal accent + micro-label style (Direction B)

**Files:**
- Modify: `app/premium-design.css` (append)

No behavior to unit-test (pure CSS); verified visually in Task 8's smoke test.

- [ ] **Step 1: Append the micro-label class**

Append to the end of `app/premium-design.css`:

```css
/* ── Mission-critical rebrand: signal micro-label ─────────────────── */
/* Uppercase letter-spaced badge; the ONLY sanctioned use of the amber/orange
   accent besides "New" chips — use sparingly, like a caution indicator. */
.micro-label {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  background: #fff3e6;
  color: #b4530a;
}
.dark .micro-label {
  background: rgba(180, 83, 10, 0.18);
  color: #f5a862;
}
```

- [ ] **Step 2: Commit**

```bash
git add app/premium-design.css
git commit -m "feat(rebrand): add signal micro-label style (direction B accent)"
```

---

### Task 3: Extract HomeHero with mission-critical copy

**Files:**
- Create: `components/home/home-hero.tsx`
- Test: `components/home/__tests__/home-hero.test.tsx` (create)

- [ ] **Step 1: Write the failing test**

```tsx
// components/home/__tests__/home-hero.test.tsx
import { render, screen } from '@testing-library/react';
import { HomeHero } from '../home-hero';

describe('HomeHero', () => {
  it('leads with the mission-critical positioning', () => {
    render(<HomeHero />);
    expect(
      screen.getByRole('heading', { level: 1, name: /AI productivity for mission-critical work/i })
    ).toBeInTheDocument();
  });

  it('routes the primary CTA to the tools and secondary to learn', () => {
    render(<HomeHero />);
    expect(screen.getByRole('link', { name: /open the tools/i })).toHaveAttribute('href', '/tools');
    expect(screen.getByRole('link', { name: /learn the alphabet/i })).toHaveAttribute('href', '/learn');
  });

  it('keeps the professional trust indicators', () => {
    render(<HomeHero />);
    expect(screen.getByText(/aviation/i)).toBeInTheDocument();
    expect(screen.getByText(/military/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest components/home --runInBand --forceExit`
Expected: FAIL — cannot find module `../home-hero`.

- [ ] **Step 3: Create the component**

`components/home/home-hero.tsx` — this is the existing hero block from `app/home-client.tsx` (lines ~30–94) with new copy. Keep the A–F letter visual card and layout classes exactly as they are in home-client today:

```tsx
import Link from 'next/link';

/** Homepage hero — mission-critical positioning (rebrand spec 2026-07-01). */
export function HomeHero() {
  return (
    <section className="py-12 md:py-16 lg:py-20 overflow-hidden relative">
      <div className="absolute inset-0 -z-10 bg-warmNeutral-50 dark:bg-warmNeutral-900" />

      <div className="container px-6 md:px-8 lg:px-4">
        <div className="grid lg:grid-cols-[1.2fr,1fr] gap-12 md:gap-16 lg:gap-20 items-center">
          <div className="space-y-6 md:space-y-8">
            <div className="text-center lg:text-left">
              <div className="micro-label animate-fade-in">For Mission-Critical Work</div>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1] animate-slide-up text-center lg:!text-left">
              AI productivity for mission-critical work
            </h1>

            <p
              className="text-body-lg text-secondary max-w-2xl mx-auto lg:mx-0 animate-slide-up text-center lg:!text-left"
              style={{ animationDelay: '100ms' }}
            >
              Draft comms, build briefs, extract action items, and verify AI output — tools built
              with the discipline of the professions that invented clear communication.
            </p>

            <div
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-slide-up"
              style={{ animationDelay: '200ms' }}
            >
              <Link
                href="/tools"
                className="btn btn-primary btn-xl whitespace-nowrap inline-flex items-center justify-center"
              >
                Open the Tools
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="ml-2">
                  <path
                    d="M7.5 5L12.5 10L7.5 15"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
              <Link
                href="/learn"
                className="btn btn-secondary btn-xl whitespace-nowrap inline-flex items-center justify-center"
              >
                Learn the Alphabet
              </Link>
            </div>

            <div
              className="pt-6 md:pt-8 animate-fade-in text-center lg:!text-left"
              style={{ animationDelay: '300ms' }}
            >
              <p className="text-xs font-bold text-tertiary uppercase tracking-widest mb-4">
                Built for the professions that can&apos;t afford miscommunication
              </p>
              <div className="flex flex-wrap items-center justify-center lg:!justify-start gap-4 md:gap-6">
                <span className="text-sm font-semibold text-secondary">✈️ Aviation</span>
                <span className="text-sm font-semibold text-secondary">🚢 Maritime</span>
                <span className="text-sm font-semibold text-secondary">🚔 Emergency</span>
                <span className="text-sm font-semibold text-secondary">📡 Military</span>
              </div>
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div className="absolute inset-0 bg-coolBlue-100 dark:bg-coolBlue-900/20 rounded-3xl transform rotate-3" />
            <div className="relative bg-white dark:bg-warmNeutral-800 rounded-3xl p-8 lg:p-12 shadow-2xl">
              <div className="grid grid-cols-3 gap-4 lg:gap-6">
                {['A-Alpha', 'B-Bravo', 'C-Charlie', 'D-Delta', 'E-Echo', 'F-Foxtrot'].map(
                  (item) => (
                    <div
                      key={item}
                      className="text-center p-4 lg:p-6 rounded-xl bg-warmNeutral-50 dark:bg-warmNeutral-900 hover:shadow-md transition-all duration-200"
                    >
                      <div className="text-3xl lg:text-4xl font-black text-coolBlue-500 mb-2">
                        {item.split('-')[0]}
                      </div>
                      <div className="text-xs lg:text-sm font-semibold text-secondary">
                        {item.split('-')[1]}
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
```

Note: no `'use client'` needed — no hooks or handlers.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest components/home --runInBand --forceExit`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add components/home
git commit -m "feat(rebrand): HomeHero component with mission-critical positioning"
```

---

### Task 4: Rework HomeAiSection into the suite grid + verification blurb

**Files:**
- Modify: `components/ai-tools/home-ai-section.tsx`

The section already renders from `AI_TOOLS` (now six tools after Task 1). Update copy and add the verification framing; grid columns change from `lg:grid-cols-5` to `lg:grid-cols-3`.

- [ ] **Step 1: Update the component**

Replace the body of `components/ai-tools/home-ai-section.tsx`:

```tsx
import Link from 'next/link';
import { ShieldCheck, Sparkles } from 'lucide-react';
import { AI_TOOLS } from './tool-registry';

/** Homepage suite grid — all six tools as peers (mission-critical rebrand). */
export function HomeAiSection() {
  return (
    <section className="py-16 md:py-20 bg-gradient-to-br from-warmAmber-50/50 to-coolBlue-50/50 dark:from-warmAmber-900/10 dark:to-coolBlue-900/10">
      <div className="container px-6 md:px-8 lg:px-4">
        <div className="text-center mb-10 md:mb-12">
          <h2 className="h2 mb-6">The Toolkit</h2>
          <p className="text-body-lg text-secondary max-w-3xl mx-auto leading-relaxed">
            Six tools, one standard: say it once, say it right. From spelling a call sign over a
            bad connection to briefing a 40-page report — and verifying what AI tells you before
            you act on it.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto mb-10">
          {AI_TOOLS.map((tool) => (
            <Link
              key={tool.id}
              href={tool.href}
              className="group p-5 rounded-xl bg-white dark:bg-warmNeutral-800 border border-warmNeutral-200 dark:border-warmNeutral-700 hover:border-warmAmber-300 dark:hover:border-warmAmber-700 hover:shadow-md transition-all"
            >
              <div className="text-3xl mb-3">{tool.emoji}</div>
              <h3 className="font-bold text-warmNeutral-800 dark:text-warmNeutral-100 group-hover:text-warmAmber-700 dark:group-hover:text-warmAmber-400 transition-colors mb-1">
                {tool.name}
              </h3>
              <p className="text-sm text-secondary">{tool.tagline}</p>
            </Link>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-center">
          <p className="flex items-center gap-2 text-sm text-secondary max-w-xl">
            <ShieldCheck size={18} className="text-coolBlue-500 flex-shrink-0" />
            Built for verification cultures: these tools handle the paperwork side of
            mission-critical work — reports, briefs, and comms — never operational decisions.
          </p>
          <Link href="/tools" className="btn btn-primary inline-flex items-center gap-2">
            <Sparkles size={18} />
            Open the Tools
          </Link>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Run the component suites**

Run: `npx jest components/ai-tools --runInBand --forceExit`
Expected: PASS (no test asserts the old copy).

- [ ] **Step 3: Commit**

```bash
git add components/ai-tools/home-ai-section.tsx
git commit -m "feat(rebrand): homepage suite grid with six peer tools + verification framing"
```

---

### Task 5: Homepage reorder — hero swap, suite grid to slot 2, NATO as credibility

**Files:**
- Modify: `app/home-client.tsx`

- [ ] **Step 1: Swap in HomeHero and move HomeAiSection**

In `app/home-client.tsx`:

1. Add import: `import { HomeHero } from '@/components/home/home-hero';`
2. Replace the entire hero `<section>…</section>` block (the one starting with the comment `{/* Hero Section - Asymmetric Split Layout */}` down to its closing `</section>` before `{/* Features Section with Cards */}`) with:

```tsx
      {/* Hero — mission-critical positioning */}
      <HomeHero />

      {/* The suite grid — all six tools */}
      <HomeAiSection />
```

3. Delete the old `<HomeAiSection />` line further down (it currently sits between the Features section and the Statistics section, under the comment `{/* AI Productivity Tools Section */}` — remove the comment and the line).
4. Update the Features section heading (currently `What Is the NATO Phonetic Alphabet?`) to frame NATO as the credibility pillar. Replace the heading + intro paragraph with:

```tsx
          <h2 className="h2 mb-6">Built on the Original Clear-Communication Protocol</h2>
          <p className="text-body-lg text-secondary max-w-3xl mx-auto leading-relaxed">
            We started with the NATO phonetic alphabet — the standard that lets pilots, sailors,
            and dispatchers communicate with zero ambiguity. Learn it, practice it, and use the
            same discipline in every tool above.
          </p>
```

Everything else (Learn/Practice/Tools cards, statistics, translator, FAQ, testimonials) stays in place.

- [ ] **Step 2: Verify the line count stays under the cap**

Run: `wc -l app/home-client.tsx`
Expected: fewer than 500 lines (the hero extraction removes ~65 lines and adds 2).

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: exit 0. (Ignore any pre-existing `.next/types` noise only if unrelated to these files; there should be none.)

- [ ] **Step 4: Commit**

```bash
git add app/home-client.tsx
git commit -m "feat(rebrand): homepage flip — hero, suite grid slot 2, NATO as credibility pillar"
```

---

### Task 6: /tools page — one product, suite grid on top

**Files:**
- Modify: `app/tools/tools-client.tsx`
- Modify: `app/tools/page.tsx` (metadata copy)

- [ ] **Step 1: Update the tools page hero copy and section order**

In `app/tools/tools-client.tsx`:

1. Replace the hero copy (h1 `Phonetic Tools` and its subtitle) with:

```tsx
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-headlines text-center mb-4">
          The Toolkit
        </h1>
        <p className="text-lg sm:text-xl text-secondary text-center max-w-2xl mx-auto">
          AI productivity tools for mission-critical work — plus the phonetic converter that
          started it all
        </p>
```

2. Move the `{/* AI Tools Section */}` block (the `<section className="mb-16"><AiToolsGrid /></section>`) so it is the FIRST section inside `<div className="container max-w-6xl mx-auto px-4">`, above the Text Converter section.

- [ ] **Step 2: Update /tools metadata**

In `app/tools/page.tsx`, change the `baseGenerateMetadata` call to:

```tsx
export const metadata: Metadata = baseGenerateMetadata(
  'Tools for Mission-Critical Work — Phonetic Converter & AI Suite',
  'NATO phonetic converter, AI prompt improver, email drafter, summarizer, and output checker — productivity tools for aviation, military, maritime, and emergency professionals',
  '/tools'
);
```

- [ ] **Step 3: Run the tools-related suites and typecheck**

Run: `npx jest components/ai-tools --runInBand --forceExit && npx tsc --noEmit`
Expected: PASS / exit 0.

- [ ] **Step 4: Commit**

```bash
git add app/tools/tools-client.tsx app/tools/page.tsx
git commit -m "feat(rebrand): tools page as one product surface, suite grid first"
```

---

### Task 7: Tool-page copy pass + nav label + homepage metadata

**Files:**
- Modify: `app/tools/summarizer/page.tsx`, `app/tools/email-drafter/page.tsx`, `app/tools/meeting-actions/page.tsx`, `app/tools/output-checker/page.tsx`
- Modify: `components/layout/simple-header.tsx:22-26`
- Modify: `lib/seo/metadata.ts:6-7`

- [ ] **Step 1: Mission-critical placeholders and descriptions on tool pages**

Apply these exact prop changes (only the listed props change; everything else stays):

`app/tools/summarizer/page.tsx` — in `<AiToolForm>`: `placeholder="Paste an ops report, policy, incident log, or long briefing (up to 12,000 characters)…"`. In `<AiToolPageShell>` description, replace with: `"Paste a report, policy, or long thread and get a TL;DR, key points ordered by importance, and action items — faithful to the source, nothing added."`

`app/tools/email-drafter/page.tsx` — placeholder: `"e.g. tell the crew the 0900 departure slipped to 1130, weather hold, apologize for short notice, ask leads to confirm revised checklists by 0800"`.

`app/tools/meeting-actions/page.tsx` — placeholder: `"Paste debrief notes, shift-handoff notes, or a transcript excerpt (up to 12,000 characters)…"`.

`app/tools/output-checker/page.tsx` — description: `"Before you act on an AI answer, get a reliability read: which specific claims to verify, signs of weak reasoning or overconfidence, and what context is missing. Built for verification cultures."`

- [ ] **Step 2: Nav label**

In `components/layout/simple-header.tsx`, change the navigation array entry `{ name: 'Learn', href: '/learn', icon: '📚' }` to `{ name: 'Learn NATO', href: '/learn', icon: '📚' }`. (Tools and Practice labels stay.)

- [ ] **Step 3: Homepage metadata — keep NATO keywords, add the suite**

In `lib/seo/metadata.ts`, replace `siteConfig.title` and `description`:

```ts
  title: 'natophonetic.com | NATO Phonetic Alphabet (A to Z) & AI Tools for Mission-Critical Work',
  description:
    'Learn the NATO phonetic alphabet — A–Z list, pronunciation, printable PDF, interactive translator — plus AI productivity tools for mission-critical work: draft comms, build briefs, verify AI output. Built for pilots, military, maritime, dispatch, and emergency professionals.',
```

Keep the `keywords` array unchanged.

- [ ] **Step 4: Typecheck and run all component suites**

Run: `npx tsc --noEmit && npx jest components lib/ai lib/db lib/services/__tests__/ai-tool-service.test.ts app/api/ai --runInBand --forceExit`
Expected: exit 0 / all suites PASS.

- [ ] **Step 5: Commit**

```bash
git add app/tools components/layout/simple-header.tsx lib/seo/metadata.ts
git commit -m "feat(rebrand): tool-page audience copy, Learn NATO nav label, homepage title strategy"
```

---

### Task 8: Full verification, memories, wrap-up

**Files:**
- Modify: `claude-memories.md` (append)

- [ ] **Step 1: Full test suite**

Run: `npx jest --runInBand --forceExit`
Expected: all suites PASS (baseline was 20 suites / 124+ tests before this plan; plus the new registry and home-hero suites).

- [ ] **Step 2: Lint the changed files**

Run: `npx eslint components/home components/ai-tools app/home-client.tsx app/tools lib/seo/metadata.ts components/layout/simple-header.tsx`
Expected: 0 errors. (Full `next lint` hangs in this environment; scoped eslint is the accepted substitute.)

- [ ] **Step 3: Live smoke test**

With the dev server running (`npm run dev` if not):

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/          # 200
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/tools     # 200
curl -s http://localhost:3000/ | grep -c "mission-critical"              # >= 1
```

Then visually confirm at http://localhost:3000: hero reads "AI productivity for mission-critical work"; suite grid shows six cards including Phonetic Converter; NATO credibility section follows; dark mode looks right.

- [ ] **Step 4: Update memories and commit**

Append to `claude-memories.md`:

```markdown
- **Mission-Critical Rebrand Shipped (2026-07-01)**: Site repositioned as "AI productivity suite for mission-critical work" (aviation/military/maritime/dispatch/EMS). Homepage: HomeHero (components/home/) → suite grid (6 tools incl. phonetic converter, from tool-registry.ts) → NATO credibility section. Homepage <title> keeps NATO keywords (SEO); /learn + /practice untouched. Amber = signal accent only (.micro-label class). Spec: docs/superpowers/specs/2026-07-01-mission-critical-rebrand-design.md. Monitor Search Console 4 weeks.
```

```bash
git add claude-memories.md
git commit -m "docs: record mission-critical rebrand in memories"
rm -rf .next/cache
afplay /Users/robertappiah/Downloads/beep.aiff
```

---

## Self-review notes

- **Spec coverage:** positioning/voice → Tasks 3–7 copy; homepage order → Task 5; six-tool grid → Tasks 1, 4; SEO protection → Task 7 Step 3 (title keeps NATO keywords), /learn and /practice untouched (no task modifies them); nav labels → Task 7 Step 2; Direction B accents → Task 2 (+ grid classes in Task 4); tools-page unification → Task 6; success criteria → Task 8.
- **Out of scope confirmed:** no prompt, API, schema, or sitemap changes (tool URLs unchanged).
- **Type consistency:** `HomeHero` (Task 3) matches import in Task 5; registry `id: 'phonetic-converter'` (Task 1) not referenced by API code (registry is display-only — the API's `isKnownTool` list is separate and unchanged, so `/api/ai/phonetic-converter` correctly 404s; the card links to `/tools`, never the API).
