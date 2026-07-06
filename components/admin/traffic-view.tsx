'use client';

import { useState } from 'react';
import type { TrafficStats } from '@/lib/db/analytics-repo';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useAdminStats } from '@/lib/hooks/use-admin-stats';
import { KpiCard } from './kpi-card';
import { RangeSwitcher, type StatsRange } from './range-switcher';
import { TopList } from './top-list';
import { FunnelList } from './funnel-list';
import { LeaderboardChart } from './leaderboard-chart';

export function TrafficView() {
  const [days, setDays] = useState<StatsRange>(30);
  const { data: stats, error } = useAdminStats<TrafficStats>(
    `/api/admin/stats/traffic?days=${days}`,
  );

  if (error) {
    return (
      <p
        role="alert"
        className="rounded-xl border border-error/30 bg-white p-6 text-sm font-semibold dark:bg-warmNeutral-800"
      >
        Could not load traffic stats. Check the database connection and refresh.
      </p>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-black tracking-headlines">Traffic</h1>
        <RangeSwitcher value={days} onChange={setDays} />
      </div>

      {!stats ? (
        <div className="flex justify-center py-24">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <>
          {/* Visitor KPI tiles */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
            <KpiCard label="New visitors" value={stats.newVisitors} />
            <KpiCard label="Returning visitors" value={stats.returningVisitors} />
            <KpiCard
              label="Avg interactions / visitor"
              value={stats.avgInteractionsPerVisitor}
            />
          </div>

          {/* Top pages + countries */}
          <div className="grid gap-6 lg:grid-cols-2">
            <section className="rounded-xl border border-warmNeutral-200 bg-white p-6 dark:border-warmNeutral-700 dark:bg-warmNeutral-800">
              <h2 className="mb-4 text-lg font-bold">Top pages</h2>
              <TopList
                data={stats.topPages.map((p) => ({ label: p.path, count: p.views }))}
                emptyText="No page views in this range."
              />
            </section>
            <section className="rounded-xl border border-warmNeutral-200 bg-white p-6 dark:border-warmNeutral-700 dark:bg-warmNeutral-800">
              <h2 className="mb-4 text-lg font-bold">Top countries</h2>
              <TopList
                data={stats.countries.map((c) => ({ label: c.country, count: c.visitors }))}
                emptyText="No geo data in this range."
              />
            </section>
          </div>

          {/* Most-used tools leaderboard (moved from Overview) */}
          <section className="rounded-xl border border-warmNeutral-200 bg-white p-6 dark:border-warmNeutral-700 dark:bg-warmNeutral-800">
            <h2 className="mb-4 text-lg font-bold">Most-used tools</h2>
            {stats.toolLeaderboard.length === 0 ? (
              <p className="text-sm text-tertiary">No tool activity in this range.</p>
            ) : (
              <LeaderboardChart data={stats.toolLeaderboard} />
            )}
          </section>

          {/* Learning funnel */}
          <section className="rounded-xl border border-warmNeutral-200 bg-white p-6 dark:border-warmNeutral-700 dark:bg-warmNeutral-800">
            <h2 className="mb-4 text-lg font-bold">Practice funnel</h2>
            <FunnelList data={stats.funnel} />
          </section>
        </>
      )}
    </div>
  );
}
