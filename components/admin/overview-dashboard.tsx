'use client';

import { useState } from 'react';
import type { OverviewStats } from '@/lib/db/analytics-repo';
import type { ActivityItem } from '@/lib/db/analytics/activity';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { formatTimeSaved } from '@/lib/client/time-saved';
import { useAdminStats } from '@/lib/hooks/use-admin-stats';
import { KpiCard } from './kpi-card';
import { RangeSwitcher, type StatsRange } from './range-switcher';
import { ActivityChart } from './activity-chart';
import { ActivityFeed } from './activity-feed';

export function OverviewDashboard() {
  const [days, setDays] = useState<StatsRange>(30);
  const { data: stats, error } = useAdminStats<OverviewStats>(
    `/api/admin/stats/overview?days=${days}`,
  );
  const { data: activity, error: activityError } = useAdminStats<ActivityItem[]>(
    '/api/admin/stats/activity',
  );

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
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
            <KpiCard
              label="Unique visitors"
              value={stats.uniqueVisitors.current}
              delta={stats.uniqueVisitors}
            />
            <KpiCard
              label="Interactions"
              value={stats.interactions.current}
              hint="activity, excl. page views"
              delta={stats.interactions}
            />
            <KpiCard
              label="AI conversations"
              value={stats.aiConversations.current}
              delta={stats.aiConversations}
            />
            <KpiCard
              label="Tokens used"
              value={stats.tokens.current}
              hint="input + output"
              delta={stats.tokens}
            />
            <KpiCard
              label="Time saved"
              value={formatTimeSaved(stats.timeSavedMinutes.current)}
              hint="self-reported"
              delta={stats.timeSavedMinutes}
            />
            <KpiCard
              label="Page views"
              value={stats.pageViews.current}
              delta={stats.pageViews}
            />
          </div>

          <section className="rounded-xl border border-warmNeutral-200 bg-white p-6 dark:border-warmNeutral-700 dark:bg-warmNeutral-800">
            <h2 className="mb-4 text-lg font-bold">Daily activity</h2>
            <ActivityChart data={stats.dailySeries} />
          </section>

          <section className="rounded-xl border border-warmNeutral-200 bg-white p-6 dark:border-warmNeutral-700 dark:bg-warmNeutral-800">
            <h2 className="mb-4 text-lg font-bold">Recent activity</h2>
            {activityError ? (
              <p className="text-sm text-error">Could not load activity.</p>
            ) : !activity ? (
              <LoadingSpinner size="sm" />
            ) : (
              <ActivityFeed items={activity} />
            )}
          </section>
        </>
      )}
    </div>
  );
}
