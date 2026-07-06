'use client';

import { useEffect, useState } from 'react';
import type { OverviewStats } from '@/lib/db/analytics-repo';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
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
      <p
        role="alert"
        className="rounded-xl border border-error/30 bg-white p-6 text-sm font-semibold dark:bg-warmNeutral-800"
      >
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
            <KpiCard label="Time saved" value={formatTimeSaved(stats.timeSavedMinutes)} hint="self-reported" />
          </div>

          <section className="rounded-xl border border-warmNeutral-200 bg-white p-6 dark:border-warmNeutral-700 dark:bg-warmNeutral-800">
            <h2 className="mb-4 text-lg font-bold">Daily activity</h2>
            <ActivityChart data={stats.dailySeries} />
          </section>

          <div className="grid gap-4 lg:grid-cols-2">
            <section className="rounded-xl border border-warmNeutral-200 bg-white p-6 dark:border-warmNeutral-700 dark:bg-warmNeutral-800">
              <h2 className="mb-4 text-lg font-bold">Most-used tools</h2>
              {stats.toolLeaderboard.length === 0 ? (
                <p className="text-sm text-tertiary">No tool usage in this range yet.</p>
              ) : (
                <LeaderboardChart data={stats.toolLeaderboard.slice(0, 8)} />
              )}
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
