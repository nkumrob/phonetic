# Analytics Admin Dashboard (Phase 2 of 3) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Password-protected `/admin` area — Overview dashboard (KPIs + charts over the Phase 1 data), per-tool detail table, rebuilt reviews moderation — plus admin auth that finally protects the review mutation endpoints.

**Architecture:** HMAC-signed session cookie (`np_admin`) issued by `POST /api/admin/session` after an `ADMIN_PASSWORD` check; verified in `middleware.ts` (Edge → WebCrypto, no node:crypto) for `/admin/*`, `/api/admin/*`, and review mutations. Aggregates live in `lib/db/analytics-repo.ts` (tested against a real in-memory libSQL database, not fakes — these are SQL correctness tests), served by `/api/admin/stats/*` routes, rendered by client components using Recharts (the one new dependency).

**Tech Stack:** Next.js 15 App Router, Turso/libSQL, Recharts, Jest (+ real `:memory:` libSQL for repo tests). Codebase rules: no `jest.mock()`, injectable deps, files < 500 lines, current design idiom (see Design Notes).

**Spec:** `docs/superpowers/specs/2026-07-05-analytics-dashboard-design.md` sections 5, 7 (+ 3 for aggregation semantics).

## Design Notes (from codebase exploration — binding)

- Tailwind v3 config; palettes `warmNeutral` (BROWN — never use mid-tones as gray; neutrals are `gray-600`/`gray-500`), `coolBlue` (primary), `warmAmber` (accent, sparingly). Semantic utility classes `.text-secondary`/`.text-tertiary` exist and are current.
- Card idiom (from `app/tools/tools-client.tsx`): `rounded-xl border border-warmNeutral-200 bg-white p-6 shadow-[0_16px_32px_-20px_rgba(92,54,38,0.35)] dark:border-warmNeutral-700 dark:bg-warmNeutral-800`.
- Headlines `font-black tracking-headlines`; kicker idiom `font-mono text-[13px] uppercase tracking-[0.12em] text-tertiary`; numbers in KPI cards use `font-mono`.
- Owner design law: LIGHT theme, professional restraint, no decorative emoji, no gradient washes, no dark sections. Keep `dark:` variants like existing pages do.
- `components/ui` has `Button`, `Card`/`CardHeader`/`CardContent`, `Input`, `LoadingSpinner`, `Skeleton`. No Table/Tabs/Toast — build minimal ad-hoc pieces, do NOT add a component library.
- Admin pages render inside the site's `SimpleHeader`/`Footer` chrome (root layout wraps everything; restructuring into route groups is out of scope). The admin shell is a two-column block inside that chrome.
- `lucide-react` for icons; `cn` from `@/lib/utils/cn`.
- Data-safety law (claude-memories): `user_progress.data` and any user-supplied text rendered in admin (review comments) is attacker-controlled — render as React text nodes only (never `dangerouslySetInnerHTML`).

## Aggregation semantics (spec §3, refined for the `tool` column's polysemy)

- **AI conversations** = rows in `tool_usage` (per range).
- **Interactions** = `events` rows with `name != 'page_view'` + all `tool_usage` rows.
- **Unique visitors** = `count(distinct anon_id)` over the union of `events.anon_id` and `tool_usage.anon_id` (non-null), per range.
- **Tokens** = `sum(input_tokens + output_tokens)` from `tool_usage`, per range.
- **Time saved** = bucket midpoints minutes (`<1`→0.5, `1-5`→3, `5-15`→10, `15+`→20) summed over `tool_usage.time_saved_bucket`, per range. Label "self-reported".
- **Tool leaderboard** merges: `tool_usage` grouped by `tool_name`, plus `events` rows with `name IN ('converter_use','practice_session')` grouped by fixed keys (`phonetic-converter`, `practice`). `template_use` and `page_view` are EXCLUDED from the leaderboard (`template_use.tool` is an AI tool id and would double-count against that tool's runs; `page_view.tool` is a pathname).
- Ranges: 7 | 30 | 90 days, validated server-side; SQLite filter `created_at >= date('now', ?)` with arg `-{days - 1} days` (calendar-day-aligned with dailySeries: midnight of the first series day).

---

### Task 0: Branch + env vars + Recharts

**Files:**
- Modify: `.env.example`, `.env.local`
- Modify: `package.json` (via npm install)

- [ ] **Step 1: Branch**

```bash
cd /Users/robertappiah/Documents/phoneticsweb
git checkout -b feature/analytics-admin
```

- [ ] **Step 2: Install Recharts**

```bash
npm install recharts
```

- [ ] **Step 3: Env vars** — append to BOTH `.env.example` and `.env.local` (read each first; keep formatting):

```
# Admin dashboard
ADMIN_PASSWORD=
ADMIN_SESSION_SECRET=
```

In `.env.local` ONLY, fill in dev values:

```
ADMIN_PASSWORD=dev-admin-password
ADMIN_SESSION_SECRET=dev-admin-session-secret-change-in-production
```

- [ ] **Step 4: Commit**

```bash
git add .env.example package.json package-lock.json
git commit -m "chore(admin): recharts dependency and admin env scaffolding"
```

(`.env.local` is gitignored — never commit it. If `git add .env.example` sweeps other pending edits, stage selectively.)

---

### Task 1: Admin session tokens (Edge-safe HMAC)

**Files:**
- Create: `lib/server/admin-session.ts`
- Test: `lib/server/__tests__/admin-session.test.ts`

WebCrypto (`globalThis.crypto.subtle`) only — this module is imported by `middleware.ts` (Edge runtime). NO `node:crypto`.

- [ ] **Step 1: Failing test**

```ts
/**
 * @jest-environment node
 */
import { createSessionToken, verifySessionToken, SESSION_TTL_MS } from '../admin-session';

const SECRET = 'test-secret';

describe('admin session tokens', () => {
  it('round-trips a valid token', async () => {
    const token = await createSessionToken(SECRET);
    expect(await verifySessionToken(token, SECRET)).toBe(true);
  });

  it('embeds an expiry roughly TTL from now', async () => {
    const token = await createSessionToken(SECRET);
    const expiry = Number(token.split('.')[0]);
    expect(expiry).toBeGreaterThan(Date.now());
    expect(expiry).toBeLessThanOrEqual(Date.now() + SESSION_TTL_MS);
  });

  it('rejects tampered signatures and payloads', async () => {
    const token = await createSessionToken(SECRET);
    const [exp, sig] = token.split('.');
    expect(await verifySessionToken(`${exp}.${'0'.repeat(sig.length)}`, SECRET)).toBe(false);
    expect(await verifySessionToken(`${Number(exp) + 9999}.${sig}`, SECRET)).toBe(false);
  });

  it('rejects expired tokens even with a valid signature', async () => {
    const past = Date.now() - 1000;
    const forged = `${past}.${await signForTest(String(past), SECRET)}`;
    expect(await verifySessionToken(forged, SECRET)).toBe(false);
  });

  it('rejects garbage and wrong secrets', async () => {
    expect(await verifySessionToken('garbage', SECRET)).toBe(false);
    expect(await verifySessionToken('', SECRET)).toBe(false);
    const token = await createSessionToken(SECRET);
    expect(await verifySessionToken(token, 'other-secret')).toBe(false);
  });
});

// Test helper mirroring the module's HMAC so we can forge an expired-but-signed token.
async function signForTest(payload: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
  return Array.from(new Uint8Array(sig), (b) => b.toString(16).padStart(2, '0')).join('');
}
```

- [ ] **Step 2:** `npx jest lib/server -v` → FAIL (module not found).

- [ ] **Step 3: Implement `lib/server/admin-session.ts`**

```ts
/**
 * HMAC-signed admin session tokens: "<expiryMs>.<hexHmac(expiryMs)>".
 * WebCrypto only — verifySessionToken runs in middleware on the Edge
 * runtime, where node:crypto is unavailable.
 */

export const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
export const ADMIN_COOKIE = 'np_admin';

async function hmacHex(payload: string, secret: string): Promise<string> {
  const key = await globalThis.crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await globalThis.crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
  return Array.from(new Uint8Array(sig), (b) => b.toString(16).padStart(2, '0')).join('');
}

export async function createSessionToken(secret: string): Promise<string> {
  const expiry = String(Date.now() + SESSION_TTL_MS);
  return `${expiry}.${await hmacHex(expiry, secret)}`;
}

export async function verifySessionToken(token: string | undefined, secret: string): Promise<boolean> {
  if (!token) return false;
  const dot = token.indexOf('.');
  if (dot <= 0) return false;
  const expiry = token.slice(0, dot);
  const signature = token.slice(dot + 1);
  if (!/^\d+$/.test(expiry) || Number(expiry) <= Date.now()) return false;

  // Constant-time comparison via WebCrypto: decode the hex signature and
  // let crypto.subtle.verify compare. NEVER use === here — attacker-supplied
  // guesses are exactly the candidates a timing oracle needs.
  // (Also: return false when secret is empty — WebCrypto throws on
  // zero-length HMAC keys and we must fail closed, not crash the Edge.)
  return hmacVerify(expiry, signature, secret);
}
// hmacVerify: reject non-hex/odd-length sigs, importKey(['verify']),
// crypto.subtle.verify('HMAC', key, sigBytes, payloadBytes).
```

- [ ] **Step 4:** run to pass (5 tests). **Step 5: Commit** — `git add lib/server` / `feat(admin): edge-safe HMAC session tokens`

---

### Task 2: Login/logout API — `POST/DELETE /api/admin/session`

**Files:**
- Create: `app/api/admin/session/handler.ts`
- Create: `app/api/admin/session/route.ts`
- Test: `app/api/admin/session/__tests__/handler.test.ts`

- [ ] **Step 1: Failing test**

```ts
/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { createLoginHandler, createLogoutHandler } from '../handler';
import { verifySessionToken } from '@/lib/server/admin-session';

const allow = { check: jest.fn().mockResolvedValue({ allowed: true, remaining: 4, reset: new Date() }) };
const ENV = { password: 'correct-horse', secret: 'session-secret' };

function loginRequest(body: unknown) {
  return new NextRequest('http://localhost/api/admin/session', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

describe('POST /api/admin/session (login)', () => {
  it('sets a verifiable np_admin cookie on correct password', async () => {
    const handler = createLoginHandler({ limiter: allow, env: ENV });

    const res = await handler(loginRequest({ password: 'correct-horse' }));

    expect(res.status).toBe(200);
    const cookie = res.cookies.get('np_admin');
    expect(cookie?.httpOnly).toBe(true);
    expect(cookie?.sameSite).toBe('lax');
    expect(await verifySessionToken(cookie?.value, 'session-secret')).toBe(true);
  });

  it('rejects wrong passwords with 401 and no cookie', async () => {
    const handler = createLoginHandler({ limiter: allow, env: ENV });

    const res = await handler(loginRequest({ password: 'wrong' }));

    expect(res.status).toBe(401);
    expect(res.cookies.get('np_admin')).toBeUndefined();
  });

  it('rejects non-string and missing passwords with 400', async () => {
    const handler = createLoginHandler({ limiter: allow, env: ENV });
    expect((await handler(loginRequest({}))).status).toBe(400);
    expect((await handler(loginRequest({ password: 42 }))).status).toBe(400);
  });

  it('returns 503 when ADMIN_PASSWORD is not configured', async () => {
    const handler = createLoginHandler({ limiter: allow, env: { password: '', secret: 's' } });
    expect((await handler(loginRequest({ password: 'x' }))).status).toBe(503);
  });

  it('rate limits login attempts (429)', async () => {
    const deny = { check: jest.fn().mockResolvedValue({ allowed: false, remaining: 0, reset: new Date() }) };
    const handler = createLoginHandler({ limiter: deny, env: ENV });
    expect((await handler(loginRequest({ password: 'correct-horse' }))).status).toBe(429);
  });
});

describe('DELETE /api/admin/session (logout)', () => {
  it('clears the cookie', async () => {
    const handler = createLogoutHandler();
    const res = await handler();

    expect(res.status).toBe(200);
    expect(res.cookies.get('np_admin')?.value).toBe('');
  });
});
```

- [ ] **Step 2:** run → FAIL. **Step 3: Implement `app/api/admin/session/handler.ts`**

```ts
import { timingSafeEqual } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_COOKIE, SESSION_TTL_MS, createSessionToken } from '@/lib/server/admin-session';
import { RateLimiter } from '@/lib/utils/rate-limit';
import { logger } from '@/lib/utils/logger';

interface LimiterLike {
  check(request: NextRequest): Promise<{ allowed: boolean; remaining: number; reset: Date }>;
}

interface AdminEnv {
  password: string;
  secret: string;
}

interface LoginDeps {
  limiter?: LimiterLike;
  env?: AdminEnv;
}

function envFromProcess(): AdminEnv {
  return {
    password: process.env.ADMIN_PASSWORD ?? '',
    secret: process.env.ADMIN_SESSION_SECRET ?? '',
  };
}

function passwordsMatch(supplied: string, expected: string): boolean {
  const a = Buffer.from(supplied);
  const b = Buffer.from(expected);
  // timingSafeEqual requires equal lengths; comparing against a same-length
  // copy of the supplied value keeps the comparison constant-time without
  // leaking the expected length.
  return a.length === b.length ? timingSafeEqual(a, b) : timingSafeEqual(a, Buffer.from(supplied));
}

export function createLoginHandler(deps?: LoginDeps) {
  // Brute-force guard: 5 attempts / 15 min per IP, own namespace.
  const limiter: LimiterLike = deps?.limiter ?? new RateLimiter({ keyPrefix: 'admin-login', max: 5, windowMs: 15 * 60_000 });

  return async (request: NextRequest): Promise<NextResponse> => {
    const { allowed } = await limiter.check(request);
    if (!allowed) {
      return NextResponse.json({ error: 'Too many attempts. Try again later.' }, { status: 429 });
    }

    const env = deps?.env ?? envFromProcess();
    if (!env.password || !env.secret) {
      logger.error('Admin login attempted but ADMIN_PASSWORD/ADMIN_SESSION_SECRET not set', undefined, {
        context: 'api/admin/session',
      });
      return NextResponse.json({ error: 'Admin access is not configured' }, { status: 503 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }
    const password = (body as { password?: unknown })?.password;
    if (typeof password !== 'string' || password.length === 0) {
      return NextResponse.json({ error: 'Password required' }, { status: 400 });
    }

    if (!passwordsMatch(password, env.password)) {
      return NextResponse.json({ error: 'Incorrect password' }, { status: 401 });
    }

    const response = NextResponse.json({ ok: true });
    response.cookies.set(ADMIN_COOKIE, await createSessionToken(env.secret), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_TTL_MS / 1000,
      path: '/',
    });
    return response;
  };
}

export function createLogoutHandler() {
  return async (): Promise<NextResponse> => {
    const response = NextResponse.json({ ok: true });
    response.cookies.set(ADMIN_COOKIE, '', { httpOnly: true, maxAge: 0, path: '/' });
    return response;
  };
}
```

- [ ] **Step 4: `app/api/admin/session/route.ts`**

```ts
import { createLoginHandler, createLogoutHandler } from './handler';

export const POST = createLoginHandler();
export const DELETE = createLogoutHandler();
```

- [ ] **Step 5:** `npx jest app/api/admin -v` → PASS (6 tests); `npx tsc --noEmit` clean.
- [ ] **Step 6: Commit** — `git add app/api/admin` / `feat(admin): login/logout session endpoints`

---

### Task 3: Middleware guard

**Files:**
- Modify: `middleware.ts`
- Test: extend `__tests__/middleware.test.ts`

Guard rules (evaluated BEFORE the np_anon logic; middleware becomes async):
- `/admin/*` except `/admin/login` → invalid/missing `np_admin` ⇒ redirect 307 to `/admin/login`.
- `/api/admin/*` except `/api/admin/session` → invalid ⇒ 401 JSON.
- `/api/reviews/*` with method PATCH or DELETE ⇒ 401 JSON when invalid. (GET/POST stay public: reading approved reviews and submitting new ones.)
- `ADMIN_SESSION_SECRET` unset ⇒ treat every token as invalid (deny, never open).

- [ ] **Step 1: Extend `__tests__/middleware.test.ts`** — add (keep existing tests; set `process.env.ADMIN_SESSION_SECRET = 'test-secret'` in a `beforeEach` for the new describe, delete after):

```ts
import { createSessionToken } from '@/lib/server/admin-session';

describe('admin guard', () => {
  const SECRET = 'test-secret';

  beforeEach(() => {
    process.env.ADMIN_SESSION_SECRET = SECRET;
  });
  afterEach(() => {
    delete process.env.ADMIN_SESSION_SECRET;
  });

  it('redirects unauthenticated /admin pages to /admin/login', async () => {
    const res = await middleware(new NextRequest('http://localhost/admin'));
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toBe('http://localhost/admin/login');
  });

  it('lets /admin/login through without a session', async () => {
    const res = await middleware(new NextRequest('http://localhost/admin/login'));
    expect(res.status).toBe(200);
  });

  it('allows /admin with a valid session cookie', async () => {
    const token = await createSessionToken(SECRET);
    const res = await middleware(
      new NextRequest('http://localhost/admin', { headers: { cookie: `np_admin=${token}` } })
    );
    expect(res.status).toBe(200);
  });

  it('401s /api/admin/* without a session but allows /api/admin/session', async () => {
    expect((await middleware(new NextRequest('http://localhost/api/admin/stats/overview'))).status).toBe(401);
    expect((await middleware(new NextRequest('http://localhost/api/admin/session', { method: 'POST' }))).status).toBe(200);
  });

  it('401s review mutations but not review reads', async () => {
    expect(
      (await middleware(new NextRequest('http://localhost/api/reviews/abc', { method: 'PATCH' }))).status
    ).toBe(401);
    expect(
      (await middleware(new NextRequest('http://localhost/api/reviews/abc', { method: 'DELETE' }))).status
    ).toBe(401);
    expect((await middleware(new NextRequest('http://localhost/api/reviews'))).status).toBe(200);
  });

  it('denies everything when the secret is unset', async () => {
    delete process.env.ADMIN_SESSION_SECRET;
    const token = await createSessionToken(SECRET);
    const res = await middleware(
      new NextRequest('http://localhost/admin', { headers: { cookie: `np_admin=${token}` } })
    );
    expect(res.status).toBe(307);
  });
});
```

NOTE: existing np_anon tests call `middleware(...)` synchronously — update them to `await middleware(...)` (function becomes async).

- [ ] **Step 2:** run → FAIL. **Step 3: Rewrite `middleware.ts`**

```ts
import { NextRequest, NextResponse } from 'next/server';
import { parseAnonId } from './lib/utils/anon-id';
import { ADMIN_COOKIE, verifySessionToken } from './lib/server/admin-session';

const ANON_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 60 * 60 * 24 * 365,
  path: '/',
};

function isGuardedPage(pathname: string): boolean {
  return pathname.startsWith('/admin') && pathname !== '/admin/login';
}

function isGuardedApi(pathname: string, method: string): boolean {
  if (pathname.startsWith('/api/admin') && pathname !== '/api/admin/session') return true;
  if (pathname.startsWith('/api/reviews') && (method === 'PATCH' || method === 'DELETE')) return true;
  return false;
}

async function hasValidAdminSession(request: NextRequest): Promise<boolean> {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) return false; // fail closed
  return verifySessionToken(request.cookies.get(ADMIN_COOKIE)?.value, secret);
}

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  if (isGuardedPage(pathname) && !(await hasValidAdminSession(request))) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }
  if (isGuardedApi(pathname, request.method) && !(await hasValidAdminSession(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const response = NextResponse.next();

  // Anonymous visitor identity (Phase 1): issue on first visit, sliding
  // renewal after; malformed values are replaced, never renewed.
  const existing = request.cookies.get('np_anon');
  const validId = existing ? parseAnonId(existing.value) : null;
  response.cookies.set('np_anon', validId ?? globalThis.crypto.randomUUID(), ANON_COOKIE_OPTIONS);

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map)$).*)'],
};
```

IMPORTANT: read the CURRENT `middleware.ts` first — the np_anon block above must reproduce its existing behavior exactly (sliding renewal + malformed reissue from commits be94a7c/85acda5). If the current code differs from this sketch, keep the current np_anon logic verbatim and only ADD the guard section + async signature.

- [ ] **Step 4:** `npx jest __tests__ -v` → all pass. Full `npx jest` → green. `npx tsc --noEmit` clean.
- [ ] **Step 5:** Live check:

```bash
npm run dev > /tmp/nato-dev.log 2>&1 &
sleep 6
PORT=$(grep -o 'localhost:[0-9]*' /tmp/nato-dev.log | head -1 | cut -d: -f2)
curl -s -o /dev/null -w "unauth admin page: %{http_code} -> %{redirect_url}\n" "http://localhost:${PORT}/admin"
curl -s -o /dev/null -w "unauth stats api: %{http_code}\n" "http://localhost:${PORT}/api/admin/stats/overview"
curl -s -o /dev/null -w "review PATCH: %{http_code}\n" -X PATCH "http://localhost:${PORT}/api/reviews/x"
kill %1
```

Expected: 307 → /admin/login, 401, 401.

- [ ] **Step 6: Commit** — `git add middleware.ts __tests__/middleware.test.ts` / `feat(admin): middleware auth guard for admin pages, stats APIs, review mutations`

---

### Task 4: Analytics repo (real-database tests)

**Files:**
- Create: `lib/db/analytics-repo.ts`
- Test: `lib/db/__tests__/analytics-repo.test.ts`

Tests run against a REAL in-memory libSQL db seeded via `lib/db/schema.sql` — these verify SQL correctness, not call shapes. Time-saved midpoints must match `lib/client/time-saved.ts` (`<1`→0.5, `1-5`→3, `5-15`→10, `15+`→20).

- [ ] **Step 1: Failing test**

```ts
/**
 * @jest-environment node
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createClient, type Client } from '@libsql/client';
import { getOverviewStats, getToolStats, type DbLike } from '../analytics-repo';

let client: Client;
let db: DbLike;

beforeEach(async () => {
  client = createClient({ url: ':memory:' });
  await client.executeMultiple(readFileSync(resolve(process.cwd(), 'lib/db/schema.sql'), 'utf8'));
  // schema.sql's tool_usage predates anon_id (added by init-db.mjs migration) — mirror it here.
  await client.execute('alter table tool_usage add column anon_id text');
  db = client as unknown as DbLike;
});

afterEach(() => client.close());

async function seed() {
  // 2 AI runs today (same visitor), 1 AI run 40 days ago (other visitor)
  await client.execute({
    sql: `insert into tool_usage (id, tool_name, model, input_tokens, output_tokens, latency_ms, session_hash, anon_id, time_saved_bucket, created_at) values
      ('u1','summarizer','m',100,50,900,'sh','aaaaaaaa-0000-0000-0000-000000000001','5-15', datetime('now')),
      ('u2','summarizer','m',200,100,1100,'sh','aaaaaaaa-0000-0000-0000-000000000001', null, datetime('now')),
      ('u3','email-drafter','m',10,5,500,'sh','aaaaaaaa-0000-0000-0000-000000000002','1-5', datetime('now','-40 days'))`,
    args: [],
  });
  // events today: 1 converter use (visitor 3), 1 practice session (visitor 1), 1 page_view, 1 template_use
  await client.execute({
    sql: `insert into events (id, name, tool, anon_id, created_at) values
      ('e1','converter_use','phonetic-converter','aaaaaaaa-0000-0000-0000-000000000003', datetime('now')),
      ('e2','practice_session','learn','aaaaaaaa-0000-0000-0000-000000000001', datetime('now')),
      ('e3','page_view','/tools', 'aaaaaaaa-0000-0000-0000-000000000003', datetime('now')),
      ('e4','template_use','summarizer','aaaaaaaa-0000-0000-0000-000000000001', datetime('now'))`,
    args: [],
  });
}

describe('getOverviewStats', () => {
  it('computes KPIs over the range (30d): visitors, interactions, conversations, tokens, time saved', async () => {
    await seed();

    const stats = await getOverviewStats(30, { db });

    expect(stats.uniqueVisitors).toBe(2); // in-range: visitor ...0001 (u1,u2,e2,e4) and ...0003 (e1,e3); u3's visitor is outside range
    expect(stats.aiConversations).toBe(2); // u1,u2
    expect(stats.interactions).toBe(5); // u1,u2 + e1,e2,e4 (page_view excluded)
    expect(stats.tokens).toBe(450); // (100+50)+(200+100)
    expect(stats.timeSavedMinutes).toBe(10); // one '5-15' vote in range
  });

  it('produces a daily series covering the range with ai/other split', async () => {
    await seed();

    const stats = await getOverviewStats(7, { db });

    const today = stats.dailySeries[stats.dailySeries.length - 1];
    expect(stats.dailySeries).toHaveLength(7);
    expect(today.ai).toBe(2);
    expect(today.other).toBe(3); // converter, practice, template (page_view excluded)
    expect(stats.dailySeries[0].ai + stats.dailySeries[0].other).toBe(0); // empty older day
  });

  it('builds the tool leaderboard excluding template_use and page_view', async () => {
    await seed();

    const stats = await getOverviewStats(30, { db });

    expect(stats.toolLeaderboard).toEqual(
      expect.arrayContaining([
        { tool: 'summarizer', uses: 2 },
        { tool: 'phonetic-converter', uses: 1 },
        { tool: 'practice', uses: 1 },
      ])
    );
    expect(stats.toolLeaderboard.find((t) => t.tool === '/tools')).toBeUndefined();
    expect(stats.toolLeaderboard[0]).toEqual({ tool: 'summarizer', uses: 2 }); // sorted desc
  });

  it('returns the time-saved vote distribution', async () => {
    await seed();
    const stats = await getOverviewStats(30, { db });
    expect(stats.timeSavedDistribution).toEqual([{ bucket: '5-15', votes: 1 }]);
  });
});

describe('getToolStats', () => {
  it('returns per-tool rows for AI tools and event-backed tools', async () => {
    await seed();

    const rows = await getToolStats(30, { db });

    const summarizer = rows.find((r) => r.tool === 'summarizer')!;
    expect(summarizer).toMatchObject({
      uses: 2,
      uniqueUsers: 1,
      inputTokens: 300,
      outputTokens: 150,
      avgLatencyMs: 1000,
      timeSavedVotes: 1,
    });
    const converter = rows.find((r) => r.tool === 'phonetic-converter')!;
    expect(converter).toMatchObject({ uses: 1, uniqueUsers: 1, inputTokens: null, avgLatencyMs: null });
    expect(rows.find((r) => r.tool === 'email-drafter')).toBeUndefined(); // outside range
  });
});
```

- [ ] **Step 2:** run → FAIL (module not found). **Step 3: Implement `lib/db/analytics-repo.ts`**

```ts
/**
 * Read-side aggregates for the admin dashboard and (Phase 3) the public
 * impact page. All queries are range-bound; `days` is validated by the
 * API layer (7|30|90). Time-saved midpoints mirror lib/client/time-saved.ts.
 */

export interface DbLike {
  execute(stmt: { sql: string; args?: unknown[] }): Promise<{ rows: unknown[]; rowsAffected: number }>;
}

export interface DailyPoint {
  date: string; // YYYY-MM-DD
  ai: number;
  other: number;
}

export interface OverviewStats {
  uniqueVisitors: number;
  interactions: number;
  aiConversations: number;
  tokens: number;
  timeSavedMinutes: number;
  dailySeries: DailyPoint[];
  toolLeaderboard: Array<{ tool: string; uses: number }>;
  timeSavedDistribution: Array<{ bucket: string; votes: number }>;
}

export interface ToolStatsRow {
  tool: string;
  uses: number;
  uniqueUsers: number;
  inputTokens: number | null;
  outputTokens: number | null;
  avgLatencyMs: number | null;
  timeSavedVotes: number | null;
}

const TIME_SAVED_MINUTES_SQL = `case time_saved_bucket
  when '<1' then 0.5 when '1-5' then 3 when '5-15' then 10 when '15+' then 20 else 0 end`;

// events whose `tool` value belongs on a tool leaderboard, with the display
// key it maps to. template_use is excluded (its tool is an AI tool id and
// would double-count that tool's runs); page_view's tool is a pathname.
const LEADERBOARD_EVENT_KEYS: Record<string, string> = {
  converter_use: 'phonetic-converter',
  practice_session: 'practice',
};

async function resolveDb(deps?: { db?: DbLike }): Promise<DbLike> {
  if (deps?.db) return deps.db;
  const { getDb } = await import('./client');
  return getDb() as unknown as DbLike;
}

function since(days: number): string {
  return `-${days} days`;
}

function num(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : Number(value) || 0;
}

export async function getOverviewStats(days: number, deps?: { db?: DbLike }): Promise<OverviewStats> {
  const db = await resolveDb(deps);
  const s = since(days);

  const [kpis, visitors, eventsDaily, usageDaily, usageTools, eventTools, distribution] = await Promise.all([
    db.execute({
      sql: `select
        (select count(*) from tool_usage where created_at >= datetime('now', ?)) as ai_conversations,
        (select count(*) from events where name != 'page_view' and created_at >= datetime('now', ?)) as event_interactions,
        (select coalesce(sum(input_tokens + output_tokens), 0) from tool_usage where created_at >= datetime('now', ?)) as tokens,
        (select coalesce(sum(${TIME_SAVED_MINUTES_SQL}), 0) from tool_usage
           where time_saved_bucket is not null and created_at >= datetime('now', ?)) as time_saved`,
      args: [s, s, s, s],
    }),
    db.execute({
      sql: `select count(distinct anon_id) as visitors from (
        select anon_id from events where anon_id is not null and created_at >= datetime('now', ?)
        union
        select anon_id from tool_usage where anon_id is not null and created_at >= datetime('now', ?)
      )`,
      args: [s, s],
    }),
    db.execute({
      sql: `select date(created_at) as day, count(*) as n from events
        where name != 'page_view' and created_at >= datetime('now', ?) group by day`,
      args: [s],
    }),
    db.execute({
      sql: `select date(created_at) as day, count(*) as n from tool_usage
        where created_at >= datetime('now', ?) group by day`,
      args: [s],
    }),
    db.execute({
      sql: `select tool_name as tool, count(*) as uses from tool_usage
        where created_at >= datetime('now', ?) group by tool_name`,
      args: [s],
    }),
    db.execute({
      sql: `select name, count(*) as uses from events
        where name in ('converter_use','practice_session') and created_at >= datetime('now', ?) group by name`,
      args: [s],
    }),
    db.execute({
      sql: `select time_saved_bucket as bucket, count(*) as votes from tool_usage
        where time_saved_bucket is not null and created_at >= datetime('now', ?) group by bucket`,
      args: [s],
    }),
  ]);

  const k = kpis.rows[0] as Record<string, unknown>;
  const aiConversations = num(k.ai_conversations);

  const leaderboard = new Map<string, number>();
  for (const row of usageTools.rows as Array<{ tool: string; uses: unknown }>) {
    leaderboard.set(row.tool, num(row.uses));
  }
  for (const row of eventTools.rows as Array<{ name: string; uses: unknown }>) {
    const key = LEADERBOARD_EVENT_KEYS[row.name];
    if (key) leaderboard.set(key, (leaderboard.get(key) ?? 0) + num(row.uses));
  }

  return {
    uniqueVisitors: num((visitors.rows[0] as Record<string, unknown>).visitors),
    interactions: num(k.event_interactions) + aiConversations,
    aiConversations,
    tokens: num(k.tokens),
    timeSavedMinutes: num(k.time_saved),
    dailySeries: buildDailySeries(days, eventsDaily.rows, usageDaily.rows),
    toolLeaderboard: [...leaderboard.entries()]
      .map(([tool, uses]) => ({ tool, uses }))
      .sort((a, b) => b.uses - a.uses),
    timeSavedDistribution: (distribution.rows as Array<{ bucket: string; votes: unknown }>).map((r) => ({
      bucket: r.bucket,
      votes: num(r.votes),
    })),
  };
}

function buildDailySeries(days: number, eventRows: unknown[], usageRows: unknown[]): DailyPoint[] {
  const other = new Map((eventRows as Array<{ day: string; n: unknown }>).map((r) => [r.day, num(r.n)]));
  const ai = new Map((usageRows as Array<{ day: string; n: unknown }>).map((r) => [r.day, num(r.n)]));

  const series: DailyPoint[] = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() - i);
    const date = d.toISOString().slice(0, 10);
    series.push({ date, ai: ai.get(date) ?? 0, other: other.get(date) ?? 0 });
  }
  return series;
}

export async function getToolStats(days: number, deps?: { db?: DbLike }): Promise<ToolStatsRow[]> {
  const db = await resolveDb(deps);
  const s = since(days);

  const [usage, events] = await Promise.all([
    db.execute({
      sql: `select tool_name as tool, count(*) as uses, count(distinct anon_id) as unique_users,
              sum(input_tokens) as input_tokens, sum(output_tokens) as output_tokens,
              round(avg(latency_ms)) as avg_latency,
              sum(case when time_saved_bucket is not null then 1 else 0 end) as votes
            from tool_usage where created_at >= datetime('now', ?) group by tool_name`,
      args: [s],
    }),
    db.execute({
      sql: `select name, count(*) as uses, count(distinct anon_id) as unique_users from events
            where name in ('converter_use','practice_session') and created_at >= datetime('now', ?) group by name`,
      args: [s],
    }),
  ]);

  const rows: ToolStatsRow[] = (usage.rows as Array<Record<string, unknown>>).map((r) => ({
    tool: String(r.tool),
    uses: num(r.uses),
    uniqueUsers: num(r.unique_users),
    inputTokens: num(r.input_tokens),
    outputTokens: num(r.output_tokens),
    avgLatencyMs: num(r.avg_latency),
    timeSavedVotes: num(r.votes),
  }));

  for (const r of events.rows as Array<Record<string, unknown>>) {
    const key = LEADERBOARD_EVENT_KEYS[String(r.name)];
    if (!key) continue;
    rows.push({
      tool: key,
      uses: num(r.uses),
      uniqueUsers: num(r.unique_users),
      inputTokens: null,
      outputTokens: null,
      avgLatencyMs: null,
      timeSavedVotes: null,
    });
  }

  return rows.sort((a, b) => b.uses - a.uses);
}
```

- [ ] **Step 4:** run to pass. If `:memory:` URL fails with the installed @libsql/client, use `file::memory:` or a temp file path — report which worked. **Step 5:** `npx tsc --noEmit` clean. **Step 6: Commit** — `git add lib/db/analytics-repo.ts lib/db/__tests__/analytics-repo.test.ts` / `feat(admin): analytics aggregation repo with real-db tests`

---

### Task 5: Stats APIs

**Files:**
- Create: `app/api/admin/stats/overview/route.ts`, `app/api/admin/stats/tools/route.ts`, shared `app/api/admin/stats/handler.ts`
- Test: `app/api/admin/stats/__tests__/handler.test.ts`

Auth is enforced by middleware (Task 3); these handlers only validate `days` and delegate.

- [ ] **Step 1: Failing test**

```ts
/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { createStatsHandler } from '../handler';

function req(url: string) {
  return new NextRequest(url);
}

describe('stats handler factory', () => {
  it('passes a validated days param and returns the loader result', async () => {
    const load = jest.fn().mockResolvedValue({ hello: 'world' });
    const handler = createStatsHandler(load);

    const res = await handler(req('http://localhost/api/admin/stats/overview?days=7'));

    expect(load).toHaveBeenCalledWith(7);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ hello: 'world' });
  });

  it('defaults to 30 days and rejects out-of-set values', async () => {
    const load = jest.fn().mockResolvedValue({});
    const handler = createStatsHandler(load);

    await handler(req('http://localhost/api/admin/stats/overview'));
    expect(load).toHaveBeenCalledWith(30);

    expect((await handler(req('http://localhost/api/admin/stats/overview?days=13'))).status).toBe(400);
    expect((await handler(req('http://localhost/api/admin/stats/overview?days=abc'))).status).toBe(400);
  });

  it('maps loader failures to 500', async () => {
    const handler = createStatsHandler(jest.fn().mockRejectedValue(new Error('db down')));
    expect((await handler(req('http://localhost/api/admin/stats/overview?days=30'))).status).toBe(500);
  });
});
```

- [ ] **Step 2:** run → FAIL. **Step 3: Implement `app/api/admin/stats/handler.ts`**

```ts
import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/utils/logger';

const ALLOWED_DAYS = [7, 30, 90] as const;

/**
 * Shared factory for admin stats endpoints. Auth is enforced upstream by
 * middleware; this layer only validates the range and shapes errors.
 */
export function createStatsHandler(load: (days: number) => Promise<unknown>) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const raw = request.nextUrl.searchParams.get('days');
    const days = raw === null ? 30 : Number(raw);
    if (!ALLOWED_DAYS.includes(days as (typeof ALLOWED_DAYS)[number])) {
      return NextResponse.json({ error: 'days must be 7, 30, or 90' }, { status: 400 });
    }

    try {
      return NextResponse.json(await load(days));
    } catch (error) {
      logger.error('Failed to load admin stats', error, { context: 'api/admin/stats' });
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  };
}
```

`app/api/admin/stats/overview/route.ts`:

```ts
import { getOverviewStats } from '@/lib/db/analytics-repo';
import { createStatsHandler } from '../handler';

export const GET = createStatsHandler((days) => getOverviewStats(days));
```

`app/api/admin/stats/tools/route.ts`:

```ts
import { getToolStats } from '@/lib/db/analytics-repo';
import { createStatsHandler } from '../handler';

export const GET = createStatsHandler((days) => getToolStats(days));
```

- [ ] **Step 4:** `npx jest app/api/admin -v` → pass; tsc clean. **Step 5: Commit** — `feat(admin): stats API endpoints`

---

### Task 6: Admin shell + login page

**Files:**
- Create: `app/admin/layout.tsx` (noindex metadata + shell)
- Create: `components/admin/admin-shell.tsx`
- Create: `app/admin/login/page.tsx` + `components/admin/login-form.tsx`
- Test: `components/admin/__tests__/login-form.test.tsx`

- [ ] **Step 1: `app/admin/layout.tsx`**

```tsx
import type { Metadata } from 'next';
import { AdminShell } from '@/components/admin/admin-shell';

export const metadata: Metadata = {
  title: 'Admin | natophonetic.com',
  robots: 'noindex, nofollow',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
```

- [ ] **Step 2: `components/admin/admin-shell.tsx`** — client component. Sidebar on `md+` (sticky, w-56), horizontal tab strip below `md`. Uses `usePathname` for the active link. `/admin/login` renders children bare (no chrome). Nav items: Overview `/admin` (LayoutDashboard icon), Tools `/admin/tools` (Wrench), Reviews `/admin/reviews` (MessageSquare). Logout button at the bottom: `fetch('/api/admin/session', { method: 'DELETE' })` then `window.location.href = '/admin/login'`. Idiom:

```tsx
'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, Wrench, MessageSquare, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const NAV = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/tools', label: 'Tools', icon: Wrench },
  { href: '/admin/reviews', label: 'Reviews', icon: MessageSquare },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname === '/admin/login') return <>{children}</>;

  async function logout() {
    await fetch('/api/admin/session', { method: 'DELETE' });
    window.location.href = '/admin/login';
  }

  return (
    <div className="container px-6 py-10 md:px-8">
      <p className="font-mono text-[13px] uppercase tracking-[0.12em] text-tertiary">Admin</p>
      <div className="mt-6 flex flex-col gap-8 md:flex-row">
        <nav className="flex gap-2 md:w-56 md:flex-col md:gap-1" aria-label="Admin">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors',
                  active
                    ? 'bg-coolBlue-600 text-white'
                    : 'text-gray-600 hover:bg-warmNeutral-100 dark:text-warmNeutral-200 dark:hover:bg-warmNeutral-800'
                )}
              >
                <Icon className="h-4 w-4" aria-hidden />
                {label}
              </Link>
            );
          })}
          <button
            onClick={logout}
            className="mt-2 flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-gray-500 hover:bg-warmNeutral-100 md:mt-8 dark:text-warmNeutral-300 dark:hover:bg-warmNeutral-800"
          >
            <LogOut className="h-4 w-4" aria-hidden />
            Log out
          </button>
        </nav>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Login — failing test first** (`components/admin/__tests__/login-form.test.tsx`):

```tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LoginForm } from '../login-form';

describe('LoginForm', () => {
  const originalFetch = global.fetch;
  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('posts the password and navigates on success', async () => {
    const fetchMock = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ ok: true }) });
    global.fetch = fetchMock as unknown as typeof fetch;
    const onSuccess = jest.fn();

    render(<LoginForm onSuccess={onSuccess} />);
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'hunter2' } });
    fireEvent.click(screen.getByRole('button', { name: /log in/i }));

    await waitFor(() => expect(onSuccess).toHaveBeenCalled());
    expect(fetchMock).toHaveBeenCalledWith('/api/admin/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: 'hunter2' }),
    });
  });

  it('shows the server error message on failure', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Incorrect password' }),
    }) as unknown as typeof fetch;

    render(<LoginForm onSuccess={jest.fn()} />);
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'nope' } });
    fireEvent.click(screen.getByRole('button', { name: /log in/i }));

    expect(await screen.findByText('Incorrect password')).toBeInTheDocument();
  });
});
```

- [ ] **Step 4: Implement `components/admin/login-form.tsx`**

```tsx
'use client';

import { useState } from 'react';
import { Button, Input } from '@/components/ui';

export function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        onSuccess();
        return;
      }
      const body = (await res.json().catch(() => null)) as { error?: string } | null;
      setError(body?.error ?? 'Login failed');
    } catch {
      setError('Network error. Try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label htmlFor="admin-password" className="mb-1 block text-sm font-semibold">
          Password
        </label>
        <Input
          id="admin-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
        />
      </div>
      {error && (
        <p role="alert" className="text-sm font-semibold text-error">
          {error}
        </p>
      )}
      <Button type="submit" disabled={busy || password.length === 0} className="w-full">
        {busy ? 'Checking…' : 'Log in'}
      </Button>
    </form>
  );
}
```

`app/admin/login/page.tsx` (client page):

```tsx
'use client';

import { useRouter } from 'next/navigation';
import { LoginForm } from '@/components/admin/login-form';

export default function AdminLoginPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-6">
      <div className="w-full max-w-sm rounded-xl border border-warmNeutral-200 bg-white p-8 shadow-[0_16px_32px_-20px_rgba(92,54,38,0.35)] dark:border-warmNeutral-700 dark:bg-warmNeutral-800">
        <p className="font-mono text-[13px] uppercase tracking-[0.12em] text-tertiary">Admin access</p>
        <h1 className="mt-2 text-2xl font-black tracking-headlines">Log in</h1>
        <div className="mt-6">
          <LoginForm onSuccess={() => router.push('/admin')} />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 5:** `npx jest components/admin -v` → pass; tsc clean. **Step 6: Commit** — `feat(admin): shell, login page`

---

### Task 7: Dashboard widgets (KPI cards + Recharts)

**Files:**
- Create: `components/admin/kpi-card.tsx`, `components/admin/range-switcher.tsx`, `components/admin/activity-chart.tsx`, `components/admin/leaderboard-chart.tsx`, `components/admin/votes-list.tsx`
- Test: `components/admin/__tests__/kpi-card.test.tsx`, `components/admin/__tests__/range-switcher.test.tsx`

Recharts renders SVG poorly in jsdom — chart components get NO jsdom tests (they're covered by the build + live verification); test the pure components.

- [ ] **Step 1: Failing tests**

```tsx
// components/admin/__tests__/kpi-card.test.tsx
import { render, screen } from '@testing-library/react';
import { KpiCard } from '../kpi-card';

describe('KpiCard', () => {
  it('renders label, formatted value, and hint', () => {
    render(<KpiCard label="Tokens used" value={2100456} hint="input + output" />);
    expect(screen.getByText('Tokens used')).toBeInTheDocument();
    expect(screen.getByText('2,100,456')).toBeInTheDocument();
    expect(screen.getByText('input + output')).toBeInTheDocument();
  });

  it('renders string values verbatim', () => {
    render(<KpiCard label="Time saved" value="~48 hours" />);
    expect(screen.getByText('~48 hours')).toBeInTheDocument();
  });
});
```

```tsx
// components/admin/__tests__/range-switcher.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { RangeSwitcher } from '../range-switcher';

describe('RangeSwitcher', () => {
  it('marks the active range and reports changes', () => {
    const onChange = jest.fn();
    render(<RangeSwitcher value={30} onChange={onChange} />);

    expect(screen.getByRole('button', { name: '30d' })).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(screen.getByRole('button', { name: '90d' }));
    expect(onChange).toHaveBeenCalledWith(90);
  });
});
```

- [ ] **Step 2:** run → FAIL. **Step 3: Implement**

`components/admin/kpi-card.tsx`:

```tsx
export function KpiCard({ label, value, hint }: { label: string; value: number | string; hint?: string }) {
  return (
    <div className="rounded-xl border border-warmNeutral-200 bg-white p-5 dark:border-warmNeutral-700 dark:bg-warmNeutral-800">
      <p className="text-xs font-bold uppercase tracking-widest text-tertiary">{label}</p>
      <p className="mt-2 font-mono text-3xl font-bold tracking-tight">
        {typeof value === 'number' ? value.toLocaleString('en-US') : value}
      </p>
      {hint && <p className="mt-1 text-xs text-tertiary">{hint}</p>}
    </div>
  );
}
```

`components/admin/range-switcher.tsx`:

```tsx
'use client';

import { cn } from '@/lib/utils/cn';

const RANGES = [7, 30, 90] as const;
export type StatsRange = (typeof RANGES)[number];

export function RangeSwitcher({ value, onChange }: { value: StatsRange; onChange: (days: StatsRange) => void }) {
  return (
    <div className="inline-flex gap-1 rounded-lg border border-warmNeutral-200 p-1 dark:border-warmNeutral-700">
      {RANGES.map((days) => (
        <button
          key={days}
          aria-pressed={value === days}
          onClick={() => onChange(days)}
          className={cn(
            'rounded-md px-3 py-1 font-mono text-xs font-bold',
            value === days ? 'bg-coolBlue-600 text-white' : 'text-gray-600 hover:bg-warmNeutral-100 dark:text-warmNeutral-200'
          )}
        >
          {days}d
        </button>
      ))}
    </div>
  );
}
```

`components/admin/activity-chart.tsx` ('use client'; Recharts `AreaChart` in a `ResponsiveContainer height={280}`; two stacked areas — `ai` in `#2563EB` (coolBlue-600), `other` in `#93C5FD` (coolBlue-300); `XAxis dataKey="date"` with `tickFormatter` slicing to `MM-DD`, CartesianGrid `strokeDasharray="3 3"`, Tooltip. Props: `{ data: Array<{date: string; ai: number; other: number}> }`.)

`components/admin/leaderboard-chart.tsx` ('use client'; Recharts horizontal `BarChart layout="vertical"` height 40 per row + 40 padding; `dataKey="uses"` fill `#2563EB`, YAxis `dataKey="tool"` width 140 `type="category"`, XAxis `type="number"` `allowDecimals={false}`. Props: `{ data: Array<{tool: string; uses: number}> }`.)

`components/admin/votes-list.tsx` (pure, no recharts): renders the time-saved distribution as labeled rows with proportional bars:

```tsx
const BUCKET_LABELS: Record<string, string> = {
  '<1': 'Under a minute',
  '1-5': '1–5 minutes',
  '5-15': '5–15 minutes',
  '15+': '15+ minutes',
};

export function VotesList({ data }: { data: Array<{ bucket: string; votes: number }> }) {
  const max = Math.max(1, ...data.map((d) => d.votes));
  const ordered = ['<1', '1-5', '5-15', '15+']
    .map((bucket) => ({ bucket, votes: data.find((d) => d.bucket === bucket)?.votes ?? 0 }));

  return (
    <ul className="space-y-2">
      {ordered.map(({ bucket, votes }) => (
        <li key={bucket} className="flex items-center gap-3 text-sm">
          <span className="w-32 shrink-0 text-gray-600 dark:text-warmNeutral-200">{BUCKET_LABELS[bucket]}</span>
          <span className="h-2 rounded-full bg-coolBlue-500" style={{ width: `${(votes / max) * 100}%` }} aria-hidden />
          <span className="font-mono text-xs font-bold">{votes}</span>
        </li>
      ))}
    </ul>
  );
}
```

- [ ] **Step 4:** `npx jest components/admin -v` → pass; tsc clean. **Step 5: Commit** — `feat(admin): dashboard widget components`

---

### Task 8: Overview + Tools pages

**Files:**
- Create: `app/admin/page.tsx` (thin server wrapper) + `components/admin/overview-dashboard.tsx` (client, does the fetching)
- Create: `app/admin/tools/page.tsx` + `components/admin/tools-table.tsx`
- Test: `components/admin/__tests__/overview-dashboard.test.tsx`, `components/admin/__tests__/tools-table.test.tsx`

- [ ] **Step 1: Failing tests**

```tsx
// components/admin/__tests__/overview-dashboard.test.tsx
import { render, screen } from '@testing-library/react';
import { OverviewDashboard } from '../overview-dashboard';

const STATS = {
  uniqueVisitors: 42,
  interactions: 128,
  aiConversations: 30,
  tokens: 21000,
  timeSavedMinutes: 95,
  dailySeries: [{ date: '2026-07-05', ai: 3, other: 5 }],
  toolLeaderboard: [{ tool: 'summarizer', uses: 12 }],
  timeSavedDistribution: [{ bucket: '5-15', votes: 4 }],
};

describe('OverviewDashboard', () => {
  const originalFetch = global.fetch;
  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('loads stats and renders the KPI cards', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => STATS }) as unknown as typeof fetch;

    render(<OverviewDashboard />);

    expect(await screen.findByText('42')).toBeInTheDocument();
    expect(screen.getByText('128')).toBeInTheDocument();
    expect(screen.getByText(/1\.6 hours|95/)).toBeInTheDocument(); // formatted time saved
    expect(global.fetch).toHaveBeenCalledWith('/api/admin/stats/overview?days=30');
  });

  it('shows an error state when the fetch fails', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false, json: async () => ({}) }) as unknown as typeof fetch;

    render(<OverviewDashboard />);

    expect(await screen.findByRole('alert')).toHaveTextContent(/could not load/i);
  });
});
```

```tsx
// components/admin/__tests__/tools-table.test.tsx
import { render, screen } from '@testing-library/react';
import { ToolsTable } from '../tools-table';

describe('ToolsTable', () => {
  it('renders AI rows with metrics and event rows with em-dashes', () => {
    render(
      <ToolsTable
        rows={[
          { tool: 'summarizer', uses: 12, uniqueUsers: 4, inputTokens: 1000, outputTokens: 500, avgLatencyMs: 900, timeSavedVotes: 3 },
          { tool: 'phonetic-converter', uses: 7, uniqueUsers: 5, inputTokens: null, outputTokens: null, avgLatencyMs: null, timeSavedVotes: null },
        ]}
      />
    );

    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByText('summarizer')).toBeInTheDocument();
    expect(screen.getByText('1,000')).toBeInTheDocument();
    const converterRow = screen.getByText('phonetic-converter').closest('tr')!;
    expect(converterRow.textContent).toContain('—');
  });
});
```

- [ ] **Step 2:** run → FAIL. **Step 3: Implement**

`components/admin/overview-dashboard.tsx` ('use client'): state `{days: StatsRange; stats: OverviewStats | null; error: boolean}`; `useEffect` on `days` fetching `/api/admin/stats/overview?days=${days}`; layout:

```tsx
'use client';

import { useEffect, useState } from 'react';
import type { OverviewStats } from '@/lib/db/analytics-repo';
import { LoadingSpinner } from '@/components/ui';
import { formatTimeSaved } from '@/lib/client/time-saved';
import { KpiCard } from './kpi-card';
import { RangeSwitcher, type StatsRange } from './range-switcher';
import { ActivityChart } from './activity-chart';
import { LeaderboardChart } from './leaderboard-chart';
import { VotesList } from './votes-list';

export function OverviewDashboard() {
  const [days, setDays] = useState<StatsRange>(30);
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setError(false);
    setStats(null);
    fetch(`/api/admin/stats/overview?days=${days}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
      .then((data) => {
        if (!cancelled) setStats(data as OverviewStats);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [days]);

  if (error) {
    return (
      <p role="alert" className="rounded-xl border border-error/30 bg-white p-6 text-sm font-semibold dark:bg-warmNeutral-800">
        Could not load stats. Check the database connection and refresh.
      </p>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-black tracking-headlines">Overview</h1>
        <RangeSwitcher value={days} onChange={setDays} />
      </div>

      {!stats ? (
        <div className="flex justify-center py-24">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
            <KpiCard label="Unique visitors" value={stats.uniqueVisitors} />
            <KpiCard label="Interactions" value={stats.interactions} hint="tool uses, excl. page views" />
            <KpiCard label="AI conversations" value={stats.aiConversations} />
            <KpiCard label="Tokens used" value={stats.tokens} hint="input + output" />
            <KpiCard label="Time saved" value={`~${formatTimeSaved(stats.timeSavedMinutes).replace('~', '')}`} hint="self-reported" />
          </div>

          <section className="rounded-xl border border-warmNeutral-200 bg-white p-6 dark:border-warmNeutral-700 dark:bg-warmNeutral-800">
            <h2 className="mb-4 text-lg font-bold">Daily activity</h2>
            <ActivityChart data={stats.dailySeries} />
          </section>

          <div className="grid gap-4 lg:grid-cols-2">
            <section className="rounded-xl border border-warmNeutral-200 bg-white p-6 dark:border-warmNeutral-700 dark:bg-warmNeutral-800">
              <h2 className="mb-4 text-lg font-bold">Most-used tools</h2>
              <LeaderboardChart data={stats.toolLeaderboard.slice(0, 8)} />
            </section>
            <section className="rounded-xl border border-warmNeutral-200 bg-white p-6 dark:border-warmNeutral-700 dark:bg-warmNeutral-800">
              <h2 className="mb-4 text-lg font-bold">Time-saved votes</h2>
              <VotesList data={stats.timeSavedDistribution} />
            </section>
          </div>
        </>
      )}
    </div>
  );
}
```

(If `formatTimeSaved` double-tildes awkwardly, render `formatTimeSaved(stats.timeSavedMinutes)` directly — match the existing helper's output; adjust the test regex accordingly.)

`app/admin/page.tsx`:

```tsx
import { OverviewDashboard } from '@/components/admin/overview-dashboard';

export default function AdminOverviewPage() {
  return <OverviewDashboard />;
}
```

`components/admin/tools-table.tsx` (pure presentational; `rows: ToolStatsRow[]`): semantic `<table>` with mono numerals, `—` for nulls:

```tsx
import type { ToolStatsRow } from '@/lib/db/analytics-repo';

const COLUMNS = ['Tool', 'Uses', 'Unique users', 'Input tokens', 'Output tokens', 'Avg latency', 'Votes'];

function cell(value: number | null, suffix = ''): string {
  return value === null ? '—' : `${value.toLocaleString('en-US')}${suffix}`;
}

export function ToolsTable({ rows }: { rows: ToolStatsRow[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-warmNeutral-200 bg-white dark:border-warmNeutral-700 dark:bg-warmNeutral-800">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-warmNeutral-200 text-left dark:border-warmNeutral-700">
            {COLUMNS.map((col) => (
              <th key={col} className="px-4 py-3 text-xs font-bold uppercase tracking-widest text-tertiary">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.tool} className="border-b border-warmNeutral-100 last:border-0 dark:border-warmNeutral-700/50">
              <td className="px-4 py-3 font-semibold">{row.tool}</td>
              <td className="px-4 py-3 font-mono">{row.uses.toLocaleString('en-US')}</td>
              <td className="px-4 py-3 font-mono">{row.uniqueUsers.toLocaleString('en-US')}</td>
              <td className="px-4 py-3 font-mono">{cell(row.inputTokens)}</td>
              <td className="px-4 py-3 font-mono">{cell(row.outputTokens)}</td>
              <td className="px-4 py-3 font-mono">{cell(row.avgLatencyMs, ' ms')}</td>
              <td className="px-4 py-3 font-mono">{cell(row.timeSavedVotes)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

`app/admin/tools/page.tsx` + `components/admin/tools-view.tsx` ('use client'): same fetch/range pattern as OverviewDashboard against `/api/admin/stats/tools?days=`, heading "Tools", renders `<ToolsTable rows={...} />`, LoadingSpinner + error alert states. Keep it a separate small client component (`tools-view.tsx`), page is a thin wrapper.

- [ ] **Step 4:** `npx jest components/admin -v` → pass; tsc clean. **Step 5: Commit** — `feat(admin): overview dashboard and tools pages`

---

### Task 9: Reviews moderation rebuild

**Files:**
- Rewrite: `app/admin/reviews/page.tsx` (thin wrapper) — DELETE `app/admin/reviews/layout.tsx` (the new `app/admin/layout.tsx` covers noindex + shell)
- Create: `components/admin/reviews-moderation.tsx` + `components/admin/review-moderation-card.tsx`
- Test: `components/admin/__tests__/reviews-moderation.test.tsx`
- Delete: `lib/utils/review-storage.ts` (verified zero importers)

Keep the existing behavior (filter pending/approved/all via `/api/reviews?approved=`, PATCH approve/unapprove, DELETE with confirm) but in the current design idiom, without `alert()` (inline error banner instead), split across two files. Review text is user-supplied — render as text nodes only.

- [ ] **Step 1: Failing test** (`components/admin/__tests__/reviews-moderation.test.tsx`):

```tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ReviewsModeration } from '../reviews-moderation';

const REVIEW = {
  id: 'r1',
  name: 'Alice',
  rating: 5,
  title: 'Great',
  comment: 'Very useful',
  date: '2026-07-01T00:00:00.000Z',
  verified: false,
  approved: false,
  helpful: 0,
};

describe('ReviewsModeration', () => {
  const originalFetch = global.fetch;
  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('loads pending reviews by default and approves one', async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ reviews: [REVIEW] }) }) // initial list
      .mockResolvedValueOnce({ ok: true, json: async () => ({ review: { ...REVIEW, approved: true } }) }) // PATCH
      .mockResolvedValueOnce({ ok: true, json: async () => ({ reviews: [] }) }); // reload
    global.fetch = fetchMock as unknown as typeof fetch;

    render(<ReviewsModeration />);

    expect(await screen.findByText('Alice')).toBeInTheDocument();
    expect(fetchMock.mock.calls[0][0]).toContain('approved=false');

    fireEvent.click(screen.getByRole('button', { name: /approve/i }));

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith('/api/reviews/r1', expect.objectContaining({ method: 'PATCH' }))
    );
  });

  it('shows an inline error banner when an action fails (no alert)', async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ reviews: [REVIEW] }) })
      .mockResolvedValueOnce({ ok: false, json: async () => ({ error: 'Unauthorized' }) });
    global.fetch = fetchMock as unknown as typeof fetch;

    render(<ReviewsModeration />);
    fireEvent.click(await screen.findByRole('button', { name: /approve/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/unauthorized|failed/i);
  });
});
```

- [ ] **Step 2:** run → FAIL. **Step 3: Implement** — `reviews-moderation.tsx` ('use client'): state `{filter: 'pending'|'approved'|'all', reviews, error, processing}`; loads via `/api/reviews?approved=false|true|` (omit param for all); filter buttons styled like RangeSwitcher; count tiles (Total / Pending / Approved) as small KpiCards; renders `ReviewModerationCard` per review with Approve / Unapprove / Delete (delete keeps `confirm()` — a native confirm is fine, it's the `alert()` error reporting that gets replaced by the banner). Inline `role="alert"` banner at the top on any failed action. `review-moderation-card.tsx`: current card idiom, `StarRating` from `@/components/reviews`, name + verified check + status pill (`bg-warmAmber-100 text-warmAmber-800` pending / `bg-success/10 text-success` approved), comment as plain text, date via `new Date(review.date).toLocaleDateString()`, action buttons (Button variants primary/secondary; delete styled `text-error`).

`app/admin/reviews/page.tsx`:

```tsx
import { ReviewsModeration } from '@/components/admin/reviews-moderation';

export default function AdminReviewsPage() {
  return <ReviewsModeration />;
}
```

- [ ] **Step 4:** Delete `app/admin/reviews/layout.tsx` and `lib/utils/review-storage.ts`. Verify: `rg -l "review-storage" app components lib` → no hits; `npx jest` full → green (if a review-storage test file exists, delete it too); tsc clean.
- [ ] **Step 5: Commit** — `git add -u app/admin components/admin lib/utils && git add components/admin` (check `git status` first; stage only intended paths) / `feat(admin): rebuilt reviews moderation in current design system; drop orphaned review-storage`

---

### Task 10: Full verification + memories

- [ ] **Step 1:** `npx jest` full → all green. `npx tsc --noEmit` → clean. `rm -rf .next && npx next build` → succeeds.
- [ ] **Step 2: Live e2e:**

```bash
npm run dev > /tmp/nato-dev.log 2>&1 &
sleep 8
PORT=$(grep -o 'localhost:[0-9]*' /tmp/nato-dev.log | head -1 | cut -d: -f2)
JAR=/tmp/admin-cookies.txt
curl -s -o /dev/null -w "unauth /admin: %{http_code}\n" "http://localhost:${PORT}/admin"
curl -s -c $JAR -w "login: %{http_code}\n" -o /dev/null -X POST "http://localhost:${PORT}/api/admin/session" -H 'Content-Type: application/json' -d '{"password":"dev-admin-password"}'
curl -s -b $JAR -o /dev/null -w "auth /admin: %{http_code}\n" "http://localhost:${PORT}/admin"
curl -s -b $JAR "http://localhost:${PORT}/api/admin/stats/overview?days=30" | head -c 300; echo
curl -s -b $JAR -o /dev/null -w "stats tools: %{http_code}\n" "http://localhost:${PORT}/api/admin/stats/tools"
curl -s -o /dev/null -w "unauth review PATCH: %{http_code}\n" -X PATCH "http://localhost:${PORT}/api/reviews/x" -H 'Content-Type: application/json' -d '{"approved":true}'
kill %1; rm -f $JAR; rm -rf .next
```

Expected: 307/redirect, 200, 200, JSON with uniqueVisitors/dailySeries, 200, 401.

- [ ] **Step 3:** Append to `claude-memories.md`: one line — Phase 2 admin shipped (np_admin HMAC cookie via lib/server/admin-session.ts WebCrypto — Edge-safe, fail-closed when ADMIN_SESSION_SECRET unset; middleware guards /admin/*, /api/admin/*, review PATCH/DELETE; analytics-repo tested against real :memory: libSQL; recharts admin-only; leaderboard excludes template_use+page_view; ADMIN_PASSWORD/ADMIN_SESSION_SECRET must be set in Vercel env before deploy). Phase 3 = /impact page.
- [ ] **Step 4: Commit** — `chore: record analytics admin completion in memories`

---

## Out of scope (Phase 3 plan, after this lands)

Public `/impact` page (server component reading analytics-repo directly, `revalidate = 3600`), footer link, privacy-policy copy mentioning `np_anon`. Also deferred: sliding admin-session renewal, toast system, `schema.sql` tool_usage anon_id consolidation (rebuild-time), per-instance rate-limit note for serverless.
