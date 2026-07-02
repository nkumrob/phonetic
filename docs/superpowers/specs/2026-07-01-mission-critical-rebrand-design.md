# Mission-Critical Rebrand — Design Spec

**Date:** 2026-07-01
**Status:** Approved direction, pending spec review

## Context

natophonetic.com currently reads as two products: a NATO-phonetic-alphabet learning site with an AI-tools section attached. The owner wants one coherent product. Decision: reposition the entire site as **an AI work-productivity suite for mission-critical work**, with the NATO phonetic module retained as a main pillar and credibility cornerstone. This also strengthens the EB2 NIW narrative (workforce tools for aviation/defense/emergency-response sectors).

## Positioning

> **Natophonetic — the AI productivity suite for mission-critical work.**
> For people who can't afford miscommunication: aviation, military, maritime, dispatch, emergency services.

- **Audience:** high-stakes comms professionals (matches existing NATO-search traffic).
- **Scope discipline:** we position for the *paperwork side* of mission-critical work — reports, briefs, comms, handoffs. Never operational or safety decisions. No certification or reliability claims.
- **Voice:** precise, calm, zero hype. Short sentences, concrete verbs. No "supercharge"-style language.
- **NATO as proof asset:** "We started with the phonetic alphabet — the original protocol for zero-ambiguity communication. Our AI tools apply the same standard."

## Homepage (app/home-client.tsx + extracted components)

Order of sections:
1. **Hero:** H1 "AI productivity for mission-critical work"; subhead "Draft comms, build briefs, extract action items, and verify AI output — tools built with the discipline of the professions that invented clear communication." Primary CTA → tools; secondary CTA → phonetic converter/learn.
2. **Tool grid:** six peer cards — the five AI tools **plus the Phonetic Converter** as a main card (extend `components/ai-tools/tool-registry.ts` or a parallel registry entry).
3. **Credibility section:** NATO heritage story; existing aviation/maritime/military trust indicators; links to /learn and /practice.
4. **Trust/verification section:** Output Checker featured; responsible-AI framing (paperwork, not operations).
5. Retain existing testimonials, FAQ, and remaining NATO content sections below.

## Information architecture & SEO protection

- `/learn`, `/practice`, and all NATO content pages: **unchanged**. NATO remains a main pillar.
- Homepage `<title>` and meta description **keep NATO phonetic keywords** while the visible hero changes (title tags carry ranking weight; visible H1 change is accepted risk, monitored via Search Console).
- Nav labels: **Tools · Learn NATO · Practice** (rename only; no restructure).
- Tool URLs unchanged (no slug churn; no redirects needed).

## Tools treatment

- Tool names stay recognizable (Email Drafter, Summarizer, Meeting Notes → Actions, Output Checker, Prompt Improver, Phonetic Converter).
- Each tool page gets mission-critical **examples and placeholders** (e.g., Summarizer: "Paste an ops report, policy, or long briefing…"; Email Drafter example: status update to a team after a schedule slip).
- System prompts: no functional changes in this phase.
- Roadmap note (out of scope): future "Radio Script Formatter" fusing AI + phonetic readbacks as the signature tool.

## Visual direction — B "Hardened Current" (chosen in visual companion)

Evolution of the existing design system, not a replacement:
- Keep warmNeutral base + coolBlue primary (Tailwind tokens in `lib/design/tokens.ts` largely unchanged).
- **Amber → signal-orange accent** used sparingly, like a caution indicator: the "FOR MISSION-CRITICAL WORK" badge, "New" chips, and small status markers only.
- Stronger type contrast on headings (existing `font-black tracking-headlines` retained; body contrast tightened where currently 70% opacity harms readability of key lines).
- Uppercase letter-spaced micro-labels (badge style) introduced as a recurring brand element.
- No dark-theme overhaul, no font change, no logo redesign in this phase.

## Non-goals

- No domain/name change (Natophonetic stays).
- No new tools, prompt rewrites, or API changes.
- No restructuring of /learn, /practice, or reviews.
- No paid/enterprise features.

## Success criteria

- Homepage and /tools read as one product with one audience; the phonetic converter appears as a peer tool card.
- NATO organic rankings hold (monitor Search Console for 4 weeks post-launch).
- All existing tests pass; new copy/components covered per project TDD rules.
- `tool_usage` metrics continue uninterrupted (no API changes).

## Affected surfaces (implementation inventory)

- `app/home-client.tsx` + `components/ai-tools/home-ai-section.tsx` (hero + section reorder; extract new sections to components to respect 500-line cap)
- `components/ai-tools/tool-registry.ts` (add phonetic converter entry; badge copy)
- `components/ai-tools/ai-tools-grid.tsx` (six-card grid, signal-orange accents)
- `app/tools/tools-client.tsx` (section order/copy)
- Tool pages (`app/tools/*/page.tsx`) — descriptions, placeholders, examples
- `components/layout/simple-header.tsx`, `footer.tsx` (nav labels)
- `lib/seo/metadata.ts` / page metadata (homepage title strategy)
- `lib/design/tokens.ts` / `app/premium-design.css` (signal-orange accent token, micro-label class)
- `claude-memories.md`, sitemap unchanged
