# IA, Navigation & Retention — Design Spec

**Date:** 2026-07-01
**Status:** Direction approved (full split + all three retention features), pending spec review

## Context

After the rebrand, `/tools` mixes an inline phonetic converter, reverse lookup, PDF download, the AI tool grid, and tips on one long page; the six tools the site is positioned around have no navigation presence. This spec reorganizes pages around jobs-to-be-done, adds real menus, and ships three lightweight retention features so repeatable-job users come back.

**JTBD framing:** one-shot jobs (spell something now, print a chart) bring search traffic; repeatable jobs (the five AI tools) bring return visits. The IA routes each job in one click; retention features give the repeatable jobs a habit loop.

## Page organization

### `/tools` — pure hub
Card directory only (no inline tools, no tips). Two labeled groups rendered from the registry:
- **AI Work Tools:** Prompt Improver, Email Drafter, Summarizer, Meeting Notes → Actions, Output Checker
- **Phonetic & Reference:** Phonetic Converter (new page), Printable Chart (links to `/api/pdf` download), Learn the Alphabet, Practice & Quiz

Registry gains a `category: 'ai' | 'phonetic'` field; hub renders groups from it. Hub metadata: "Productivity Tools — AI Work Tools & Phonetic Converter".

### `/tools/phonetic-converter` — new dedicated page
Moves from tools-client: the inline text converter, reverse lookup (lazy), PDF download block, and the Quick Tips / Common Uses content. Server page shell + client component (extract the `InlineTextConverter` and related code out of tools-client into `components/phonetic/` — tools-client shrinks to a small hub client or becomes server-rendered). Metadata targets "phonetic alphabet converter" queries. Added to sitemap (priority 0.8).

### Link updates (kill the anchor hack)
All `/tools#converter` references (tool registry, HomeHero secondary CTA, app/not-found.tsx) → `/tools/phonetic-converter`. The `id="converter"` anchor is removed with the section.

## Navigation

`components/layout/simple-header.tsx` is rebuilt with menus (extract to `components/layout/nav-menu.tsx` if the file approaches 500 lines):

- **Tools ▾** dropdown: six tools (emoji + name from registry) + "All tools →" (/tools)
- **Learn NATO ▾** dropdown: Learn the Alphabet (/learn), Practice & Quiz (/practice), Printable Chart (/api/pdf)
- Desktop: click-to-open dropdowns (not hover-only), `aria-expanded`, Escape closes, focus-trap not required but focus returns to trigger. Mobile: the existing sheet menu becomes two accordion groups + direct links.
- Profile/Settings icons unchanged. Footer: add a "Tools" column listing all six from the registry.

## Retention features (all localStorage — no accounts, no backend)

1. **Recent results** (`components/ai-tools/recent-results.tsx` + `lib/client/tool-history.ts`): after each successful AI tool run, save `{toolId, inputPreview (first 80 chars), output, timestamp}` to localStorage (key `tool-history:<toolId>`, cap 5, newest first). Rendered under the form: collapsed list of timestamps/previews; click restores output into the result panel. Clear-all button. Local-only privacy note in the UI.
2. **Time-saved counter** (`lib/client/time-saved.ts` + small display component): every time-saved tap also increments a local tally using bucket midpoints (<1→0.5, 1-5→3, 5-15→10, 15+→20 minutes). Shown on the /tools hub header ("You've saved ~3.2 hours with these tools") once total > 0; hidden otherwise.
3. **Starter templates** (`components/ai-tools/template-strip.tsx` + `lib/ai/templates.ts` client-safe data): 4–6 one-click chips per AI tool (e.g. Email Drafter: "Weekly status update", "Schedule slip notice", "Follow-up after meeting"). Clicking fills the textarea (replaces content; confirm-free since input is drafty). Templates are per-tool `{label, input}` arrays.

AiToolForm composes: TemplateStrip (above textarea) and RecentResults (below result/feedback). All client components; jsdom-testable with the existing localStorage mock in jest.setup.js.

## SEO

- `/tools` hub keeps converter keywords in its meta description; the new converter page takes the converter-specific title. Sitemap: add `/tools/phonetic-converter`; `/tools` stays.
- No changes to `/learn`, `/practice`, homepage metadata, or tool URLs.
- Monitor: converter-query impressions shifting from /tools to the new page is expected and fine.

## Non-goals

Accounts/login, email capture, server-side history, readiness check/badges, reviews-page changes, admin.

## Success criteria

- `/tools` renders only cards + hub header (+ time-saved stat) — under one viewport of chrome before the grid.
- Converter page fully functional (convert, speak, share, reverse lookup, PDF) with its own metadata.
- Nav dropdowns keyboard-accessible; mobile menu shows all destinations.
- Recent results survive reload; templates fill the form; counter accumulates across tools.
- All existing tests pass; new units for tool-history, time-saved math, template fill, and hub grouping.
- Every file under 500 lines (tools-client currently 415 — the extraction must leave both resulting files well under).

## Affected surfaces

- `components/ai-tools/tool-registry.ts` (+category, converter href), `ai-tools-grid.tsx` (or new `hub-grid.tsx`), `ai-tool-form.tsx` (compose strip/history), new: `template-strip.tsx`, `recent-results.tsx`
- New: `lib/client/tool-history.ts`, `lib/client/time-saved.ts`, `lib/ai/templates.ts`
- `app/tools/page.tsx` + `tools-client.tsx` (hub), new `app/tools/phonetic-converter/{page,error}.tsx`, extracted `components/phonetic/inline-text-converter.tsx` (move, not rewrite)
- `components/layout/simple-header.tsx` (+ possible `nav-menu.tsx`), `footer.tsx`
- `components/home/home-hero.tsx`, `app/not-found.tsx` (link updates), `app/sitemap.ts`
- Tests alongside each new module
