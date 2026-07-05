# Landing Page Positioning: Outcome-Led Homepage with Two Doors

Date: 2026-07-05
Status: Approved (brainstorm with owner, visual companion session)
Branch target: feature/ia-navigation-retention (or successor branch)

## Problem

The homepage has swung twice between NATO-first (`fd6504e`) and AI-first (`b9a1959`)
positioning. The owner wants a stable structure that:

1. Positions the site as **tools for mission-critical work and communication** (umbrella).
2. Gives NATO-phonetic visitors an unmissable entry point (they are the majority of
   arriving search traffic, roughly split between the homepage and deep pages).
3. Gives the AI work tools clear entry points and active cross-sell exposure.
4. Prevents NATO phonetic from dominating the brand, without losing the SEO traffic
   that funds the whole funnel.

Copy direction (owner): **outcome-led, official/professional register.** Sell
split-second decisions, precise communication, dependable work. Do not sell features
or tools. Never position AI output as inherently trustworthy ("Trust what AI tells
you" is banned); position verification as professional practice.

## Decision

Adopt the **"one umbrella, two doors"** structure (Option B of three explored):
a short outcome-led hero followed by two equal self-select door cards (NATO |
AI Work Tools). The structure itself encodes the balance permanently — neither
side leads, both audiences route themselves in one glance, and each is exposed
to the other side (the cross-sell).

## Page structure (top to bottom)

1. **Hero** — no CTA buttons (the doors are the CTAs):
   - Eyebrow: `NATOPHONETIC`
   - H1: `Productivity for mission-critical work`
   - Subhead: `Professional AI tools for split-second decisions, precise
     communication, and dependable everyday work.`
2. **Two doors** (new `components/home/two-doors.tsx`) — equal side-by-side cards;
   stacked on mobile with NATO first (majority arrival intent):
   - **NATO door** — label `NATO Phonetic Alphabet`, heading `Split-second clarity`,
     body: `The universal standard for communicating letters and codes without
     error over radio, phone, or dispatch.` Links: Converter
     (`/tools/phonetic-converter`), Chart PDF (`/api/pdf`), Learn (`/learn`).
   - **AI door** — label `AI Work Tools`, heading `Decisions, faster`, body:
     `Draft, summarize, and review with AI to a professional standard. Five
     tools, no sign-up.` Link: `/tools`.
3. **Benefits band** — existing `BenefitsSection` unchanged. (Verified 2026-07-05:
   current copy is already outcome-led and professional — H2 `Made for High-Stakes
   Work` with cards `Comms out in seconds`, `Brief, don't bury`, `Verify before you
   rely`. No "Trust what AI tells you" exists in code; the revision list drafted
   during brainstorming targeted stale copy and is withdrawn.)
4. **AI tools showcase** — keep `HomeAiSection` (5 tool cards, cross-sell). Its
   current heading `AI Tools for Mission-Critical Communication` is tool-led;
   change it to the outcome heading `Hours of work in minutes`.
5. **"The standard behind it"** — ONE compact keyword-rich NATO section (new
   `components/home/standard-section.tsx`; `nato-band.tsx` no longer exists in the
   codebase): H2 containing `NATO Phonetic Alphabet`,
   condensed definition paragraph (from current features-grid intro), A–F chart
   preview tiles, and the three entry links. Framed as provenance ("the same
   discipline powers our AI tools"), not the main event.
6. **Testimonials** — unchanged.
7. **Closing CTA** — heading `Precision in every deliverable`; primary button →
   `/tools`, secondary → `/learn`.

**Removed:** the "What Is the NATO Phonetic Alphabet?" features grid (Learn /
Practice / Tools cards) in `app/home-client.tsx`. All three destinations remain
reachable via the NATO door, nav dropdowns, and footer — nothing orphaned.

## SEO safeguards (defensive layer for split traffic)

- `<title>` stays byte-unchanged: `natophonetic.com | NATO Phonetic Alphabet
  (A to Z) & AI Tools for Mission-Critical Communication` (from
  `lib/seo/metadata.ts`). Meta description keeps
  "NATO phonetic alphabet" and gains outcome language.
- Keyword phrase remains on-page ≥3 times in headings/labels: NATO door label,
  "standard behind it" H2, chart section content.
- `/learn` (FAQ + deep NATO content) untouched.
- Monitor Search Console for 4 weeks post-ship (precedent: mission-critical
  rebrand). **Pre-agreed rollback:** if homepage NATO impressions drop materially,
  swap the H1 to `Split-second clarity: the NATO phonetic alphabet and
  mission-critical AI tools` without touching structure.

## Components and files

| File | Change |
|---|---|
| `components/home/home-hero.tsx` | Rewrite for new copy; stays a server component; no CTAs |
| `components/home/two-doors.tsx` | New; test asserts both doors' links (TDD) |
| `app/home-client.tsx` | Reorder to structure above; delete features grid (file shrinks) |
| `components/home/standard-section.tsx` | New; the ONE compact NATO section (keyword H2, chart preview, entry links) |
| `components/home/benefits-section.tsx` | No change (already outcome-led) |
| `components/ai-tools/home-ai-section.tsx` | H2 becomes `Hours of work in minutes` |
| Closing CTA (in `home-client.tsx`) | New heading + button targets |
| Tests | Update `home-hero` test; new `two-doors` test; section-order assertion in home-client test |

## Testing

- Jest component tests: hero copy, door links/labels, benefits copy, section order.
- Full suite green (`--runInBand`; cold run may take 3–5 min).
- Live curl checks: title tag unchanged; both door hrefs resolve 200;
  `/tools/phonetic-converter`, `/api/pdf`, `/learn`, `/tools` reachable from
  homepage HTML.

## Out of scope

- Nav, footer, `/tools` hub, `/learn`, `/practice` — all unchanged.
- No new routes, no API changes, no data model changes.

## Constraints and conventions

- Files ≤ 500 lines; outcome-led professional copy only; no em dashes in
  user-facing copy (per `69cb685`); no badges (per `fd6504e`). `.micro-label`
  was REMOVED in `fd6504e` — eyebrows/labels use the inline utility stack
  `text-xs font-bold text-tertiary uppercase tracking-widest`.
