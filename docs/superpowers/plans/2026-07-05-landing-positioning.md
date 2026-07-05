# Outcome-Led Homepage with Two Doors Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the homepage as an outcome-led umbrella (hero + two equal entry doors: NATO Phonetic / AI Work Tools) per the approved spec at `docs/superpowers/specs/2026-07-05-landing-positioning-design.md`.

**Architecture:** Three small server components (`HomeHero` rewrite, `TwoDoors` new, `StandardSection` new) composed by `app/home-client.tsx`, which loses its NATO features grid and gains the new section order. One heading change in `HomeAiSection`. No route, API, nav, or footer changes.

**Tech Stack:** Next.js 15 App Router, TypeScript, Tailwind (project's warmNeutral/coolBlue/warmAmber tokens, `.micro-label` class), Jest + React Testing Library.

**Conventions that apply to every task:**
- Jest must run with `--runInBand` (parallel workers hang here). First cold run can take 3–5 min of silence — that is normal, do not kill it.
- No em dashes in user-facing copy. No badges. Files ≤ 500 lines.
- The homepage `<title>` must remain byte-identical: `natophonetic.com | NATO Phonetic Alphabet (A to Z) & AI Tools for Mission-Critical Communication` (defined in `lib/seo/metadata.ts` — no task touches that file; verification confirms it).
- Branch: work on `feature/ia-navigation-retention` (current) unless the owner says otherwise.

---

### Task 1: Rewrite HomeHero (outcome-led, no CTAs)

**Files:**
- Modify: `components/home/home-hero.tsx` (full rewrite, currently 95 lines)
- Modify: `components/home/__tests__/home-hero.test.tsx` (full rewrite)

The hero drops its H1 keyword, CTA buttons, trust-indicator row, and alphabet preview panel. The doors (Task 2) become the CTAs; the alphabet preview moves to `StandardSection` (Task 3).

- [ ] **Step 1: Replace the test file with failing tests**

Replace the entire contents of `components/home/__tests__/home-hero.test.tsx` with:

```tsx
import { render, screen } from '@testing-library/react';
import { HomeHero } from '../home-hero';

describe('HomeHero', () => {
  it('leads with the outcome positioning', () => {
    render(<HomeHero />);
    expect(
      screen.getByRole('heading', { level: 1, name: /productivity for mission-critical work/i })
    ).toBeInTheDocument();
  });

  it('sells split-second decisions in the subhead', () => {
    render(<HomeHero />);
    expect(
      screen.getByText(/split-second decisions, precise communication, and dependable/i)
    ).toBeInTheDocument();
  });

  it('shows the brand eyebrow', () => {
    render(<HomeHero />);
    expect(screen.getByText(/natophonetic/i)).toBeInTheDocument();
  });

  it('has no CTA links; the doors below are the CTAs', () => {
    render(<HomeHero />);
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx jest components/home/__tests__/home-hero.test.tsx --runInBand`
Expected: FAIL — "Unable to find an accessible element with the role heading … /productivity for mission-critical work/i" (the old NATO H1 renders instead), and the no-links test fails because the old hero has two links.

- [ ] **Step 3: Rewrite the component**

Replace the entire contents of `components/home/home-hero.tsx` with:

```tsx
/** Homepage hero: outcome-led umbrella positioning; the doors below are the CTAs (2026-07-05). */
export function HomeHero() {
  return (
    <section className="py-12 md:py-16 lg:py-20 relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-warmNeutral-50 dark:bg-warmNeutral-900" />

      <div className="container px-6 md:px-8 lg:px-4 text-center">
        <p className="text-xs font-bold text-tertiary uppercase tracking-widest mb-4 animate-fade-in">
          Natophonetic
        </p>

        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1] animate-slide-up mb-6">
          Productivity for mission-critical work
        </h1>

        <p
          className="text-body-lg text-secondary max-w-2xl mx-auto animate-slide-up"
          style={{ animationDelay: '100ms' }}
        >
          Professional AI tools for split-second decisions, precise communication, and dependable
          everyday work.
        </p>
      </div>
    </section>
  );
}
```

Notes: do NOT use `.micro-label` — that class was removed from `app/premium-design.css` in `fd6504e` ("no badges"); the inline utility stack above is the live eyebrow idiom (same pattern the old hero used for its "Trusted by professionals" label). Keep this a server component — no `'use client'`.

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx jest components/home/__tests__/home-hero.test.tsx --runInBand`
Expected: PASS (4 tests)

- [ ] **Step 5: Commit (includes the spec + this plan on their first commit)**

```bash
git add components/home/home-hero.tsx components/home/__tests__/home-hero.test.tsx docs/superpowers/specs/2026-07-05-landing-positioning-design.md docs/superpowers/plans/2026-07-05-landing-positioning.md
git commit -m "feat(brand): outcome-led hero, doors become the CTAs (landing positioning spec)"
```

---

### Task 2: TwoDoors component

**Files:**
- Create: `components/home/two-doors.tsx`
- Create: `components/home/__tests__/two-doors.test.tsx`

Two equal self-select cards directly under the hero. NATO door first in DOM (stacks first on mobile — majority arrival intent).

- [ ] **Step 1: Write the failing test**

Create `components/home/__tests__/two-doors.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { TwoDoors } from '../two-doors';

describe('TwoDoors', () => {
  it('renders both outcome headings', () => {
    render(<TwoDoors />);
    expect(
      screen.getByRole('heading', { level: 2, name: /split-second clarity/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: /decisions, faster/i })
    ).toBeInTheDocument();
  });

  it('keeps the NATO door first in the DOM (mobile stacking order)', () => {
    render(<TwoDoors />);
    const nato = screen.getByRole('heading', { level: 2, name: /split-second clarity/i });
    const ai = screen.getByRole('heading', { level: 2, name: /decisions, faster/i });
    expect(nato.compareDocumentPosition(ai) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('keeps the NATO keyword as the door label', () => {
    render(<TwoDoors />);
    expect(screen.getByText('NATO Phonetic Alphabet')).toBeInTheDocument();
  });

  it('routes all NATO entry points correctly', () => {
    render(<TwoDoors />);
    expect(screen.getByRole('link', { name: /convert text/i })).toHaveAttribute(
      'href',
      '/tools/phonetic-converter'
    );
    const chart = screen.getByRole('link', { name: /chart pdf/i });
    expect(chart).toHaveAttribute('href', '/api/pdf');
    expect(chart).toHaveAttribute('download');
    expect(screen.getByRole('link', { name: /learn a to z/i })).toHaveAttribute('href', '/learn');
  });

  it('routes the AI door to the tools hub', () => {
    render(<TwoDoors />);
    expect(screen.getByRole('link', { name: /open the ai tools/i })).toHaveAttribute(
      'href',
      '/tools'
    );
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx jest components/home/__tests__/two-doors.test.tsx --runInBand`
Expected: FAIL — "Cannot find module '../two-doors'"

- [ ] **Step 3: Write the component**

Create `components/home/two-doors.tsx`:

```tsx
import Link from 'next/link';

const LINK_CLASS =
  'text-sm font-semibold text-coolBlue-500 hover:text-coolBlue-600 dark:text-coolBlue-400 dark:hover:text-coolBlue-300';

/** Two equal entry doors: NATO phonetic and AI work tools (landing positioning, 2026-07-05). */
export function TwoDoors() {
  return (
    <section aria-label="Start here" className="pb-16 md:pb-20">
      <div className="container px-6 md:px-8 lg:px-4">
        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          <div className="p-6 md:p-8 rounded-2xl bg-warmAmber-50/60 dark:bg-warmAmber-900/10 border border-warmAmber-200 dark:border-warmAmber-800/40">
            <p className="text-xs font-bold text-tertiary uppercase tracking-widest mb-3">
              NATO Phonetic Alphabet
            </p>
            <h2 className="text-2xl font-bold mb-3">Split-second clarity</h2>
            <p className="text-body text-secondary mb-6 leading-relaxed">
              The universal standard for communicating letters and codes without error over radio,
              phone, or dispatch.
            </p>
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              <Link href="/tools/phonetic-converter" className={LINK_CLASS}>
                Convert text →
              </Link>
              <a href="/api/pdf" download="nato-phonetic-alphabet-chart.pdf" className={LINK_CLASS}>
                Chart PDF →
              </a>
              <Link href="/learn" className={LINK_CLASS}>
                Learn A to Z →
              </Link>
            </div>
          </div>

          <div className="p-6 md:p-8 rounded-2xl bg-coolBlue-50/60 dark:bg-coolBlue-900/10 border border-coolBlue-200 dark:border-coolBlue-800/40">
            <p className="text-xs font-bold text-tertiary uppercase tracking-widest mb-3">
              AI Work Tools
            </p>
            <h2 className="text-2xl font-bold mb-3">Decisions, faster</h2>
            <p className="text-body text-secondary mb-6 leading-relaxed">
              Draft, summarize, and review with AI to a professional standard. Five tools, no
              sign-up.
            </p>
            <Link href="/tools" className={LINK_CLASS}>
              Open the AI tools →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx jest components/home/__tests__/two-doors.test.tsx --runInBand`
Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add components/home/two-doors.tsx components/home/__tests__/two-doors.test.tsx
git commit -m "feat(brand): two-door entry cards (NATO / AI work tools)"
```

---

### Task 3: StandardSection (the one compact NATO block)

**Files:**
- Create: `components/home/standard-section.tsx`
- Create: `components/home/__tests__/standard-section.test.tsx`

The single keyword-rich NATO section: provenance framing, A–F preview tiles, three entry links. This is the homepage's on-page SEO anchor.

- [ ] **Step 1: Write the failing test**

Create `components/home/__tests__/standard-section.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { StandardSection } from '../standard-section';

describe('StandardSection', () => {
  it('keeps the NATO keyword in the H2', () => {
    render(<StandardSection />);
    expect(
      screen.getByRole('heading', { level: 2, name: /NATO Phonetic Alphabet/i })
    ).toBeInTheDocument();
  });

  it('renders the six-letter chart preview', () => {
    render(<StandardSection />);
    for (const word of ['Alpha', 'Bravo', 'Charlie', 'Delta', 'Echo', 'Foxtrot']) {
      expect(screen.getByText(word)).toBeInTheDocument();
    }
  });

  it('renders the three entry links', () => {
    render(<StandardSection />);
    expect(screen.getByRole('link', { name: /convert text/i })).toHaveAttribute(
      'href',
      '/tools/phonetic-converter'
    );
    expect(screen.getByRole('link', { name: /download the chart/i })).toHaveAttribute(
      'href',
      '/api/pdf'
    );
    expect(screen.getByRole('link', { name: /learn the full alphabet/i })).toHaveAttribute(
      'href',
      '/learn'
    );
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx jest components/home/__tests__/standard-section.test.tsx --runInBand`
Expected: FAIL — "Cannot find module '../standard-section'"

- [ ] **Step 3: Write the component**

Create `components/home/standard-section.tsx`:

```tsx
import Link from 'next/link';

const PREVIEW: Array<[string, string]> = [
  ['A', 'Alpha'],
  ['B', 'Bravo'],
  ['C', 'Charlie'],
  ['D', 'Delta'],
  ['E', 'Echo'],
  ['F', 'Foxtrot'],
];

const LINK_CLASS = 'text-sm font-semibold text-coolBlue-500 hover:text-coolBlue-600';

/** Compact keyword-rich NATO provenance section; the single NATO block on the homepage (2026-07-05). */
export function StandardSection() {
  return (
    <section className="py-16 md:py-20 bg-warmNeutral-50 dark:bg-warmNeutral-900">
      <div className="container px-6 md:px-8 lg:px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="h2 mb-6">Built on the NATO Phonetic Alphabet</h2>
          <p className="text-body-lg text-secondary leading-relaxed mb-10">
            The NATO phonetic alphabet assigns a code word to each of the 26 letters, Alpha through
            Zulu, so critical information is heard correctly the first time. Aviation, maritime,
            and emergency professionals rely on it worldwide. Our AI tools bring the same
            discipline to everyday work.
          </p>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-10">
            {PREVIEW.map(([letter, word]) => (
              <div
                key={letter}
                className="p-3 rounded-xl bg-white dark:bg-warmNeutral-800 border border-warmNeutral-200 dark:border-warmNeutral-700"
              >
                <div className="text-2xl font-black text-coolBlue-500">{letter}</div>
                <div className="text-xs font-semibold text-secondary">{word}</div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            <Link href="/tools/phonetic-converter" className={LINK_CLASS}>
              Convert text →
            </Link>
            <a href="/api/pdf" download="nato-phonetic-alphabet-chart.pdf" className={LINK_CLASS}>
              Download the chart →
            </a>
            <Link href="/learn" className={LINK_CLASS}>
              Learn the full alphabet →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx jest components/home/__tests__/standard-section.test.tsx --runInBand`
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add components/home/standard-section.tsx components/home/__tests__/standard-section.test.tsx
git commit -m "feat(brand): compact NATO provenance section (homepage SEO anchor)"
```

---

### Task 4: Homepage assembly (section order + HomeAiSection heading + features grid removal)

**Files:**
- Create: `components/home/__tests__/home-page-structure.test.tsx`
- Modify: `app/home-client.tsx` (full rewrite; 204 → ~110 lines)
- Modify: `components/ai-tools/home-ai-section.tsx:11` (heading only)

- [ ] **Step 1: Write the failing integration test**

Create `components/home/__tests__/home-page-structure.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import HomeClient from '@/app/home-client';

describe('HomeClient structure', () => {
  it('renders the approved sections in order', () => {
    render(<HomeClient />);
    const headings = screen.getAllByRole('heading').map((h) => h.textContent ?? '');
    const expectedOrder = [
      'Productivity for mission-critical work',
      'Split-second clarity',
      'Decisions, faster',
      'Made for High-Stakes Work',
      'Hours of work in minutes',
      'Built on the NATO Phonetic Alphabet',
      'Precision in every deliverable',
    ];
    const positions = expectedOrder.map((t) =>
      headings.findIndex((h) => h.includes(t))
    );
    positions.forEach((p, i) => {
      expect(p).toBeGreaterThanOrEqual(0); // heading exists (i = expectedOrder index)
      if (i > 0) expect(p).toBeGreaterThan(positions[i - 1]); // and in order
    });
  });

  it('no longer renders the old NATO features grid', () => {
    render(<HomeClient />);
    expect(screen.queryByText(/What Is the NATO Phonetic Alphabet\?/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Interactive Learning/i)).not.toBeInTheDocument();
  });

  it('routes the closing CTA buttons', () => {
    render(<HomeClient />);
    // "Open the Tools" appears twice (HomeAiSection button + closing CTA) — both must hit /tools.
    const toolsLinks = screen.getAllByRole('link', { name: /open the tools/i });
    expect(toolsLinks.length).toBeGreaterThanOrEqual(1);
    toolsLinks.forEach((l) => expect(l).toHaveAttribute('href', '/tools'));
    expect(screen.getByRole('link', { name: /learn the alphabet/i })).toHaveAttribute(
      'href',
      '/learn'
    );
  });
});
```

Note: `next/dynamic` components (Famewall, TestimonialsGrid) render their loading placeholders in jsdom — that is fine, no headings are asserted from them. The testimonials H2 "What Our Users Say" sits between "Built on the NATO Phonetic Alphabet" and "Precision in every deliverable"; the order check tolerates headings between the expected ones.

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx jest components/home/__tests__/home-page-structure.test.tsx --runInBand`
Expected: FAIL — "Split-second clarity" not found (TwoDoors not yet mounted), old features grid still present.

- [ ] **Step 3: Change the HomeAiSection heading**

In `components/ai-tools/home-ai-section.tsx` line 11, change:

```tsx
<h2 className="h2 mb-6">AI Tools for Mission-Critical Communication</h2>
```

to:

```tsx
<h2 className="h2 mb-6">Hours of work in minutes</h2>
```

Leave the intro paragraph and everything else untouched.

- [ ] **Step 4: Rewrite home-client.tsx**

Replace the entire contents of `app/home-client.tsx` with:

```tsx
'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { HomeAiSection } from '@/components/ai-tools/home-ai-section';
import { HomeHero } from '@/components/home/home-hero';
import { TwoDoors } from '@/components/home/two-doors';
import { BenefitsSection } from '@/components/home/benefits-section';
import { StandardSection } from '@/components/home/standard-section';

const FamewallWidget = dynamic(() => import('@/components/famewall').then(mod => ({ default: mod.FamewallWidget })), {
  loading: () => <div className="h-96 animate-pulse bg-warmNeutral-100 dark:bg-warmNeutral-800 rounded-xl" />,
  ssr: false,
});

const TestimonialsGrid = dynamic(() => import('@/components/testimonials').then(mod => ({ default: mod.TestimonialsGrid })), {
  loading: () => <div className="h-96 animate-pulse bg-warmNeutral-100 dark:bg-warmNeutral-800 rounded-xl" />,
  ssr: false,
});

export default function HomeClient() {
  return (
    <>
      {/* Outcome-led umbrella hero; the doors below are the CTAs */}
      <HomeHero />

      {/* Two equal entry doors: NATO phonetic | AI work tools */}
      <TwoDoors />

      {/* Outcome benefits */}
      <BenefitsSection />

      {/* AI tools showcase (cross-sell) */}
      <HomeAiSection />

      {/* The one compact keyword-rich NATO section */}
      <StandardSection />

      {/* Testimonials Section */}
      <section className="py-16 md:py-20 bg-warmNeutral-50 dark:bg-warmNeutral-900">
        <div className="container px-6 md:px-8 lg:px-4">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="h2 mb-6">What Our Users Say</h2>
            <p className="text-body-lg text-secondary max-w-3xl mx-auto leading-relaxed">
              Join thousands of professionals who communicate clearly, with people and with AI
            </p>
          </div>

          {/* Hardcoded Testimonials */}
          <div className="max-w-7xl mx-auto mb-16">
            <TestimonialsGrid />
          </div>

          {/* Divider */}
          <div className="max-w-5xl mx-auto mb-12">
            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-warmNeutral-200 dark:bg-warmNeutral-700"></div>
              <p className="text-sm font-semibold text-tertiary uppercase tracking-wider">
                Share Your Experience
              </p>
              <div className="flex-1 h-px bg-warmNeutral-200 dark:bg-warmNeutral-700"></div>
            </div>
          </div>

          {/* Famewall Widget - New Reviews */}
          <div className="max-w-5xl mx-auto">
            <FamewallWidget />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20 bg-coolBlue-50 dark:bg-coolBlue-900/10">
        <div className="container px-6 md:px-8 lg:px-4 text-center">
          <h2 className="h2 mb-6">Precision in every deliverable</h2>
          <p className="text-body-lg text-secondary max-w-2xl mx-auto mb-10 leading-relaxed">
            Free professional tools for clear communication and dependable AI output. No sign-up
            required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/tools" className="btn btn-primary btn-xl inline-flex items-center justify-center">
              Open the Tools
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="ml-2" aria-hidden="true">
                <path d="M9 6L15 12L9 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
            <Link href="/learn" className="btn btn-secondary btn-xl inline-flex items-center justify-center">
              Learn the Alphabet
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
```

- [ ] **Step 5: Run the integration test to verify it passes**

Run: `npx jest components/home/__tests__/home-page-structure.test.tsx --runInBand`
Expected: PASS (3 tests)

- [ ] **Step 6: Commit**

```bash
git add app/home-client.tsx components/ai-tools/home-ai-section.tsx components/home/__tests__/home-page-structure.test.tsx
git commit -m "feat(brand): assemble two-door homepage, retire NATO features grid"
```

---

### Task 5: Full verification, live checks, memory update

**Files:**
- Modify: `claude-memories.md` (append one entry)

- [ ] **Step 1: Typecheck and full test suite**

Run: `npx tsc --noEmit`
Expected: no output (0 errors)

Run: `npx jest --runInBand`
Expected: all suites pass (existing 55 AI tests + home suites; zero failures). Reminder: cold run may be silent for minutes.

- [ ] **Step 2: Live checks against the dev server**

```bash
rm -rf .next && npm run dev &
sleep 15
curl -s http://localhost:3000 | grep -o '<title>[^<]*</title>'
```

Expected title (byte-identical, `&` HTML-encoded):
`<title>natophonetic.com | NATO Phonetic Alphabet (A to Z) &amp; AI Tools for Mission-Critical Communication</title>`

```bash
curl -s http://localhost:3000 | grep -c 'href="/tools/phonetic-converter"'
curl -s http://localhost:3000 | grep -c 'href="/api/pdf"'
curl -s http://localhost:3000 | grep -o 'Productivity for mission-critical work' | head -1
curl -s http://localhost:3000 | grep -o 'Built on the NATO Phonetic Alphabet' | head -1
```

Expected: converter href count ≥ 2 (door + standard section), pdf href count ≥ 2, both grep -o lines print the phrase. Then stop the dev server.

- [ ] **Step 3: Update claude-memories.md**

Append under a new heading:

```markdown
### 2026-07-05 - Landing Positioning: Outcome-Led Two-Door Homepage
- **Homepage restructured (spec docs/superpowers/specs/2026-07-05-landing-positioning-design.md)**: outcome hero ("Productivity for mission-critical work", no CTAs) → TwoDoors (NATO "Split-second clarity" / AI "Decisions, faster") → BenefitsSection → HomeAiSection (H2 now "Hours of work in minutes") → StandardSection (the ONE keyword-rich NATO block) → testimonials → "Precision in every deliverable" CTA. NATO features grid deleted; destinations remain via door/nav/footer.
- **SEO guardrails**: title tag byte-unchanged; keyword in door label + StandardSection H2/body; watch Search Console 4 weeks; pre-agreed H1 rollback documented in spec.
- **Copy rules**: outcome-led professional register; never position AI output as inherently trustworthy; no em dashes.
```

- [ ] **Step 4: Clear Next.js cache and final commit**

```bash
rm -rf .next
git add claude-memories.md
git commit -m "docs: record landing positioning ship + SEO guardrails"
afplay /Users/robertappiah/Downloads/beep.aiff
```

---

## Post-ship (owner action, not a code task)

Monitor Google Search Console weekly for 4 weeks. If homepage impressions for "nato phonetic alphabet" queries drop materially, apply the pre-agreed rollback from the spec: H1 becomes `Split-second clarity: the NATO phonetic alphabet and mission-critical AI tools` (structure unchanged).
