# Analytics Foundation (Phase 1 of 3) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** First-party event tracking (Turso `events` table), durable anonymous visitor identity (`np_anon` cookie), and server-synced user progress (`user_progress` table) — the data foundation for the admin dashboard (Phase 2) and public impact page (Phase 3).

**Architecture:** New Turso tables written through small injectable repos (matching `lib/db/reviews-repo.ts`). A root `middleware.ts` issues the anonymous cookie. A fire-and-forget client tracker (`lib/client/track.ts`) posts allowlisted events to `POST /api/events`. Existing localStorage tool-history/time-saved become a cache synced through `GET/PUT /api/progress`. AI runs stay in `tool_usage` (now also stamped with `anon_id`) — never duplicated into `events`.

**Tech Stack:** Next.js 15 (App Router), Turso/libSQL, Jest (jsdom default; `@jest-environment node` docblock for server suites). Codebase rules: injectable plain-object fakes, **no `jest.mock()`**, jsdom's real localStorage (never assign `global.localStorage`), files < 500 lines.

**Spec:** `docs/superpowers/specs/2026-07-05-analytics-dashboard-design.md`

**Conventions used throughout:**
- Repo pattern: functions take `deps?: { db?: DbLike }`, resolve the singleton via dynamic import of `@/lib/db/client` (copy `lib/db/reviews-repo.ts:9-46`).
- API pattern: logic in `handler.ts` with injectable deps, `route.ts` only exports HTTP methods (copy `app/api/ai/[tool]/`).
- Run tests with `npx jest <path> -v`. Run all: `npx jest`. Typecheck: `npx tsc --noEmit`.

---

### Task 0: Feature branch

- [ ] **Step 1: Create the branch**

```bash
cd /Users/robertappiah/Documents/phoneticsweb
git checkout -b feature/analytics-foundation
```

Expected: `Switched to a new branch 'feature/analytics-foundation'`. (Current branch `feature/ia-navigation-retention` is clean/merged; branch from it.)

---

### Task 1: Schema — `events`, `user_progress`, `tool_usage.anon_id`

**Files:**
- Modify: `lib/db/schema.sql` (append)
- Modify: `scripts/init-db.mjs` (guarded ALTER)

SQLite has no `ALTER TABLE IF NOT EXISTS column`, so the column add lives in `init-db.mjs` behind a `pragma table_info` check — `schema.sql` stays re-runnable.

- [ ] **Step 1: Append to `lib/db/schema.sql`**

```sql

create table if not exists events (
  id         text primary key,
  name       text not null check (name in
               ('page_view','converter_use','practice_session','template_use','time_saved_vote')),
  tool       text,
  anon_id    text,
  metadata   text,
  created_at text not null default (datetime('now'))
);

create index if not exists idx_events_name_created on events (name, created_at desc);
create index if not exists idx_events_anon_created on events (anon_id, created_at desc);

create table if not exists user_progress (
  anon_id    text primary key,
  data       text not null,
  updated_at text not null default (datetime('now'))
);
```

- [ ] **Step 2: Add guarded column migration to `scripts/init-db.mjs`**

Replace the `try { await db.executeMultiple(schema); ... }` block body so it becomes:

```js
try {
  await db.executeMultiple(schema);

  // Guarded migrations: idempotent column adds that schema.sql cannot express.
  const info = await db.execute("pragma table_info('tool_usage')");
  const hasAnonId = info.rows.some((row) => row.name === 'anon_id');
  if (!hasAnonId) {
    await db.execute('alter table tool_usage add column anon_id text');
    console.log('Added tool_usage.anon_id column.');
  }

  console.log(`Schema applied to ${url.startsWith('file:') ? url : 'Turso database'}.`);
} catch (error) {
  console.error('Failed to apply schema:', error.message);
  process.exit(1);
} finally {
  db.close();
}
```

- [ ] **Step 3: Apply and verify (run twice — second run proves idempotency)**

```bash
npm run db:init && npm run db:init
sqlite3 local.db ".schema events" ".schema user_progress"
sqlite3 local.db "pragma table_info(tool_usage)" | grep anon_id
```

Expected: both runs succeed; `events` and `user_progress` schemas print; `anon_id` row appears.

- [ ] **Step 4: Commit**

```bash
git add lib/db/schema.sql scripts/init-db.mjs
git commit -m "feat(db): add events and user_progress tables, tool_usage.anon_id"
```

---

### Task 2: Event name constants

**Files:**
- Create: `lib/constants/events.ts`
- Test: `lib/constants/__tests__/events.test.ts`

Shared by the client tracker and the server handler — lives in `lib/constants/` (shared-only layer).

- [ ] **Step 1: Write the failing test**

```ts
import { EVENT_NAMES, isEventName } from '../events';

describe('event constants', () => {
  it('allows exactly the five spec event names', () => {
    expect(EVENT_NAMES).toEqual([
      'page_view',
      'converter_use',
      'practice_session',
      'template_use',
      'time_saved_vote',
    ]);
  });

  it('isEventName accepts allowlisted names and rejects everything else', () => {
    expect(isEventName('page_view')).toBe(true);
    expect(isEventName('drop_table')).toBe(false);
    expect(isEventName(42)).toBe(false);
    expect(isEventName(undefined)).toBe(false);
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npx jest lib/constants -v` — Expected: FAIL, cannot find module `../events`.

- [ ] **Step 3: Implement `lib/constants/events.ts`**

```ts
/**
 * Analytics event allowlist. Shared by the client tracker and the
 * /api/events handler. AI tool runs are NOT events — they live in
 * tool_usage. 'time_saved_vote' is reserved (no call site yet): AI
 * votes are recorded via /api/ai/feedback into tool_usage.
 */
export const EVENT_NAMES = [
  'page_view',
  'converter_use',
  'practice_session',
  'template_use',
  'time_saved_vote',
] as const;

export type EventName = (typeof EVENT_NAMES)[number];

export const EVENT_METADATA_MAX_BYTES = 512;
export const EVENT_TOOL_MAX_CHARS = 100;

export function isEventName(value: unknown): value is EventName {
  return typeof value === 'string' && (EVENT_NAMES as readonly string[]).includes(value);
}
```

- [ ] **Step 4: Run to verify pass** — `npx jest lib/constants -v` — Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/constants/events.ts lib/constants/__tests__/events.test.ts
git commit -m "feat(analytics): event name allowlist constants"
```

---

### Task 3: Events repo

**Files:**
- Create: `lib/db/events-repo.ts`
- Test: `lib/db/__tests__/events-repo.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
/**
 * @jest-environment node
 */
import { insertEvent } from '../events-repo';

function fakeDb(rowsAffected = 1) {
  const execute = jest.fn().mockResolvedValue({ rows: [], rowsAffected });
  return { db: { execute }, execute };
}

describe('events repo', () => {
  it('inserts an event with all fields as args', async () => {
    const { db, execute } = fakeDb();

    await insertEvent(
      {
        id: 'evt-1',
        name: 'converter_use',
        tool: 'phonetic-converter',
        anonId: 'anon-1',
        metadata: '{"chars":12}',
      },
      { db }
    );

    const stmt = execute.mock.calls[0][0];
    expect(stmt.sql).toMatch(/insert into events/i);
    expect(stmt.args).toEqual(['evt-1', 'converter_use', 'phonetic-converter', 'anon-1', '{"chars":12}']);
  });

  it('passes nulls for optional fields', async () => {
    const { db, execute } = fakeDb();

    await insertEvent({ id: 'evt-2', name: 'page_view', tool: null, anonId: null, metadata: null }, { db });

    expect(execute.mock.calls[0][0].args).toEqual(['evt-2', 'page_view', null, null, null]);
  });

  it('propagates db failures to the caller', async () => {
    const execute = jest.fn().mockRejectedValue(new Error('db down'));

    await expect(
      insertEvent({ id: 'evt-3', name: 'page_view', tool: null, anonId: null, metadata: null }, { db: { execute } })
    ).rejects.toThrow('db down');
  });
});
```

- [ ] **Step 2: Run to verify failure** — `npx jest lib/db/__tests__/events-repo.test.ts -v` — Expected: FAIL, module not found.

- [ ] **Step 3: Implement `lib/db/events-repo.ts`**

```ts
import type { EventName } from '@/lib/constants/events';

/**
 * Turso-backed inserts for analytics events. Throws on failure — the
 * /api/events handler decides how failures surface (the client never sees them).
 */

export interface DbLike {
  execute(stmt: { sql: string; args?: unknown[] }): Promise<{ rows: unknown[]; rowsAffected: number }>;
}

export interface NewEvent {
  id: string;
  name: EventName;
  tool: string | null;
  anonId: string | null;
  metadata: string | null;
}

async function resolveDb(deps?: { db?: DbLike }): Promise<DbLike> {
  if (deps?.db) return deps.db;
  const { getDb } = await import('./client');
  return getDb() as unknown as DbLike;
}

export async function insertEvent(event: NewEvent, deps?: { db?: DbLike }): Promise<void> {
  const db = await resolveDb(deps);
  await db.execute({
    sql: 'insert into events (id, name, tool, anon_id, metadata) values (?, ?, ?, ?, ?)',
    args: [event.id, event.name, event.tool, event.anonId, event.metadata],
  });
}
```

- [ ] **Step 4: Run to verify pass** — `npx jest lib/db/__tests__/events-repo.test.ts -v` — Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/db/events-repo.ts lib/db/__tests__/events-repo.test.ts
git commit -m "feat(analytics): events repo"
```

---

### Task 4: `POST /api/events`

**Files:**
- Create: `app/api/events/handler.ts`
- Create: `app/api/events/route.ts`
- Test: `app/api/events/__tests__/handler.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { createEventsHandler } from '../handler';

function makeRequest(body: unknown, cookie?: string) {
  return new NextRequest('http://localhost/api/events', {
    method: 'POST',
    body: typeof body === 'string' ? body : JSON.stringify(body),
    headers: cookie ? { cookie: `np_anon=${cookie}` } : {},
  });
}

const allow = { check: jest.fn().mockResolvedValue({ allowed: true, remaining: 9, reset: new Date() }) };

describe('POST /api/events', () => {
  it('records a valid event with anon id from cookie and returns 202', async () => {
    const insert = jest.fn().mockResolvedValue(undefined);
    const handler = createEventsHandler({ insert, limiter: allow });

    const res = await handler(makeRequest({ name: 'converter_use', tool: 'phonetic-converter' }, 'anon-123'));

    expect(res.status).toBe(202);
    const event = insert.mock.calls[0][0];
    expect(event).toMatchObject({ name: 'converter_use', tool: 'phonetic-converter', anonId: 'anon-123' });
    expect(event.id).toMatch(/^[0-9a-f-]{36}$/);
  });

  it('serializes metadata objects to JSON', async () => {
    const insert = jest.fn().mockResolvedValue(undefined);
    const handler = createEventsHandler({ insert, limiter: allow });

    await handler(makeRequest({ name: 'practice_session', metadata: { mode: 'challenge' } }));

    expect(insert.mock.calls[0][0].metadata).toBe('{"mode":"challenge"}');
    expect(insert.mock.calls[0][0].anonId).toBeNull();
  });

  it('rejects unknown event names with 400 and does not insert', async () => {
    const insert = jest.fn();
    const handler = createEventsHandler({ insert, limiter: allow });

    const res = await handler(makeRequest({ name: 'drop_table' }));

    expect(res.status).toBe(400);
    expect(insert).not.toHaveBeenCalled();
  });

  it('rejects invalid JSON with 400', async () => {
    const handler = createEventsHandler({ insert: jest.fn(), limiter: allow });
    expect((await handler(makeRequest('{not json'))).status).toBe(400);
  });

  it('rejects oversized metadata with 400', async () => {
    const insert = jest.fn();
    const handler = createEventsHandler({ insert, limiter: allow });

    const res = await handler(makeRequest({ name: 'page_view', metadata: { pad: 'x'.repeat(600) } }));

    expect(res.status).toBe(400);
    expect(insert).not.toHaveBeenCalled();
  });

  it('rejects over-long tool identifiers with 400', async () => {
    const handler = createEventsHandler({ insert: jest.fn(), limiter: allow });
    const res = await handler(makeRequest({ name: 'page_view', tool: 'x'.repeat(101) }));
    expect(res.status).toBe(400);
  });

  it('returns 429 when rate limited', async () => {
    const limiter = { check: jest.fn().mockResolvedValue({ allowed: false, remaining: 0, reset: new Date() }) };
    const handler = createEventsHandler({ insert: jest.fn(), limiter });
    expect((await handler(makeRequest({ name: 'page_view' }))).status).toBe(429);
  });

  it('returns 500 when the insert fails', async () => {
    const insert = jest.fn().mockRejectedValue(new Error('db down'));
    const handler = createEventsHandler({ insert, limiter: allow });
    expect((await handler(makeRequest({ name: 'page_view' }))).status).toBe(500);
  });
});
```

- [ ] **Step 2: Run to verify failure** — `npx jest app/api/events -v` — Expected: FAIL, module not found.

- [ ] **Step 3: Implement `app/api/events/handler.ts`**

```ts
import { randomUUID } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import {
  EVENT_METADATA_MAX_BYTES,
  EVENT_TOOL_MAX_CHARS,
  isEventName,
} from '@/lib/constants/events';
import { insertEvent, type NewEvent } from '@/lib/db/events-repo';
import { RateLimiter } from '@/lib/utils/rate-limit';
import { logger } from '@/lib/utils/logger';

interface LimiterLike {
  check(request: NextRequest): Promise<{ allowed: boolean; remaining: number; reset: Date }>;
}

interface HandlerDeps {
  insert?: (event: NewEvent) => Promise<void>;
  limiter?: LimiterLike;
}

/**
 * Records one allowlisted analytics event. Clients fire-and-forget, so
 * error statuses here are for correctness, never user-visible.
 */
export function createEventsHandler(deps?: HandlerDeps) {
  const insert = deps?.insert ?? insertEvent;
  const limiter: LimiterLike = deps?.limiter ?? new RateLimiter();

  return async (request: NextRequest): Promise<NextResponse> => {
    const { allowed } = await limiter.check(request);
    if (!allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const { name, tool, metadata } = (body ?? {}) as {
      name?: unknown;
      tool?: unknown;
      metadata?: unknown;
    };

    if (!isEventName(name)) {
      return NextResponse.json({ error: 'Unknown event name' }, { status: 400 });
    }
    if (tool !== undefined && (typeof tool !== 'string' || tool.length > EVENT_TOOL_MAX_CHARS)) {
      return NextResponse.json({ error: 'Invalid tool' }, { status: 400 });
    }

    let metadataJson: string | null = null;
    if (metadata !== undefined) {
      if (typeof metadata !== 'object' || metadata === null || Array.isArray(metadata)) {
        return NextResponse.json({ error: 'Invalid metadata' }, { status: 400 });
      }
      metadataJson = JSON.stringify(metadata);
      if (Buffer.byteLength(metadataJson, 'utf8') > EVENT_METADATA_MAX_BYTES) {
        return NextResponse.json({ error: 'Metadata too large' }, { status: 400 });
      }
    }

    try {
      await insert({
        id: randomUUID(),
        name,
        tool: typeof tool === 'string' ? tool : null,
        anonId: request.cookies.get('np_anon')?.value ?? null,
        metadata: metadataJson,
      });
    } catch (error) {
      logger.error('Failed to record event', error, { context: 'api/events' });
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    return NextResponse.json({ ok: true }, { status: 202 });
  };
}
```

- [ ] **Step 4: Implement `app/api/events/route.ts`**

```ts
import { createEventsHandler } from './handler';

export const POST = createEventsHandler();
```

- [ ] **Step 5: Run to verify pass** — `npx jest app/api/events -v` — Expected: PASS (8 tests).

- [ ] **Step 6: Commit**

```bash
git add app/api/events
git commit -m "feat(analytics): POST /api/events endpoint"
```

---

### Task 5: Anonymous ID middleware

**Files:**
- Create: `middleware.ts` (repo root — none exists today)
- Test: `__tests__/middleware.test.ts`

Runs on the Edge runtime: use `globalThis.crypto.randomUUID()`, NOT `node:crypto`.

- [ ] **Step 1: Write the failing test**

```ts
/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { middleware } from '../middleware';

describe('anonymous id middleware', () => {
  it('sets an np_anon cookie for visitors without one', () => {
    const response = middleware(new NextRequest('http://localhost/'));

    const cookie = response.cookies.get('np_anon');
    expect(cookie?.value).toMatch(/^[0-9a-f-]{36}$/);
    expect(cookie?.httpOnly).toBe(true);
    expect(cookie?.sameSite).toBe('lax');
    expect(cookie?.maxAge).toBe(60 * 60 * 24 * 365);
  });

  it('does not reissue when the cookie already exists', () => {
    const request = new NextRequest('http://localhost/', {
      headers: { cookie: 'np_anon=existing-id' },
    });

    const response = middleware(request);

    expect(response.cookies.get('np_anon')).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run to verify failure** — `npx jest __tests__/middleware.test.ts -v` — Expected: FAIL, module not found.

- [ ] **Step 3: Implement `middleware.ts`**

```ts
import { NextRequest, NextResponse } from 'next/server';

/**
 * Issues a durable anonymous visitor id (np_anon). Random UUID, no PII —
 * used for unique-visitor counts, event attribution, and progress sync.
 */
export function middleware(request: NextRequest): NextResponse {
  const response = NextResponse.next();

  if (!request.cookies.get('np_anon')) {
    response.cookies.set('np_anon', globalThis.crypto.randomUUID(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365,
      path: '/',
    });
  }

  return response;
}

export const config = {
  // Pages and APIs need the cookie; static assets do not.
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map)$).*)'],
};
```

- [ ] **Step 4: Run to verify pass** — `npx jest __tests__/middleware.test.ts -v` — Expected: PASS (2 tests).

- [ ] **Step 5: Verify in the running app**

```bash
npm run dev > /tmp/nato-dev.log 2>&1 &
sleep 5
PORT=$(grep -o 'localhost:[0-9]*' /tmp/nato-dev.log | head -1 | cut -d: -f2)
curl -s -D - -o /dev/null "http://localhost:${PORT}/" | grep -i set-cookie
kill %1
```

Expected: `set-cookie: np_anon=<uuid>; Max-Age=31536000; Path=/; HttpOnly; SameSite=lax`.

- [ ] **Step 6: Commit**

```bash
git add middleware.ts __tests__/middleware.test.ts
git commit -m "feat(analytics): np_anon anonymous visitor cookie middleware"
```

---

### Task 6: Client tracker `track()`

**Files:**
- Create: `lib/client/track.ts`
- Test: `lib/client/__tests__/track.test.ts`

- [ ] **Step 1: Write the failing test** (jsdom default env; restore globals in `afterEach`)

```ts
import { track } from '../track';

describe('track', () => {
  const originalFetch = global.fetch;
  const originalSendBeacon = navigator.sendBeacon;

  afterEach(() => {
    global.fetch = originalFetch;
    Object.defineProperty(navigator, 'sendBeacon', { value: originalSendBeacon, configurable: true });
  });

  it('prefers navigator.sendBeacon with a JSON blob', async () => {
    const sendBeacon = jest.fn().mockReturnValue(true);
    Object.defineProperty(navigator, 'sendBeacon', { value: sendBeacon, configurable: true });

    track('converter_use', 'phonetic-converter', { chars: 12 });

    expect(sendBeacon).toHaveBeenCalledTimes(1);
    const [url, blob] = sendBeacon.mock.calls[0];
    expect(url).toBe('/api/events');
    expect(await (blob as Blob).text()).toBe(
      JSON.stringify({ name: 'converter_use', tool: 'phonetic-converter', metadata: { chars: 12 } })
    );
  });

  it('falls back to fetch keepalive when sendBeacon is unavailable', () => {
    Object.defineProperty(navigator, 'sendBeacon', { value: undefined, configurable: true });
    const fetchMock = jest.fn().mockResolvedValue({ ok: true });
    global.fetch = fetchMock as unknown as typeof fetch;

    track('page_view', '/learn');

    expect(fetchMock).toHaveBeenCalledWith('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'page_view', tool: '/learn' }),
      keepalive: true,
    });
  });

  it('never throws, even when both transports fail', () => {
    Object.defineProperty(navigator, 'sendBeacon', {
      value: jest.fn(() => {
        throw new Error('beacon boom');
      }),
      configurable: true,
    });

    expect(() => track('page_view')).not.toThrow();
  });
});
```

- [ ] **Step 2: Run to verify failure** — `npx jest lib/client/__tests__/track.test.ts -v` — Expected: FAIL, module not found.

- [ ] **Step 3: Implement `lib/client/track.ts`**

```ts
import type { EventName } from '@/lib/constants/events';

/**
 * Fire-and-forget analytics tracker. Never throws, never awaited by callers,
 * SSR-safe. Transport: sendBeacon (survives page unload) → fetch keepalive.
 */
export function track(
  name: EventName,
  tool?: string,
  metadata?: Record<string, unknown>
): void {
  if (typeof window === 'undefined') return;

  try {
    const payload = JSON.stringify({
      name,
      ...(tool !== undefined ? { tool } : {}),
      ...(metadata !== undefined ? { metadata } : {}),
    });

    if (typeof navigator.sendBeacon === 'function') {
      navigator.sendBeacon('/api/events', new Blob([payload], { type: 'application/json' }));
      return;
    }

    void fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
      keepalive: true,
    }).catch(() => {});
  } catch {
    // Telemetry must never affect the user experience.
  }
}
```

- [ ] **Step 4: Run to verify pass** — `npx jest lib/client/__tests__/track.test.ts -v` — Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/client/track.ts lib/client/__tests__/track.test.ts
git commit -m "feat(analytics): fire-and-forget client event tracker"
```

---

### Task 7: Tracking call sites

**Files:**
- Create: `components/analytics/page-view-tracker.tsx`
- Test: `components/analytics/__tests__/page-view-tracker.test.tsx`
- Modify: `app/layout.tsx` (mount tracker inside `<AnalyticsProvider>`, next to `<SimpleAppProvider>`)
- Modify: `components/phonetic/inline-text-converter.tsx` (debounced `converter_use`)
- Modify: `app/practice/simple-practice-client.tsx` (`practice_session` in `handleModeSelect`, line ~14)
- Modify: `components/ai-tools/ai-tool-form.tsx` (`template_use` where `<TemplateStrip>` gets `onSelect`)

- [ ] **Step 1: Write the failing page-view tracker test**

Note: `usePathname` comes from `next/navigation`; in jsdom tests, render with a stubbed pathname via the component's injectable prop (below) — no `jest.mock`.

```tsx
import { render } from '@testing-library/react';
import { PageViewTracker } from '../page-view-tracker';

describe('PageViewTracker', () => {
  const originalSendBeacon = navigator.sendBeacon;

  afterEach(() => {
    Object.defineProperty(navigator, 'sendBeacon', { value: originalSendBeacon, configurable: true });
  });

  it('tracks a page_view for the current pathname', async () => {
    const sendBeacon = jest.fn().mockReturnValue(true);
    Object.defineProperty(navigator, 'sendBeacon', { value: sendBeacon, configurable: true });

    render(<PageViewTracker pathname="/learn" />);

    expect(sendBeacon).toHaveBeenCalledTimes(1);
    const blob = sendBeacon.mock.calls[0][1] as Blob;
    expect(await blob.text()).toContain('"tool":"/learn"');
  });

  it('re-tracks when the pathname changes but not on re-render', () => {
    const sendBeacon = jest.fn().mockReturnValue(true);
    Object.defineProperty(navigator, 'sendBeacon', { value: sendBeacon, configurable: true });

    const { rerender } = render(<PageViewTracker pathname="/learn" />);
    rerender(<PageViewTracker pathname="/learn" />);
    rerender(<PageViewTracker pathname="/tools" />);

    expect(sendBeacon).toHaveBeenCalledTimes(2);
  });
});
```

- [ ] **Step 2: Run to verify failure** — `npx jest components/analytics/__tests__/page-view-tracker.test.tsx -v` — Expected: FAIL.

- [ ] **Step 3: Implement `components/analytics/page-view-tracker.tsx`**

```tsx
'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { track } from '@/lib/client/track';

/**
 * Fires one page_view event per route change. The pathname prop is
 * injectable for tests; production use passes nothing and reads the router.
 */
/**
 * Effect half; exported separately so tests can drive it with an explicit
 * pathname. NEVER wrap usePathname in try/catch — that violates
 * react-hooks/rules-of-hooks and fails `next build` (found in review).
 */
export function PageViewEffect({ pathname }: { pathname: string | null }) {
  useEffect(() => {
    if (pathname) track('page_view', pathname);
  }, [pathname]);

  return null;
}

/** Fires one page_view event per route change. */
export function PageViewTracker() {
  const pathname = usePathname();

  return <PageViewEffect pathname={pathname} />;
}
```

- [ ] **Step 4: Run to verify pass** — Run: `npx jest components/analytics -v` — Expected: PASS (2 tests).

- [ ] **Step 5: Mount in `app/layout.tsx`**

Add import `import { PageViewTracker } from '@/components/analytics/page-view-tracker';` and render `<PageViewTracker />` immediately inside `<AnalyticsProvider>` (before `<SimpleAppProvider>`).

- [ ] **Step 6: Instrument the converter (debounced)**

In `components/phonetic/inline-text-converter.tsx`: add imports `useRef`/`useEffect` (if absent) and `import { track } from '@/lib/client/track';`. Add inside the component:

```tsx
const trackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

useEffect(() => {
  if (!inputText.trim()) return;
  if (trackTimer.current) clearTimeout(trackTimer.current);
  trackTimer.current = setTimeout(() => track('converter_use', 'phonetic-converter'), 2000);
  return () => {
    if (trackTimer.current) clearTimeout(trackTimer.current);
  };
}, [inputText]);
```

(One event per typing burst, not per keystroke. `inputText` is the existing state variable feeding `textToPhonetic` at line ~23.)

- [ ] **Step 7: Instrument practice mode**

In `app/practice/simple-practice-client.tsx`, `handleModeSelect` (line ~14): add `import { track } from '@/lib/client/track';` and as the first line of the handler:

```ts
track('practice_session', mode);
```

- [ ] **Step 8: Instrument template use**

In `components/ai-tools/ai-tool-form.tsx`: add `import { track } from '@/lib/client/track';`. Where `<TemplateStrip ... onSelect={...}>` is rendered (line ~71), wrap the existing onSelect body so it first fires:

```tsx
onSelect={(templateInput) => {
  track('template_use', toolId);
  // ...existing onSelect body (setInput etc.) unchanged...
}}
```

- [ ] **Step 9: Run the full affected suites**

Run: `npx jest components lib/client -v` — Expected: all PASS (existing converter/practice/ai-tool-form tests still green; `track` is SSR-guarded and inert in jsdom unless sendBeacon is stubbed).

- [ ] **Step 10: Commit**

```bash
git add components/analytics app/layout.tsx components/phonetic/inline-text-converter.tsx app/practice/simple-practice-client.tsx components/ai-tools/ai-tool-form.tsx
git commit -m "feat(analytics): page_view, converter_use, practice_session, template_use call sites"
```

---

### Task 8: Stamp `anon_id` onto AI tool usage

**Files:**
- Modify: `lib/ai/metrics.ts` (entry field + SQL)
- Modify: `app/api/ai/[tool]/handler.ts:40-48` (pass cookie value)
- Test: `lib/ai/__tests__/metrics.test.ts`, `app/api/ai/[tool]/__tests__/route.test.ts` (extend)

- [ ] **Step 1: Extend the metrics test** — in `lib/ai/__tests__/metrics.test.ts`, find the existing `recordToolUsage` insert test and update its expected SQL/args; add:

```ts
it('includes anon_id in the insert', async () => {
  const execute = jest.fn().mockResolvedValue({});
  recordToolUsage(
    {
      id: 'u-1',
      toolName: 'summarizer',
      model: 'm',
      inputTokens: 1,
      outputTokens: 2,
      latencyMs: 3,
      sessionHash: 'sh',
      anonId: 'anon-9',
    },
    { db: { execute } }
  );
  await new Promise((resolve) => setTimeout(resolve, 0)); // fire-and-forget settles

  const stmt = execute.mock.calls[0][0];
  expect(stmt.sql).toMatch(/anon_id/i);
  expect(stmt.args).toContain('anon-9');
});
```

- [ ] **Step 2: Run to verify failure** — `npx jest lib/ai/__tests__/metrics.test.ts -v` — Expected: FAIL (TS error: `anonId` not in `ToolUsageEntry`).

- [ ] **Step 3: Update `lib/ai/metrics.ts`**

`ToolUsageEntry` gains `anonId: string | null;`. The insert becomes:

```ts
sql: `insert into tool_usage
        (id, tool_name, model, input_tokens, output_tokens, latency_ms, session_hash, anon_id)
      values (?, ?, ?, ?, ?, ?, ?, ?)`,
args: [
  entry.id,
  entry.toolName,
  entry.model,
  entry.inputTokens,
  entry.outputTokens,
  entry.latencyMs,
  entry.sessionHash,
  entry.anonId,
],
```

- [ ] **Step 4: Update `app/api/ai/[tool]/handler.ts`** — in the `record({...})` call add:

```ts
anonId: request.cookies.get('np_anon')?.value ?? null,
```

Fix any now-failing expectations in `app/api/ai/[tool]/__tests__/route.test.ts` by adding `anonId: null` (or the cookie value if the test sends one) to expected `record` payloads.

- [ ] **Step 5: Run to verify pass** — `npx jest lib/ai app/api/ai -v` — Expected: all PASS.

- [ ] **Step 6: Commit**

```bash
git add lib/ai/metrics.ts app/api/ai lib/ai/__tests__/metrics.test.ts
git commit -m "feat(analytics): stamp anon_id onto tool_usage rows"
```

---

### Task 9: Progress repo

**Files:**
- Create: `lib/db/progress-repo.ts`
- Test: `lib/db/__tests__/progress-repo.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
/**
 * @jest-environment node
 */
import { getProgress, upsertProgress } from '../progress-repo';

describe('progress repo', () => {
  it('returns the stored data JSON for an anon id', async () => {
    const execute = jest.fn().mockResolvedValue({ rows: [{ data: '{"timeSavedMinutes":10}' }], rowsAffected: 0 });

    const data = await getProgress('anon-1', { db: { execute } });

    expect(execute.mock.calls[0][0].sql).toMatch(/select data from user_progress where anon_id = \?/i);
    expect(execute.mock.calls[0][0].args).toEqual(['anon-1']);
    expect(data).toBe('{"timeSavedMinutes":10}');
  });

  it('returns null when no row exists', async () => {
    const execute = jest.fn().mockResolvedValue({ rows: [], rowsAffected: 0 });
    expect(await getProgress('anon-2', { db: { execute } })).toBeNull();
  });

  it('upserts on conflict', async () => {
    const execute = jest.fn().mockResolvedValue({ rows: [], rowsAffected: 1 });

    await upsertProgress('anon-1', '{"timeSavedMinutes":13}', { db: { execute } });

    const stmt = execute.mock.calls[0][0];
    expect(stmt.sql).toMatch(/insert into user_progress/i);
    expect(stmt.sql).toMatch(/on conflict\s*\(anon_id\)\s*do update/i);
    expect(stmt.args).toEqual(['anon-1', '{"timeSavedMinutes":13}']);
  });
});
```

- [ ] **Step 2: Run to verify failure** — `npx jest lib/db/__tests__/progress-repo.test.ts -v` — Expected: FAIL.

- [ ] **Step 3: Implement `lib/db/progress-repo.ts`**

```ts
/**
 * Server-synced user progress, keyed by the np_anon cookie. The data
 * column is an opaque JSON string — the server validates size/shape at
 * the API boundary and never interprets the contents.
 */

export interface DbLike {
  execute(stmt: { sql: string; args?: unknown[] }): Promise<{ rows: unknown[]; rowsAffected: number }>;
}

async function resolveDb(deps?: { db?: DbLike }): Promise<DbLike> {
  if (deps?.db) return deps.db;
  const { getDb } = await import('./client');
  return getDb() as unknown as DbLike;
}

export async function getProgress(anonId: string, deps?: { db?: DbLike }): Promise<string | null> {
  const db = await resolveDb(deps);
  const result = await db.execute({
    sql: 'select data from user_progress where anon_id = ?',
    args: [anonId],
  });
  const row = result.rows[0] as { data?: string } | undefined;
  return row?.data ?? null;
}

export async function upsertProgress(anonId: string, data: string, deps?: { db?: DbLike }): Promise<void> {
  const db = await resolveDb(deps);
  await db.execute({
    sql: `insert into user_progress (anon_id, data) values (?, ?)
          on conflict (anon_id) do update set data = excluded.data, updated_at = datetime('now')`,
    args: [anonId, data],
  });
}
```

- [ ] **Step 4: Run to verify pass** — Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/db/progress-repo.ts lib/db/__tests__/progress-repo.test.ts
git commit -m "feat(progress): user_progress repo"
```

---

### Task 10: `GET/PUT /api/progress`

**Files:**
- Create: `app/api/progress/handler.ts`
- Create: `app/api/progress/route.ts`
- Test: `app/api/progress/__tests__/handler.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { createProgressGetHandler, createProgressPutHandler } from '../handler';

function makeRequest(method: 'GET' | 'PUT', body?: string, cookie?: string) {
  return new NextRequest('http://localhost/api/progress', {
    method,
    ...(body !== undefined ? { body } : {}),
    headers: cookie ? { cookie: `np_anon=${cookie}` } : {},
  });
}

describe('GET /api/progress', () => {
  it('returns stored data for the cookie holder', async () => {
    const get = jest.fn().mockResolvedValue('{"timeSavedMinutes":10}');
    const handler = createProgressGetHandler({ get });

    const res = await handler(makeRequest('GET', undefined, 'anon-1'));

    expect(get).toHaveBeenCalledWith('anon-1');
    expect(await res.json()).toEqual({ data: '{"timeSavedMinutes":10}' });
  });

  it('returns null data without a cookie (no lookup)', async () => {
    const get = jest.fn();
    const handler = createProgressGetHandler({ get });

    const res = await handler(makeRequest('GET'));

    expect(get).not.toHaveBeenCalled();
    expect(await res.json()).toEqual({ data: null });
  });
});

describe('PUT /api/progress', () => {
  it('upserts valid JSON for the cookie holder', async () => {
    const upsert = jest.fn().mockResolvedValue(undefined);
    const handler = createProgressPutHandler({ upsert });

    const res = await handler(makeRequest('PUT', '{"timeSavedMinutes":13,"toolHistory":{}}', 'anon-1'));

    expect(res.status).toBe(200);
    expect(upsert).toHaveBeenCalledWith('anon-1', '{"timeSavedMinutes":13,"toolHistory":{}}');
  });

  it('rejects requests without a cookie', async () => {
    const handler = createProgressPutHandler({ upsert: jest.fn() });
    expect((await handler(makeRequest('PUT', '{}'))).status).toBe(400);
  });

  it('rejects non-object payloads', async () => {
    const handler = createProgressPutHandler({ upsert: jest.fn() });
    expect((await handler(makeRequest('PUT', '"just a string"', 'anon-1'))).status).toBe(400);
    expect((await handler(makeRequest('PUT', '{broken', 'anon-1'))).status).toBe(400);
  });

  it('rejects payloads over 32 KB', async () => {
    const handler = createProgressPutHandler({ upsert: jest.fn() });
    const big = JSON.stringify({ pad: 'x'.repeat(33 * 1024) });
    expect((await handler(makeRequest('PUT', big, 'anon-1'))).status).toBe(400);
  });

  it('returns 500 when the upsert fails', async () => {
    const upsert = jest.fn().mockRejectedValue(new Error('db down'));
    const handler = createProgressPutHandler({ upsert });
    expect((await handler(makeRequest('PUT', '{}', 'anon-1'))).status).toBe(500);
  });
});
```

- [ ] **Step 2: Run to verify failure** — `npx jest app/api/progress -v` — Expected: FAIL.

- [ ] **Step 3: Implement `app/api/progress/handler.ts`**

```ts
import { NextRequest, NextResponse } from 'next/server';
import { getProgress, upsertProgress } from '@/lib/db/progress-repo';
import { logger } from '@/lib/utils/logger';

export const PROGRESS_MAX_BYTES = 32 * 1024;

interface GetDeps {
  get?: (anonId: string) => Promise<string | null>;
}

interface PutDeps {
  upsert?: (anonId: string, data: string) => Promise<void>;
}

export function createProgressGetHandler(deps?: GetDeps) {
  const get = deps?.get ?? getProgress;

  return async (request: NextRequest): Promise<NextResponse> => {
    const anonId = request.cookies.get('np_anon')?.value;
    if (!anonId) return NextResponse.json({ data: null });

    try {
      return NextResponse.json({ data: await get(anonId) });
    } catch (error) {
      logger.error('Failed to load progress', error, { context: 'api/progress' });
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  };
}

export function createProgressPutHandler(deps?: PutDeps) {
  const upsert = deps?.upsert ?? upsertProgress;

  return async (request: NextRequest): Promise<NextResponse> => {
    const anonId = request.cookies.get('np_anon')?.value;
    if (!anonId) return NextResponse.json({ error: 'Missing visitor id' }, { status: 400 });

    const raw = await request.text();
    if (Buffer.byteLength(raw, 'utf8') > PROGRESS_MAX_BYTES) {
      return NextResponse.json({ error: 'Payload too large' }, { status: 400 });
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      return NextResponse.json({ error: 'Progress must be a JSON object' }, { status: 400 });
    }

    try {
      await upsert(anonId, raw);
      return NextResponse.json({ ok: true });
    } catch (error) {
      logger.error('Failed to save progress', error, { context: 'api/progress' });
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  };
}
```

- [ ] **Step 4: Implement `app/api/progress/route.ts`**

```ts
import { createProgressGetHandler, createProgressPutHandler } from './handler';

export const GET = createProgressGetHandler();
export const PUT = createProgressPutHandler();
```

- [ ] **Step 5: Run to verify pass** — `npx jest app/api/progress -v` — Expected: PASS (7 tests).

- [ ] **Step 6: Commit**

```bash
git add app/api/progress
git commit -m "feat(progress): GET/PUT /api/progress endpoints"
```

---

### Task 11: Client progress sync

**Files:**
- Create: `lib/client/progress-sync.ts`
- Test: `lib/client/__tests__/progress-sync.test.ts`
- Modify: `lib/client/tool-history.ts` (notify on change)
- Modify: `lib/client/time-saved.ts` (notify on change)
- Create: `components/analytics/progress-sync-provider.tsx`
- Modify: `app/layout.tsx` (mount next to `<PageViewTracker />`)

Progress JSON shape (client-owned; server treats it as opaque):

```json
{ "toolHistory": { "<toolId>": [{ "inputPreview": "...", "output": "...", "timestamp": 123 }] }, "timeSavedMinutes": 13 }
```

- [ ] **Step 1: Write the failing test** (jsdom; REAL localStorage, cleared in global beforeEach per repo convention)

```ts
import {
  collectLocalProgress,
  mergeProgress,
  applyProgress,
  pullAndMergeProgress,
  notifyProgressChanged,
  __resetSyncStateForTests,
  type ProgressData,
} from '../progress-sync';

const ENTRY_OLD = { inputPreview: 'old', output: 'o1', timestamp: 1000 };
const ENTRY_NEW = { inputPreview: 'new', output: 'o2', timestamp: 2000 };

afterEach(() => {
  jest.useRealTimers();
  __resetSyncStateForTests();
});

describe('collectLocalProgress', () => {
  it('gathers tool-history keys and the time-saved total', () => {
    window.localStorage.setItem('tool-history:summarizer', JSON.stringify([ENTRY_OLD]));
    window.localStorage.setItem('time-saved-minutes', '13');

    expect(collectLocalProgress()).toEqual({
      toolHistory: { summarizer: [ENTRY_OLD] },
      timeSavedMinutes: 13,
    });
  });
});

describe('mergeProgress', () => {
  it('unions entries by timestamp, newest first, capped at 5, and takes the max time saved', () => {
    const local: ProgressData = { toolHistory: { summarizer: [ENTRY_NEW] }, timeSavedMinutes: 5 };
    const remote: ProgressData = { toolHistory: { summarizer: [ENTRY_OLD, ENTRY_NEW] }, timeSavedMinutes: 13 };

    const merged = mergeProgress(local, remote);

    expect(merged.toolHistory.summarizer).toEqual([ENTRY_NEW, ENTRY_OLD]);
    expect(merged.timeSavedMinutes).toBe(13);
  });
});

describe('applyProgress', () => {
  it('writes merged data back to localStorage', () => {
    applyProgress({ toolHistory: { summarizer: [ENTRY_NEW] }, timeSavedMinutes: 8 });

    expect(JSON.parse(window.localStorage.getItem('tool-history:summarizer')!)).toEqual([ENTRY_NEW]);
    expect(window.localStorage.getItem('time-saved-minutes')).toBe('8');
  });
});

describe('pullAndMergeProgress', () => {
  it('merges remote into local and pushes when local adds information', async () => {
    window.localStorage.setItem('tool-history:summarizer', JSON.stringify([ENTRY_NEW]));
    const remote = { toolHistory: { summarizer: [ENTRY_OLD] }, timeSavedMinutes: 13 };
    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ data: JSON.stringify(remote) }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ ok: true }) });
    global.fetch = fetchMock as unknown as typeof fetch;

    await pullAndMergeProgress();

    expect(JSON.parse(window.localStorage.getItem('tool-history:summarizer')!)).toEqual([ENTRY_NEW, ENTRY_OLD]);
    expect(window.localStorage.getItem('time-saved-minutes')).toBe('13');
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[1][0]).toBe('/api/progress');
    expect(fetchMock.mock.calls[1][1].method).toBe('PUT');
  });

  it('does not push when local adds nothing new', async () => {
    const remote = { toolHistory: {}, timeSavedMinutes: 0 };
    const fetchMock = jest
      .fn()
      .mockResolvedValue({ ok: true, json: async () => ({ data: JSON.stringify(remote) }) });
    global.fetch = fetchMock as unknown as typeof fetch;

    await pullAndMergeProgress();

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('swallows network failures', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('offline')) as unknown as typeof fetch;
    await expect(pullAndMergeProgress()).resolves.toBeUndefined();
  });
});

describe('notifyProgressChanged', () => {
  it('debounces pushes (one PUT for rapid changes)', async () => {
    jest.useFakeTimers();
    const fetchMock = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ ok: true }) });
    global.fetch = fetchMock as unknown as typeof fetch;

    notifyProgressChanged();
    notifyProgressChanged();
    notifyProgressChanged();
    jest.advanceTimersByTime(2000);
    await Promise.resolve();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][1].method).toBe('PUT');
  });
});
```

- [ ] **Step 2: Run to verify failure** — `npx jest lib/client/__tests__/progress-sync.test.ts -v` — Expected: FAIL.

- [ ] **Step 3: Implement `lib/client/progress-sync.ts`**

```ts
import type { ToolHistoryEntry } from './tool-history';

/**
 * Syncs localStorage progress (tool history + time saved) with the server
 * copy keyed by the np_anon cookie. localStorage stays the synchronous
 * read path; the server copy survives cleared browsers. All network work
 * is best-effort — failures never surface to the user.
 */

export interface ProgressData {
  toolHistory: Record<string, ToolHistoryEntry[]>;
  timeSavedMinutes: number;
}

const HISTORY_PREFIX = 'tool-history:';
const TIME_SAVED_KEY = 'time-saved-minutes';
const MAX_ENTRIES = 5;
const PUSH_DEBOUNCE_MS = 2000;

let pushTimer: ReturnType<typeof setTimeout> | null = null;

export function __resetSyncStateForTests(): void {
  if (pushTimer) clearTimeout(pushTimer);
  pushTimer = null;
}

export function collectLocalProgress(): ProgressData {
  const toolHistory: Record<string, ToolHistoryEntry[]> = {};
  if (typeof window !== 'undefined') {
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (!key?.startsWith(HISTORY_PREFIX)) continue;
      try {
        const parsed = JSON.parse(window.localStorage.getItem(key) ?? '[]');
        if (Array.isArray(parsed) && parsed.length > 0) {
          toolHistory[key.slice(HISTORY_PREFIX.length)] = parsed;
        }
      } catch {
        // Corrupt entry — skip it.
      }
    }
  }
  const rawMinutes = typeof window === 'undefined' ? 0 : Number(window.localStorage.getItem(TIME_SAVED_KEY));
  return {
    toolHistory,
    timeSavedMinutes: Number.isFinite(rawMinutes) && rawMinutes > 0 ? rawMinutes : 0,
  };
}

export function mergeProgress(local: ProgressData, remote: ProgressData): ProgressData {
  const toolHistory: Record<string, ToolHistoryEntry[]> = {};
  const toolIds = new Set([...Object.keys(local.toolHistory), ...Object.keys(remote.toolHistory)]);

  for (const toolId of toolIds) {
    const seen = new Map<number, ToolHistoryEntry>();
    for (const entry of [...(remote.toolHistory[toolId] ?? []), ...(local.toolHistory[toolId] ?? [])]) {
      if (typeof entry?.timestamp === 'number') seen.set(entry.timestamp, entry);
    }
    toolHistory[toolId] = [...seen.values()].sort((a, b) => b.timestamp - a.timestamp).slice(0, MAX_ENTRIES);
  }

  return {
    toolHistory,
    timeSavedMinutes: Math.max(local.timeSavedMinutes, remote.timeSavedMinutes),
  };
}

export function applyProgress(data: ProgressData): void {
  if (typeof window === 'undefined') return;
  try {
    for (const [toolId, entries] of Object.entries(data.toolHistory)) {
      window.localStorage.setItem(HISTORY_PREFIX + toolId, JSON.stringify(entries));
    }
    window.localStorage.setItem(TIME_SAVED_KEY, String(data.timeSavedMinutes));
  } catch {
    // Storage blocked — best-effort.
  }
}

async function pushProgress(): Promise<void> {
  try {
    await fetch('/api/progress', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(collectLocalProgress()),
      keepalive: true,
    });
  } catch {
    // Offline / blocked — the next change retries.
  }
}

/** Call once on app load: pull server copy, merge, write back both ways. */
export async function pullAndMergeProgress(): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    const response = await fetch('/api/progress');
    const { data } = (await response.json()) as { data: string | null };
    const remote: ProgressData = data ? JSON.parse(data) : { toolHistory: {}, timeSavedMinutes: 0 };
    const local = collectLocalProgress();
    const merged = mergeProgress(local, remote);
    applyProgress(merged);
    if (JSON.stringify(merged) !== JSON.stringify(remote)) {
      await pushProgress();
    }
  } catch {
    // Sync is best-effort; localStorage remains authoritative locally.
  }
}

/** Call after any local progress write; debounced server push. */
export function notifyProgressChanged(): void {
  if (typeof window === 'undefined') return;
  if (pushTimer) clearTimeout(pushTimer);
  pushTimer = setTimeout(() => {
    pushTimer = null;
    void pushProgress();
  }, PUSH_DEBOUNCE_MS);
}
```

- [ ] **Step 4: Run to verify pass** — Expected: PASS (8 tests).

- [ ] **Step 5: Notify from the write paths**

In `lib/client/tool-history.ts`, `addHistoryEntry`: after the `try { window.localStorage.setItem(...) }` block, add `notifyProgressChanged();` (import from `./progress-sync`). Same in `lib/client/time-saved.ts`, `recordLocalTimeSaved` after its `setItem`. (No import cycle: progress-sync imports only the `ToolHistoryEntry` **type**, which is erased at compile time.)

- [ ] **Step 6: Create `components/analytics/progress-sync-provider.tsx` and mount it**

```tsx
'use client';

import { useEffect } from 'react';
import { pullAndMergeProgress } from '@/lib/client/progress-sync';

/** Pulls the server progress copy once per page load and merges it in. */
export function ProgressSyncProvider() {
  useEffect(() => {
    void pullAndMergeProgress();
  }, []);

  return null;
}
```

Mount `<ProgressSyncProvider />` in `app/layout.tsx` next to `<PageViewTracker />`.

- [ ] **Step 7: Run affected suites** — `npx jest lib/client components -v` — Expected: all PASS (existing tool-history/time-saved tests unaffected: `notifyProgressChanged` only sets a timer, and jsdom fetch is never invoked within their runs).

- [ ] **Step 8: Commit**

```bash
git add lib/client components/analytics/progress-sync-provider.tsx app/layout.tsx
git commit -m "feat(progress): client progress sync with server merge"
```

---

### Task 12: Full verification & memory update

- [ ] **Step 1: Full test suite** — Run: `npx jest` — Expected: all suites PASS.
- [ ] **Step 2: Typecheck** — Run: `npx tsc --noEmit` — Expected: no output.
- [ ] **Step 3: E2E smoke against the dev server**

```bash
rm -rf .next && npm run dev > /tmp/nato-dev.log 2>&1 &
sleep 6
PORT=$(grep -o 'localhost:[0-9]*' /tmp/nato-dev.log | head -1 | cut -d: -f2)
# events endpoint
curl -s -w "\n%{http_code}\n" -X POST "http://localhost:${PORT}/api/events" -H 'Content-Type: application/json' --cookie 'np_anon=smoke-anon' -d '{"name":"converter_use","tool":"phonetic-converter"}'
# progress round trip
curl -s -X PUT "http://localhost:${PORT}/api/progress" -H 'Content-Type: application/json' --cookie 'np_anon=smoke-anon' -d '{"toolHistory":{},"timeSavedMinutes":7}'
curl -s "http://localhost:${PORT}/api/progress" --cookie 'np_anon=smoke-anon'
# rows landed
sqlite3 local.db "select name, tool, anon_id from events order by created_at desc limit 1"
sqlite3 local.db "select anon_id, data from user_progress"
kill %1
```

Expected: events POST → `{"ok":true}` / 202; progress GET returns the PUT data; both sqlite queries show the smoke rows.

- [ ] **Step 4: Clear Next.js cache** — Run: `rm -rf .next` (repo rule after each task).
- [ ] **Step 5: Update `claude-memories.md`** — append one line noting: Phase 1 analytics foundation shipped (events + user_progress tables, np_anon middleware, track.ts, progress sync); Phase 2 = admin dashboard, Phase 3 = impact page, per `docs/superpowers/specs/2026-07-05-analytics-dashboard-design.md`.
- [ ] **Step 6: Commit**

```bash
git add claude-memories.md
git commit -m "chore: record analytics foundation completion in memories"
```

---

## Out of scope for this plan (subsequent plans)

- **Phase 2** (`2026-07-05-analytics-admin.md`, to be written after Phase 1 lands): admin auth (ADMIN_PASSWORD/ADMIN_SESSION_SECRET, login page, middleware guard, protecting review mutations), `lib/db/analytics-repo.ts` aggregates, stats APIs, sidebar shell, Overview/Tools pages, Reviews rebuild, Recharts, deleting `lib/utils/review-storage.ts`.
- **Phase 3**: public `/impact` page, footer link, privacy-policy copy.
