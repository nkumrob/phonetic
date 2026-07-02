# IA, Navigation, Retention & Homepage Slimming Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Reorganize the site per `docs/superpowers/specs/2026-07-01-ia-navigation-retention-design.md`: `/tools` becomes a pure hub, the phonetic converter gets a dedicated page, real dropdown menus, three localStorage retention features, and a slimmed AI-first homepage with deep NATO content relocated (never deleted).

**Architecture:** Presentation + client-side-storage only; zero API/prompt/schema changes. The tool registry gains a `category` field and drives the hub, nav dropdowns, and footer. New `lib/client/` modules own localStorage logic (SSR-guarded); components stay presentational. The ~300-line `InlineTextConverter` MOVES byte-faithfully (speech logic has a regression history — do not rewrite it).

**Conventions for every task:** kebab-case files; `--runInBand --forceExit` on all jest runs; jest cold start can take 2–5 minutes silently — wait; component tests are jsdom (default), pure-lib tests may use node docblock ONLY if they don't touch localStorage (localStorage mock lives in the jsdom setup); commit per task; never push; every file <500 lines.

---

### Task 1: Registry categories + converter page href

**Files:** Modify `components/ai-tools/tool-registry.ts`, `components/ai-tools/__tests__/tool-registry.test.ts`

- [ ] **Step 1: Extend the test file** — replace the href test and add a category test:

```ts
  it('routes the phonetic converter to its dedicated page', () => {
    const phonetic = AI_TOOLS.find((t) => t.id === 'phonetic-converter');
    expect(phonetic?.href).toBe('/tools/phonetic-converter');
  });

  it('categorizes every tool', () => {
    expect(AI_TOOLS.filter((t) => t.category === 'ai').map((t) => t.id)).toEqual([
      'prompt-improver',
      'email-drafter',
      'summarizer',
      'meeting-actions',
      'output-checker',
    ]);
    expect(AI_TOOLS.filter((t) => t.category === 'phonetic').map((t) => t.id)).toEqual([
      'phonetic-converter',
    ]);
  });
```

- [ ] **Step 2: Run to verify failure**, then update the registry: add `category: 'ai' | 'phonetic'` to `AiToolMeta`; set `category: 'phonetic'` + `href: '/tools/phonetic-converter'` on phonetic-converter; `category: 'ai'` on the other five.
- [ ] **Step 3: Run `npx jest components/ai-tools --runInBand --forceExit`** — all pass. `npx tsc --noEmit` — exit 0 (ai-tools-grid/home-ai-section don't reference category, so no breakage).
- [ ] **Step 4: Commit** `feat(ia): registry categories + dedicated converter href`

### Task 2: Extract converter, create /tools/phonetic-converter, update links

**Files:** Create `components/phonetic/inline-text-converter.tsx`, `app/tools/phonetic-converter/page.tsx`, `app/tools/phonetic-converter/error.tsx`. Modify `app/tools/tools-client.tsx`, `components/home/home-hero.tsx` + its test, `app/not-found.tsx`, `app/sitemap.ts`.

- [ ] **Step 1: MOVE (verbatim) the `InlineTextConverter` function** and its imports/`MAX_CHARACTERS` constant from `app/tools/tools-client.tsx` into new `components/phonetic/inline-text-converter.tsx` with `'use client'` at top and `export function InlineTextConverter(...)`. Preserve every line of speech/copy/share logic byte-for-byte (regression-sensitive). Keep its existing props if any (check the call site `<InlineTextConverter key={converterKey} />` — the component takes no props; the key stays at the call site).
- [ ] **Step 2: Create the page** `app/tools/phonetic-converter/page.tsx`: server component; metadata `baseGenerateMetadata('NATO Phonetic Alphabet Converter', 'Convert any text to NATO phonetic code words instantly — with audio, reverse lookup, and a printable chart', '/tools/phonetic-converter')`. Body sections in order, inside `<div className="container max-w-4xl mx-auto px-4 py-12 space-y-12">`: (a) heading h1 `NATO Phonetic Converter` + one-line sub (reuse tools-page hero styles at smaller scale: `text-4xl sm:text-5xl font-black tracking-headlines text-center`), (b) `<InlineTextConverter />` inside `ErrorBoundary` (needs a small client wrapper only if the key-reset behavior is kept — DROP the pathname-key reset; it existed to clear state on route change within one page and is unnecessary on a dedicated page), (c) `<ErrorBoundary><LazyReverseLookup /></ErrorBoundary>`, (d) the PDF download block JSX moved from tools-client, (e) the Quick Tips / Common Uses two-card grid moved from tools-client. `error.tsx`: clone the ToolErrorFallback wrapper pattern (`toolName="Phonetic Converter"` `contextId="phonetic-converter"`).
- [ ] **Step 3: Update links:** `components/home/home-hero.tsx` secondary CTA href `/tools#converter` → `/tools/phonetic-converter` (+ its test assertion); `app/not-found.tsx` line ~54 `/tools#converter` → `/tools/phonetic-converter`.
- [ ] **Step 4: sitemap.ts** — add `/tools/phonetic-converter` entry, `priority 0.8`, monthly.
- [ ] **Step 5:** `npx jest components --runInBand --forceExit` + `npx tsc --noEmit` — green. NOTE: tools-client.tsx will now have unused imports/sections mid-refactor; Task 3 completes it — to keep this commit green, do Task 2 and Task 3 in ONE working session but SEPARATE commits is not possible if tsc fails on unused vars (project eslint may only warn). If `tsc`/lint fail on the intermediate state, combine Tasks 2+3 into a single commit and note it.
- [ ] **Step 6: Commit** `feat(ia): dedicated phonetic converter page, extracted converter component`

### Task 3: /tools as pure hub

**Files:** Rewrite `app/tools/tools-client.tsx`; modify `app/tools/page.tsx` (metadata description only if needed).

- [ ] **Step 1: Replace tools-client.tsx** with a hub (~130 lines, `'use client'` needed only for the TimeSavedBanner added in Task 6 — until then it can be a server-style component but the file already has 'use client'; keep 'use client' to avoid churn):
  - Hero: h1 `Productivity Tools` (unchanged copy from current) + subtitle (unchanged).
  - `TimeSavedBanner` placeholder comment `{/* TimeSavedBanner mounts here in Task 6 */}`.
  - Group 1 `AI Work Tools`: cards from `AI_TOOLS.filter(t => t.category === 'ai')` — reuse the exact card JSX pattern from `components/ai-tools/ai-tools-grid.tsx`.
  - Group 2 `Phonetic & Reference`: the phonetic-converter registry card PLUS three static reference cards (same card styling): `Printable Chart` (`/api/pdf` with `download` attr, emoji 📄→use 🖨️), `Learn the Alphabet` (`/learn`, 📚), `Practice & Quiz` (`/practice`, 🎯).
  - Group headings: `text-2xl font-bold tracking-largeText mb-6`.
  - The verification blurb line (ShieldCheck sentence) moves here under the AI group (copy from ai-tools-grid).
  - DELETE from this file: InlineTextConverter usage/definition remnants, LazyReverseLookup section, PDF section, Quick Tips/Common Uses, `id="converter"` section, AiToolsGrid usage, and all now-unused imports (usePathname/useState/speech/etc.).
  - `components/ai-tools/ai-tools-grid.tsx` becomes UNUSED by /tools but is still used nowhere else — DELETE the file and its export from `components/ai-tools/index.ts` (check `grep -rn "AiToolsGrid" app components` first; home uses HomeAiSection, not the grid).
- [ ] **Step 2:** `npx jest components --runInBand --forceExit`, `npx tsc --noEmit`, `wc -l app/tools/tools-client.tsx` (<200 expected).
- [ ] **Step 3: Commit** `feat(ia): tools page as pure hub with grouped cards`

### Task 4: Navigation dropdowns + footer tools column

**Files:** Create `components/layout/nav-menu.tsx` (+ test `components/layout/__tests__/nav-menu.test.tsx`); modify `components/layout/simple-header.tsx`, `components/layout/footer.tsx`.

- [ ] **Step 1: Write failing test** for the dropdown component:

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { NavDropdown } from '../nav-menu';

const ITEMS = [
  { name: 'AI Prompt Improver', href: '/tools/prompt-improver', emoji: '✨' },
  { name: 'All tools', href: '/tools', emoji: '🧰' },
];

describe('NavDropdown', () => {
  it('opens on click and lists items with hrefs', () => {
    render(<NavDropdown label="Tools" items={ITEMS} />);
    const trigger = screen.getByRole('button', { name: /tools/i });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('link', { name: /prompt improver/i })).toHaveAttribute(
      'href',
      '/tools/prompt-improver'
    );
  });

  it('closes on Escape', () => {
    render(<NavDropdown label="Tools" items={ITEMS} />);
    fireEvent.click(screen.getByRole('button', { name: /tools/i }));
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.getByRole('button', { name: /tools/i })).toHaveAttribute(
      'aria-expanded',
      'false'
    );
  });
});
```

- [ ] **Step 2: Implement `components/layout/nav-menu.tsx`** (`'use client'`): `export interface NavItem { name: string; href: string; emoji: string }`; `export function NavDropdown({ label, items }: { label: string; items: NavItem[] })` — button trigger with `aria-expanded`/`aria-haspopup="menu"`, chevron; absolute-positioned panel (`bg-white dark:bg-warmNeutral-800 rounded-xl shadow-lg border border-warmNeutral-200 dark:border-warmNeutral-700 py-2 min-w-56`); items as `<Link>` rows (`flex items-center gap-2 px-4 py-2 text-sm hover:bg-warmNeutral-100 dark:hover:bg-warmNeutral-700`); useEffect listeners: click-outside closes, `keydown Escape` closes; close on item click. Also export the menu data builders: `export function toolsMenuItems(): NavItem[]` (AI tools from registry in order, then converter, then `{name:'All tools', href:'/tools', emoji:'🧰'}`) and `export const NATO_MENU_ITEMS: NavItem[]` (Learn the Alphabet /learn 📚, Practice & Quiz /practice 🎯, Printable Chart /api/pdf 🖨️).
- [ ] **Step 3: Integrate into simple-header.tsx:** desktop nav replaces the flat `navigation` array rendering with `<NavDropdown label="Tools" items={toolsMenuItems()} />` and `<NavDropdown label="Learn NATO" items={NATO_MENU_ITEMS} />` (active-state styling on the trigger when pathname starts with a member href is nice-to-have — skip if fiddly). Mobile menu: render the same two groups as labeled sections (group heading + indented links) instead of accordions (simpler, no state). Keep Profile/Settings/theme exactly as-is. Keep the speech-cancel onClick behavior on all nav links (project memory: speech must stop on navigation) — pass an `onNavigate` callback prop to NavDropdown that the header wires to `speechManager.cancel()` + the clear-text-converters event dispatch, invoked on every item click.
- [ ] **Step 4: footer.tsx** — add a "Tools" column with all six registry names → hrefs (import AI_TOOLS, map).
- [ ] **Step 5:** jest components/layout + full `npx jest components --runInBand --forceExit`; tsc; check header file size (<500; extract further if not).
- [ ] **Step 6: Commit** `feat(ia): dropdown navigation menus + footer tools column`

### Task 5: Recent-results history

**Files:** Create `lib/client/tool-history.ts` + `lib/client/__tests__/tool-history.test.ts`, `components/ai-tools/recent-results.tsx`; modify `components/ai-tools/ai-tool-form.tsx`, `components/ai-tools/index.ts`.

- [ ] **Step 1: Failing tests** (jsdom default env — the jest.setup localStorage mock applies; note it's a jest.fn() mock, so use a real in-memory fake: `const store: Record<string,string> = {}` wired via `(localStorage.getItem as jest.Mock).mockImplementation(k => store[k] ?? null)` and same for setItem writing `store[k]=v` in beforeEach):

```ts
import { addHistoryEntry, clearHistory, getHistory } from '../tool-history';
// tests: returns [] when empty; addHistoryEntry stores inputPreview (80-char cap), output,
// numeric timestamp; newest first; caps at 5 entries; clearHistory empties; corrupt JSON → []
```

Write those five tests concretely with the store fake.

- [ ] **Step 2: Implement `lib/client/tool-history.ts`:**

```ts
export interface ToolHistoryEntry {
  inputPreview: string;
  output: string;
  timestamp: number;
}

const MAX_ENTRIES = 5;
const key = (toolId: string) => `tool-history:${toolId}`;

function safeParse(raw: string | null): ToolHistoryEntry[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function getHistory(toolId: string): ToolHistoryEntry[] {
  if (typeof window === 'undefined') return [];
  return safeParse(window.localStorage.getItem(key(toolId)));
}

export function addHistoryEntry(
  toolId: string,
  input: string,
  output: string
): ToolHistoryEntry[] {
  if (typeof window === 'undefined') return [];
  const entry: ToolHistoryEntry = {
    inputPreview: input.trim().slice(0, 80),
    output,
    timestamp: Date.now(),
  };
  const next = [entry, ...getHistory(toolId)].slice(0, MAX_ENTRIES);
  try {
    window.localStorage.setItem(key(toolId), JSON.stringify(next));
  } catch {
    // Storage full/blocked — history is best-effort.
  }
  return next;
}

export function clearHistory(toolId: string): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(key(toolId));
}
```

- [ ] **Step 3: `components/ai-tools/recent-results.tsx`** (`'use client'`, presentational): props `{ entries: ToolHistoryEntry[]; onRestore: (entry: ToolHistoryEntry) => void; onClear: () => void }`; renders nothing when empty; otherwise a bordered card: header row "Recent results (stored only on this device)" + Clear button; list rows: relative date (`new Date(t).toLocaleString()` is fine), inputPreview truncated, Restore button.
- [ ] **Step 4: Wire into `ai-tool-form.tsx`:** `const [history, setHistory] = useState<ToolHistoryEntry[]>([]);` + `useEffect(() => setHistory(getHistory(toolId)), [toolId]);` on success: `setHistory(addHistoryEntry(toolId, input, response.output));` restore: `setResult({ output: entry.output, usageId: null }); setError(null);` clear: `clearHistory(toolId); setHistory([]);` render `<RecentResults …/>` below the result/feedback block. Update the barrel.
- [ ] **Step 5:** Extend `components/ai-tools/__tests__/prompt-improver.test.tsx`? NO — add a focused new test `components/ai-tools/__tests__/recent-results.test.tsx` (render with 2 entries → both listed, Restore fires callback, empty → renders null). Run all component suites + tsc.
- [ ] **Step 6: Commit** `feat(retention): per-tool recent-results history (local-only)`

### Task 6: Time-saved counter

**Files:** Create `lib/client/time-saved.ts` + test, `components/ai-tools/time-saved-banner.tsx`; modify `components/ai-tools/time-saved-feedback.tsx`, `app/tools/tools-client.tsx`, barrel.

- [ ] **Step 1: Failing tests** (same localStorage fake pattern): MINUTES map (<1→0.5, 1-5→3, 5-15→10, 15+→20); accumulates across calls; `getTimeSavedMinutes()` 0 when unset/corrupt; `formatTimeSaved(30)` → `~30 minutes`, `formatTimeSaved(192)` → `~3.2 hours` (hours to 1 decimal, minutes rounded, threshold 60).
- [ ] **Step 2: Implement `lib/client/time-saved.ts`** (SSR-guarded like tool-history; key `time-saved-minutes`; exports `recordLocalTimeSaved(bucket: TimeSavedBucket): void`, `getTimeSavedMinutes(): number`, `formatTimeSaved(minutes: number): string`).
- [ ] **Step 3: `time-saved-feedback.tsx`:** in the tap handler, alongside `submitTimeSaved`, call `recordLocalTimeSaved(bucket)`.
- [ ] **Step 4: `time-saved-banner.tsx`** (`'use client'`): reads minutes in useEffect (avoids hydration mismatch); renders null when 0; else a `micro-label`-adjacent banner: `⏱ You've saved {formatTimeSaved(minutes)} with these tools` centered under the hub subtitle. Mount in tools-client.tsx at the placeholder.
- [ ] **Step 5:** run suites + tsc. **Step 6: Commit** `feat(retention): local time-saved counter + hub banner`

### Task 7: Starter templates

**Files:** Create `lib/ai/templates.ts` + `lib/ai/__tests__/templates.test.ts`, `components/ai-tools/template-strip.tsx`; modify `ai-tool-form.tsx`, barrel.

- [ ] **Step 1: Failing test:** every AI tool id (`prompt-improver`, `email-drafter`, `summarizer`, `meeting-actions`, `output-checker`) has 3–6 templates; each template `{label (<40 chars), input (20–2000 chars)}`; `getTemplates('phonetic-converter')` → `[]`.
- [ ] **Step 2: Implement `lib/ai/templates.ts`** (client-safe data + `getTemplates(toolId): ToolTemplate[]`). Write 4 real templates per tool. Examples to include verbatim — prompt-improver: {label: 'Improve a research prompt', input: 'research the best CRM for a small business'}, {label: 'Improve a writing prompt', input: 'write a blog post about time management'}, {label: 'Improve an analysis prompt', input: 'analyze this sales data and tell me what to do'}, {label: 'Improve a planning prompt', input: 'help me plan a product launch'}; email-drafter: 'Weekly status update' / 'Schedule slip notice' / 'Follow-up after meeting' / 'Decline a request politely' with realistic 1-2 line inputs; summarizer: templates must instruct pasting ('Paste a quarterly report…') — instead give short REAL sample texts (~3 sentences) users can try instantly, labels 'Try: meeting recap', 'Try: policy excerpt', etc.; meeting-actions: one realistic raw-notes sample + 3 labeled variants; output-checker: one confident-sounding sample paragraph with an unsourced statistic ('Try: stats-heavy claim'), plus 3 more.
- [ ] **Step 3: `template-strip.tsx`:** props `{ templates: ToolTemplate[]; onSelect: (input: string) => void }`; renders nothing if empty; label 'Start from an example:'; chips as small pill buttons (`px-3 py-1.5 text-sm rounded-full bg-warmNeutral-100 …` — same pill style as time-saved-feedback).
- [ ] **Step 4: Wire into `ai-tool-form.tsx`:** above the textarea label row: `<TemplateStrip templates={getTemplates(toolId)} onSelect={(v) => setInput(v.slice(0, maxChars))} />`.
- [ ] **Step 5:** component test `template-strip.test.tsx` (chips render, click fires onSelect with input, empty → null); run all suites + tsc. **Step 6: Commit** `feat(retention): starter templates per AI tool`

### Task 8: Homepage slimming + FAQ relocation

**Files:** Modify `app/home-client.tsx`, `app/learn/page.tsx`. Create `components/home/benefits-section.tsx`, `components/home/nato-band.tsx`.

- [ ] **Step 1: Copy the FAQ section JSX out of home-client.tsx** (the `<section>` with h2 `Frequently Asked Questions` and its four Q/A cards) and append it as the LAST section of `app/learn/page.tsx` (server page — the FAQ JSX is static, no client needs). Keep every question/answer verbatim; adjust only the section wrapper classes if needed to match learn's rhythm.
- [ ] **Step 2: Create `components/home/benefits-section.tsx`** (server component):

```tsx
import Link from 'next/link';

const BENEFITS = [
  {
    emoji: '⚡',
    title: 'Write faster',
    body: 'Emails, updates, and reports drafted from rough notes in seconds — not sessions.',
    who: 'For anyone whose day is half writing',
    href: '/tools/email-drafter',
    cta: 'Draft an email',
  },
  {
    emoji: '🎯',
    title: 'Decide with confidence',
    body: 'Long documents become key points, risks, and action items you can act on.',
    who: 'For managers, analysts, and coordinators',
    href: '/tools/summarizer',
    cta: 'Summarize a document',
  },
  {
    emoji: '🛡️',
    title: 'Trust what AI tells you',
    body: 'Catch unsupported claims, weak reasoning, and overclaiming before they cost you.',
    who: 'For everyone who double-checks',
    href: '/tools/output-checker',
    cta: 'Check an AI answer',
  },
];

/** Outcome-focused benefits row (homepage slimming, spec amendment 2026-07-01). */
export function BenefitsSection() {
  return (
    <section className="py-16 md:py-20">
      <div className="container px-6 md:px-8 lg:px-4">
        <div className="text-center mb-10 md:mb-12">
          <h2 className="h2 mb-6">What You Get</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {BENEFITS.map((b) => (
            <div
              key={b.title}
              className="p-6 rounded-xl bg-white dark:bg-warmNeutral-800 border border-warmNeutral-200 dark:border-warmNeutral-700"
            >
              <div className="text-3xl mb-3" aria-hidden="true">{b.emoji}</div>
              <h3 className="text-xl font-bold mb-2">{b.title}</h3>
              <p className="text-body text-secondary mb-2 leading-relaxed">{b.body}</p>
              <p className="text-sm text-tertiary mb-4">{b.who}</p>
              <Link href={b.href} className="text-sm font-semibold text-coolBlue-500 hover:text-coolBlue-600">
                {b.cta} →
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Create `components/home/nato-band.tsx`** (server component): compact section, `bg-coolBlue-50 dark:bg-coolBlue-900/10`, h2 `Need the NATO alphabet right now?`, one line `The converter, the full A–Z chart with audio, and practice drills are one click away.`, three CTAs: `Try the Converter` (btn btn-primary → /tools/phonetic-converter), `Learn the Alphabet` (btn btn-secondary → /learn), `Download the Chart` (btn btn-secondary → /api/pdf with `download` attribute).
- [ ] **Step 4: Rework home-client.tsx:**
  - DELETE sections: Text Translator (`NATO Phonetic Translator` h2), Chart preview (`Complete NATO Phonetic Alphabet Chart`), How to Use, NATO vs. Military, FAQ. Remove now-unused dynamic imports (`TextConverterWrapper`, `AudioAlphabetTable`) — check `FamewallWidget`/`TestimonialsGrid` remain used.
  - INSERT `<BenefitsSection />` between `<HomeAiSection />` and the Features/Foundation section; INSERT `<NatoBand />` between the stats section and testimonials.
  - Stats band: replace the four items with: `6` / `Work Tools`, `26` / `Code Words`, `100%` / `Free Forever`, `0` / `Sign-ups Required` (keep classes).
  - Testimonials subtitle: `Join thousands of professionals who have mastered the NATO phonetic alphabet` → `Join thousands of professionals who communicate clearly — with people and with AI`.
- [ ] **Step 5: Verify:** `wc -l app/home-client.tsx` (expect ~220–260); tsc; full jest; `curl -s localhost:3000 | grep -c "Frequently Asked"` → 0 and same grep on /learn → ≥1 (dev server picks up changes).
- [ ] **Step 6: Commit** `feat(ia): slim AI-first homepage — benefits, NATO band, FAQ relocated to /learn`

### Task 9: Full verification + wrap-up

- [ ] `npx tsc --noEmit` && `npx jest --runInBand --forceExit` (expect ~150+ tests, 0 failures)
- [ ] Scoped eslint over all changed dirs — 0 errors
- [ ] Live smoke: `/`, `/tools`, `/tools/phonetic-converter`, `/learn` all 200; homepage has no `NATO Phonetic Translator` h2; converter page converts; nav dropdowns open/close; a template chip fills a textarea; a tool run appears in Recent results after reload; time-saved tap increments the hub banner.
- [ ] Append memories entry; commit; clear `.next/cache`; beep.

## Self-review notes

- Spec coverage: hub split (T2/T3), nav (T4), retention ×3 (T5/T6/T7), homepage slimming + FAQ relocation (T8), link updates (T2), sitemap (T2), footer (T4). Non-goals respected (no accounts/backend).
- Known coupling: T2+T3 may need a combined commit if the intermediate state fails checks (noted inline).
- Type consistency: `ToolHistoryEntry`, `NavItem`, `ToolTemplate`, `category` field names used consistently across tasks.
