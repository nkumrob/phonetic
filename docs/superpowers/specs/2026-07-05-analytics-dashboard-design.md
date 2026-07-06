# Analytics Dashboard, Event Tracking & User Progress — Design

Date: 2026-07-05
Status: Approved pending user review
Owner: Robert (nkumrob@gmail.com)

## 1. Purpose

natophonetic.com needs to demonstrate real-world outcomes (interactions, engagement,
AI conversation counts, tokens used, self-reported time saved) as evidence of impact,
including for Robert's EB2 NIW petition. Today only AI tool calls are recorded
(`tool_usage` in Turso); the converter, practice mode, and page views are invisible,
user progress lives only in localStorage, and the existing `/admin/reviews` page is
unstyled (built against a removed design system) and unauthenticated.

This project delivers:

1. **First-party event tracking** for all meaningful site activity, stored in Turso.
2. **Durable anonymous visitor identity** and **server-synced user progress**.
3. **A password-protected admin dashboard** (`/admin`): overview KPIs + charts,
   per-tool detail, and a rebuilt reviews moderation page.
4. **A public `/impact` page**: a citable, live impact report.

Decisions confirmed with the owner: private admin + public impact page (both);
track all site activity first-party in Turso (no third-party analytics); anonymous
ID + server sync (no user accounts yet); admin uses a sidebar shell; impact page is
a report-style page; Recharts is the single new dependency.

## 2. Non-goals

- No user accounts / sign-in for visitors (future project).
- No third-party analytics (GA stays disabled).
- No per-user content of AI conversations stored (only counts/tokens/latency).
- No backfill of historical data that was never recorded.

## 3. Data model (Turso / libSQL)

Additions to `lib/db/schema.sql` (applied via `npm run db:init`, idempotent):

```sql
create table if not exists events (
  id         text primary key,
  name       text not null check (name in
               ('page_view','converter_use','practice_session','template_use','time_saved_vote')),
  tool       text,              -- optional tool/page identifier, e.g. 'phonetic-converter', '/learn'
  anon_id    text,              -- np_anon cookie value; nullable (cookie-less clients)
  metadata   text,              -- JSON string, small allowlisted payload (e.g. {"bucket":"5-15"})
  created_at text not null default (datetime('now'))
);
create index if not exists idx_events_name_created on events (name, created_at desc);
create index if not exists idx_events_anon_created on events (anon_id, created_at desc);

create table if not exists user_progress (
  anon_id    text primary key,
  data       text not null,     -- JSON: {toolHistory:[...], timeSaved:{...}} mirrors localStorage shape
  updated_at text not null default (datetime('now'))
);

alter table tool_usage add column anon_id text; -- nullable; guarded so re-runs don't fail
```

`tool_usage` remains the source of truth for AI runs (model, tokens, latency).
AI runs are NOT duplicated into `events`; aggregation queries read both tables.
"AI conversations" = `tool_usage` row count. "Interactions" = `events` rows
(excluding `page_view`) + `tool_usage` rows.

**Time-saved estimate**: bucket midpoints in minutes — `<1` → 0.5, `1-5` → 3,
`5-15` → 10, `15+` → 20 — summed over votes. Always labeled "self-reported".

## 4. Anonymous identity

- `middleware.ts` sets cookie `np_anon` = UUID v4 when absent: httpOnly, Secure in
  prod, SameSite=Lax, maxAge 1 year, path `/`.
- Contains no PII; documented in the privacy policy page copy.
- Server handlers read it for `events.anon_id`, `tool_usage.anon_id`, and progress.
- Existing `session_hash` (IP+UA) stays for continuity; new uniqueness metrics use
  `anon_id` with `session_hash` fallback for old rows.

## 5. APIs

All under existing rate-limiting conventions; all responses JSON; all mutations
validate input server-side.

| Route | Method | Auth | Purpose |
|---|---|---|---|
| `/api/events` | POST | none (rate-limited) | Record one event. Body `{name, tool?, metadata?}`. Name must be in allowlist; metadata ≤ 512 bytes. Returns 202. Fire-and-forget from client. |
| `/api/progress` | GET | np_anon cookie | Return the caller's progress JSON (404 → empty default). |
| `/api/progress` | PUT | np_anon cookie | Upsert progress JSON (≤ 32 KB). Last-write-wins at the entry level (client merges by timestamp before PUT). |
| `/api/admin/session` | POST | none (rate-limited: 5/15min) | Login. Body `{password}` compared (timing-safe) to `ADMIN_PASSWORD`. Sets signed session cookie. |
| `/api/admin/session` | DELETE | admin cookie | Logout (clear cookie). |
| `/api/admin/stats/overview` | GET | admin cookie | KPIs + 30d daily series + tool leaderboard + time-saved distribution. `?days=7\|30\|90`. |
| `/api/admin/stats/tools` | GET | admin cookie | Per-tool table rows. `?days=` as above. |
| `/api/reviews/[id]` | PATCH/DELETE | **admin cookie (new)** | Existing moderation endpoints, now protected. |

Admin session cookie: `np_admin`, value `expiry.hmac(expiry, ADMIN_SESSION_SECRET)`
(SHA-256), httpOnly, Secure in prod, SameSite=Lax, 7-day expiry. Middleware verifies
the HMAC and expiry for `/admin/*` (except `/admin/login`) and `/api/admin/*` and
review mutations; failures redirect to `/admin/login` (pages) or 401 (APIs).

## 6. Client tracking & progress sync

- `lib/client/track.ts` — `track(name, tool?, metadata?)`: SSR-guarded,
  `navigator.sendBeacon` with `fetch(keepalive)` fallback, never throws, no await
  required by callers.
- Call sites: converter use (`converter_use`, debounced), practice session start
  (`practice_session`), template insert (`template_use`), and a light `page_view`
  hook in the app layout (fires on route change, no scroll/heatmap tracking).
  `time_saved_vote` stays in the allowlist but gets NO call site now: AI votes are
  already recorded in `tool_usage.time_saved_bucket` via `/api/ai/feedback`, and
  emitting an event too would double-count. The event name is reserved for future
  non-AI tools. Time-saved aggregates read `tool_usage` only.
- `lib/client/progress-sync.ts` — on app load: GET `/api/progress`, merge with
  localStorage by entry timestamp (union of tool-history entries, max of counters),
  write merged result back to localStorage; on local change: debounced (2s) PUT.
  localStorage remains the synchronous read path; offline behavior unchanged.

## 7. Admin UI (`/admin`)

Sidebar shell (desktop: fixed left nav; mobile: top bar + sheet), current design
system tokens only. Sections:

- **Overview** (`/admin`): KPI cards — unique visitors, interactions, AI
  conversations, tokens used, time saved (est.) for the selected range; 30-day
  activity area chart (daily interactions, stacked AI vs non-AI); most-used-tools
  horizontal bar; time-saved vote distribution.
- **Tools** (`/admin/tools`): table per tool — uses, unique users, input/output
  tokens, avg latency, votes; range switch 7/30/90 days.
- **Reviews** (`/admin/reviews`): rebuilt moderation UI (stats strip, pending/
  approved filters, approve/unapprove/delete) using current components; delete
  keeps a confirm step.
- **Login** (`/admin/login`): single password field.

Charts: **Recharts** (new dependency), imported only in admin/impact bundles.
Aggregation lives in `lib/db/analytics-repo.ts` (SQL group-bys; no ORM), consumed
by the stats API routes; pages are client components fetching those routes.
All files < 500 lines; components split per section.

## 8. Public `/impact` page

Server component reading `analytics-repo` directly (no admin API), cached with
`revalidate = 3600`. Report layout:

1. Headline band: people helped (distinct `anon_id`), interactions, AI
   conversations, time saved (self-reported), "live from our database" note.
2. 30-day activity chart (same series as admin, non-interactive render).
3. Most-used tools.
4. Time-saved distribution + up to 3 short approved-review quotes.

Copy stays honest: "self-reported", "since launch (July 2026)". Footer link added.
Noindex is NOT set — the page is meant to be found and cited.

## 9. Error handling

- `/api/events`: invalid name/oversized metadata → 400; DB failure → logged and
  returns 500. The client fire-and-forgets, so no failure is ever user-visible.
- Progress PUT: malformed JSON/oversize → 400; unknown cookie → creates row.
- Stats queries: DB failure → 500 with logged context; dashboard shows per-widget
  error states, never a blank page.
- Metrics/events writes in AI handler remain fire-and-forget (existing rule:
  user-facing AI responses never fail because of telemetry).

## 10. Testing (TDD, repo conventions: injectable fakes, no jest.mock)

- `analytics-repo` tests against a temp local SQLite DB: seeded rows → exact
  expected aggregates (incl. bucket math, distinct anon counting, date ranges).
- Route tests: events allowlist/validation, progress GET/PUT merge contract,
  admin session login/logout/expiry/HMAC tampering, protected review mutations
  (401 without cookie).
- `track.ts`/`progress-sync.ts` unit tests (jsdom, real localStorage per repo rule).
- Component tests: KPI card rendering, reviews moderation actions.
- E2E smoke: login → overview renders KPIs; POST event → appears in stats; PUT
  progress → GET returns it; `/impact` renders with seeded data.

## 11. Environment variables

```
ADMIN_PASSWORD=            # required for admin access
ADMIN_SESSION_SECRET=      # required, HMAC key for session cookie
```

Added to `.env.example` and `.env.local`.

## 12. Build order (three phases, each tested before the next)

1. **Foundation** — schema migration, `np_anon` middleware, `/api/events` +
   `track.ts` + call sites, `/api/progress` + `progress-sync.ts`,
   `tool_usage.anon_id`.
2. **Admin** — auth (login, session, middleware guard, protect review mutations),
   sidebar shell, analytics-repo + stats APIs, Overview, Tools, rebuilt Reviews,
   delete orphaned `lib/utils/review-storage.ts`.
3. **Impact** — `/impact` page + footer link + privacy-policy copy update.

## 13. Risks & mitigations

- **Low early numbers look thin publicly** → impact page copy frames "since
  launch"; owner controls when to add the footer link.
- **Event spam skewing stats** → rate limiting per IP, allowlist, and dashboard
  queries can exclude outlier anon_ids later if needed (not built now — YAGNI).
- **Cookie consent** — `np_anon` is first-party, functional/analytics with no PII;
  privacy policy updated. If a consent banner is ever required for a market, events
  degrade gracefully (anon_id null).
