/**
 * Analytics read-side entry point.
 *
 * Re-exports everything from the `analytics/` sub-modules so that
 * existing import paths (`@/lib/db/analytics-repo`) keep compiling.
 * Import directly from the sub-modules in new code.
 *
 * @see lib/db/analytics/overview.ts  — KPI aggregates with deltas
 * @see lib/db/analytics/traffic.ts   — pages, geo, funnel, leaderboard
 * @see lib/db/analytics/ai-ops.ts    — model costs, latency, votes
 * @see lib/db/analytics/activity.ts  — recent activity feed
 * @see lib/db/analytics/tools.ts     — per-tool stats (Tools page)
 * @see lib/db/analytics/shared.ts    — DbLike, resolveDb, since, num
 */

export * from './analytics/shared';
export * from './analytics/overview';
export * from './analytics/traffic';
export * from './analytics/ai-ops';
export * from './analytics/activity';
export * from './analytics/tools';
