# Dashboard v2 — Comprehensive Expansion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Expand the admin dashboard per spec §14: traffic & engagement, KPI deltas with previous-period chart overlay, AI operations (per-model tokens/cost/latency), recent activity feed, learning funnel (practice completions), and geography — across a re-organized sidebar (Overview / Traffic / AI Ops / Tools / Reviews).

**Architecture:** The `events` table is rebuilt once (drops the name CHECK — the server allowlist in `lib/constants/events.ts` becomes the single gatekeeper — and gains `country`/`city`); `tool_usage` gains the same two columns via guarded ALTER. Geo comes from Vercel's `x-vercel-ip-country`/`x-vercel-ip-city` request headers, captured server-side (null in local dev). `lib/db/analytics-repo.ts` splits into `lib/db/analytics/` modules with a re-export shim. Three stats endpoints join the existing two. A shared `useAdminStats` hook consolidates fetch/cancel/error and redirects to `/admin/login` on 401.

**Tech Stack / rules:** unchanged from Phase 2 (no `jest.mock()`, injectable deps, real `:memory:` libSQL for SQL-correctness tests, node docblocks, files < 500 lines, current design idiom per the Phase 2 plan's Design Notes — reuse the shipped `components/admin/*` as exemplars).

**Spec:** `docs/superpowers/specs/2026-07-05-analytics-dashboard-design.md` §14.

---

### Task 0: Branch

- [x] `git checkout -b feature/dashboard-v2` (from feature/analytics-admin HEAD).

---

### Task 1: Schema — events rebuild + geo columns + new event name

**Files:** `lib/db/schema.sql`, `scripts/init-db.mjs`, `lib/constants/events.ts` + its test.

- [x] **Step 1 (TDD on constants):** extend `lib/constants/__tests__/events.test.ts` — `EVENT_NAMES` now equals the six-name tuple ending `'practice_complete'`; `isEventName('practice_complete')` true. Run → FAIL. Add `'practice_complete'` to `EVENT_NAMES` in `lib/constants/events.ts` and update its docblock (note: DB CHECK is gone after this task; this allowlist is the only gatekeeper). Run → PASS.

- [x] **Step 2: `lib/db/schema.sql`** — the canonical `events` CREATE TABLE loses its CHECK constraint and gains `country text` and `city text` (after `metadata`); `tool_usage` CREATE TABLE gains the same two columns (after `anon_id`). Add a comment above `events`: `-- Event-name validation lives in lib/constants/events.ts (server allowlist); no CHECK so new names don't force a table rebuild.`

- [x] **Step 3: `scripts/init-db.mjs`** — extend the pre-schema guarded-migration block (BEFORE `executeMultiple`, following the existing anon_id pattern):

```js
// events rebuild: legacy tables have a CHECK on name (SQLite can't alter it)
// and lack country/city. Rebuild via create-copy-rename, preserving rows.
const eventsDef = await db.execute("select sql from sqlite_master where type='table' and name='events'");
const eventsSql = eventsDef.rows[0]?.sql ?? '';
if (eventsSql && (eventsSql.includes('check') || !eventsSql.includes('country'))) {
  await db.executeMultiple(`
    create table events_new (
      id         text primary key,
      name       text not null,
      tool       text,
      anon_id    text,
      metadata   text,
      country    text,
      city       text,
      created_at text not null default (datetime('now'))
    );
    insert into events_new (id, name, tool, anon_id, metadata, created_at)
      select id, name, tool, anon_id, metadata, created_at from events;
    drop table events;
    alter table events_new rename to events;
  `);
  console.log('Rebuilt events table (no CHECK, +country/city).');
}
// tool_usage geo columns (simple guarded ALTERs, like anon_id)
const tuInfo = await db.execute("pragma table_info('tool_usage')");
if (tuInfo.rows.length > 0) {
  for (const col of ['country', 'city']) {
    if (!tuInfo.rows.some((row) => row.name === col)) {
      await db.execute(`alter table tool_usage add column ${col} text`);
      console.log(`Added tool_usage.${col} column.`);
    }
  }
}
```

Indexes are recreated by `schema.sql`'s `create index if not exists` immediately after (they were dropped with the old table) — verify this ordering works.

- [x] **Step 4: verify all three scenarios** (fresh /tmp db ×2 runs; legacy db seeded with the OLD events CREATE TABLE incl. CHECK + a data row that must survive the rebuild + row count identical after; current local.db). Paste outputs. Also `sqlite3 local.db ".schema events"` shows no CHECK + new columns, and `.indexes events` shows both idx_events_* indexes.

- [x] **Step 5:** full `npx jest` (analytics-repo tests seed via schema.sql — they must still pass), `npx tsc --noEmit`. Commit: `feat(db): rebuild events (allowlist-only names, +geo), tool_usage geo columns, practice_complete event`.

---

### Task 2: Geo capture + practice_complete instrumentation

**Files:** `lib/utils/geo.ts` (new) + test; `app/api/events/handler.ts` + test; `lib/db/events-repo.ts` + test; `lib/ai/metrics.ts` + `app/api/ai/[tool]/handler.ts` + tests; `app/practice/simple-practice-client.tsx`.

- [x] **Step 1: `lib/utils/geo.ts`** (TDD) — `readGeo(request: NextRequest): { country: string | null; city: string | null }`: country from `x-vercel-ip-country` (2-letter uppercase A-Z regex, else null); city from `x-vercel-ip-city` (`decodeURIComponent`, trimmed, ≤ 80 chars, else null; decode failures → null). Tests: valid pair; missing headers → nulls; junk country (`x-vercel-ip-country: <script>`) → null; URL-encoded city (`New%20York`) decoded; oversized city → null.

- [x] **Step 2: events pipeline** — `NewEvent` gains `country: string | null; city: string | null`; `insertEvent` SQL gains the two columns/args (update repo tests); events handler calls `readGeo(request)` and passes through (extend handler test: geo headers present → inserted values; absent → nulls).

- [x] **Step 3: tool_usage pipeline** — `ToolUsageEntry` gains `country`/`city`; metrics insert SQL gains the columns (update metrics tests); AI handler passes `...readGeo(request)` (update route test expectations with `country: null, city: null`).

- [x] **Step 4: practice completions** — in `app/practice/simple-practice-client.tsx`: fire `track('practice_complete', mode-that-completed)` inside the completion callbacks — `handleQuizComplete` currently only handles practice mode's completion; READ the file: learn mode completes via `onComplete={handleBack}` and challenge mode has its own callback (check lines ~55-65). Restructure minimally so each mode's completion fires `track('practice_complete', '<mode>')` before the existing navigation behavior (a small `completeSession(mode)` helper is fine). Do not alter UX timing.

- [x] **Step 5:** affected suites + full jest + tsc. Commit: `feat(analytics): geo capture and practice completion events`.

---

### Task 3: Analytics module split + v2 aggregates

**Files:** new `lib/db/analytics/` — `shared.ts`, `overview.ts`, `traffic.ts`, `ai-ops.ts`, `activity.ts`, plus `lib/db/analytics-repo.ts` becomes a re-export shim (`export * from './analytics/overview'` etc.). Tests: `lib/db/__tests__/analytics-traffic.test.ts`, `analytics-ai-ops.test.ts`, `analytics-activity.test.ts`, and the existing `analytics-repo.test.ts` extended for deltas/overlay (all against real `:memory:` libSQL seeded from schema.sql — no manual ALTERs needed now).

**Contracts (binding):**

```ts
// overview.ts — extends the existing getOverviewStats return type:
export interface KpiWithDelta { current: number; previous: number } // previous = same-length window immediately before
export interface OverviewStats {
  uniqueVisitors: KpiWithDelta;
  interactions: KpiWithDelta;
  aiConversations: KpiWithDelta;
  tokens: KpiWithDelta;
  timeSavedMinutes: KpiWithDelta;
  pageViews: KpiWithDelta;                       // NEW: count of events name='page_view'
  dailySeries: Array<{ date: string; ai: number; other: number; prevTotal: number }>; // prevTotal = ai+other of the day `days` earlier
  // toolLeaderboard moved to TrafficStats; timeSavedDistribution moved to AiOpsStats (one fetch per page)
}

// traffic.ts
export interface TrafficStats {
  topPages: Array<{ path: string; views: number }>;              // top 10, events name='page_view' group by tool
  countries: Array<{ country: string; visitors: number; interactions: number }>; // top 10 by distinct anon_id, events∪tool_usage; country null → excluded
  newVisitors: number;                                            // first_seen (min created_at per anon over BOTH tables, all time) >= window start
  returningVisitors: number;                                      // active in window, first_seen before window
  avgInteractionsPerVisitor: number;                              // interactions/uniqueVisitors, 1 decimal, 0 when no visitors
  funnel: Array<{ mode: string; started: number; completed: number }>; // practice_session vs practice_complete by tool(mode)
  toolLeaderboard: Array<{ tool: string; uses: number }>;         // moved here from OverviewStats (same semantics)
}

// ai-ops.ts
export interface AiOpsStats {
  byModel: Array<{ model: string; conversations: number; inputTokens: number; outputTokens: number; estimatedCostUsd: number | null }>;
  totalCostUsd: number | null;      // null when ANY used model lacks a price entry
  avgLatencyMs: number;
  timeSavedDistribution: Array<{ bucket: string; votes: number }>;
}

// activity.ts
export interface ActivityItem { at: string; kind: 'ai' | 'event'; name: string; tool: string | null; anonShort: string | null; country: string | null }
export function getRecentActivity(limit?: number, deps?): Promise<ActivityItem[]>  // default 50, union both tables order by created_at desc; anonShort = first 8 chars
```

Notes: previous-window filter is `created_at >= date('now', '-(2N-1) days') AND created_at < date('now', '-(N-1) days')`. Costs: `lib/constants/model-prices.ts` — `export const MODEL_PRICES: Record<string, { inputPerMTok: number; outputPerMTok: number }>` seeded with `'claude-haiku-4-5': { inputPerMTok: 1, outputPerMTok: 5 }` and a comment telling the owner to add entries for new models (gpt-5.4-nano intentionally absent until the owner supplies real prices); cost = in/1e6*price + out/1e6*price, rounded to 4 decimals; model absent from the table → that row's `estimatedCostUsd` = null and `totalCostUsd` = null.

- [x] **Step 1:** write the three new test files + extend the existing one (seed scenarios covering: deltas with rows in both windows; prevTotal alignment; topPages ordering; new vs returning boundary — an anon whose first event predates the window and who is active in-window counts as returning; funnel started>completed; byModel with a priced and an unpriced model → totalCostUsd null; activity ordering + limit + anonShort). Run → FAIL.
- [x] **Step 2:** implement the modules; keep each file < 300 lines; `shared.ts` holds DbLike/resolveDb/since/num (export them; other repos keep their own copies — do NOT refactor reviews/events repos).
- [x] **Step 3:** `lib/db/analytics-repo.ts` becomes re-exports only; existing imports (`app/api/admin/stats/*`, `components/admin/*`) keep compiling — verify with tsc.
- [x] **Step 4:** all suites + full jest + tsc. Commit: `feat(admin): v2 aggregates — deltas, traffic, ai-ops, activity, funnel`.

---

### Task 4: Stats endpoints + shared hook

**Files:** `app/api/admin/stats/{traffic,ai,activity}/route.ts` (reuse `createStatsHandler`; activity ignores days — still validate the param, just don't pass it, or accept and ignore); `lib/hooks/use-admin-stats.ts` + test.

- [x] **Step 1 (hook, TDD):** `useAdminStats<T>(url: string): { data: T | null; error: boolean }` — cancellable effect keyed on url, `res.ok` check, and on **401**: `window.location.href = '/admin/login'` (jsdom test: stub fetch 401, assert redirect attempt — jsdom forbids real navigation; set `window.location` via `Object.defineProperty` or assert on a spy of `window.location.assign` — pick what jsdom permits, follow how other tests handle navigation, else inject a `navigate` dep with default).
- [x] **Step 2:** three thin routes delegating to `getTrafficStats`/`getAiOpsStats`/`getRecentActivity`. Extend the stats handler test only if behavior changed.
- [x] **Step 3:** refactor `overview-dashboard.tsx` and `tools-view.tsx` to use the hook (their tests keep passing — adjust if fetch-call assertions moved).
- [x] **Step 4:** suites + tsc. Commit: `feat(admin): traffic/ai/activity endpoints and shared stats hook`.

---

### Task 5: UI — sidebar + Overview v2 + Traffic + AI Ops pages

**Files:** `components/admin/admin-shell.tsx` (add Traffic `/admin/traffic` (Globe icon), AI Ops `/admin/ai` (Cpu icon) between Overview and Tools); `components/admin/kpi-card.tsx` (optional `delta?: { current: number; previous: number }` → renders `↑ 12%` in `text-success` / `↓ 8%` in `text-error` / `— 0%` in text-tertiary; previous=0 && current>0 → "new"); `components/admin/activity-feed.tsx` (new, pure table: relative time like "3m ago", kind badge, tool, anonShort mono, country); `components/admin/funnel-list.tsx` (new, pure: mode rows with started/completed bars + completion %); `components/admin/top-list.tsx` (new, generic pure: label + count + proportional bar — used for topPages and countries); `components/admin/overview-dashboard.tsx` (KPIs now 6 incl. page views, all with deltas; chart overlay; recent activity section replaces nothing — leaderboard/votes MOVE to their new pages); `components/admin/traffic-view.tsx` + `app/admin/traffic/page.tsx`; `components/admin/ai-ops-view.tsx` (byModel table + cost + latency + votes) + `app/admin/ai/page.tsx`; `components/admin/activity-chart-inner.tsx` (add dashed `prevTotal` Line — switch to ComposedChart: two stacked Areas + one dashed `#9CA3AF` Line, legend).

Layout intent (keep the shipped card idiom): Overview = KPI grid (3×2 on lg), full-width chart with overlay + legend, recent activity table. Traffic = 3 KPI-ish tiles (new, returning, avg per visitor) + two-column top pages / countries + the most-used-tools leaderboard chart (moves here from Overview) + funnel section. AI Ops = model table (mono numbers, cost column with em-dash when null + a one-line hint `Add prices in lib/constants/model-prices.ts`), latency + time-saved votes side by side (votes move here from Overview). Each page makes exactly one stats fetch: the leaderboard now lives in TrafficStats and the votes distribution in AiOpsStats; OverviewStats drops both (contracts above reflect this — adjust the existing overview tests accordingly).

- [x] **Step 1 (TDD on pure components):** tests for kpi-card delta rendering (↑/↓/new/0%), activity-feed (rows render, relative time, empty state "No activity yet."), funnel-list (completion % math, zero-started guard), top-list (proportional widths, empty state). Run → FAIL → implement → PASS.
- [x] **Step 2:** view components (use `useAdminStats`; each with LoadingSpinner + role=alert error states like the shipped exemplars; RangeSwitcher on all three pages; activity feed has no range).
- [x] **Step 3:** update `overview-dashboard` tests for the new shape (KpiWithDelta fixtures), add traffic-view + ai-ops-view tests (fetch stub → sections render; error → alert).
- [x] **Step 4:** `npx jest components lib/hooks -v`, full jest, tsc, `rm -rf .next && npx next build` (must pass), then `rm -rf .next`. ALSO: open the dev server and check the browser console for the dev-overlay warnings the owner saw ("2 Issues") — if they're Recharts defaultProps/ResizeObserver dev warnings, note as known-cosmetic; if they're hydration errors from our components, fix them.
- [x] **Step 5:** Commit: `feat(admin): comprehensive dashboard — traffic, ai ops, activity, deltas, funnel, geo`.

---

### Task 6: Full verification

- [x] Full jest, tsc, clean build. `npm run db:init` idempotency re-check. Live e2e: login → all five sidebar pages return 200 and render (curl the three new API endpoints with the cookie jar, paste JSON heads). Seed a practice_complete + a geo event via curl with headers `x-vercel-ip-country: US`, `x-vercel-ip-city: Austin` and verify they land with geo + appear in traffic/funnel/activity responses. Update `claude-memories.md` (events CHECK dropped — allowlist is sole gatekeeper; model-prices location; new pages). Commit.

## Out of scope
Phase 3 /impact page (needs lifetime aggregates — separate plan); durable rate-limit store; pagination for activity/reviews at scale.
