'use client';

import { useEffect, useState } from 'react';
import type { ToolStatsRow } from '@/lib/db/analytics-repo';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { RangeSwitcher, type StatsRange } from './range-switcher';
import { ToolsTable } from './tools-table';

export function ToolsView() {
  const [days, setDays] = useState<StatsRange>(30);
  const [rows, setRows] = useState<ToolStatsRow[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setError(false);
    setRows(null);
    fetch(`/api/admin/stats/tools?days=${days}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
      .then((data) => {
        if (!cancelled) setRows(data as ToolStatsRow[]);
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
        Could not load tool stats. Check the database connection and refresh.
      </p>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-black tracking-headlines">Tools</h1>
        <RangeSwitcher value={days} onChange={setDays} />
      </div>

      {!rows ? (
        <div className="flex justify-center py-24">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <ToolsTable rows={rows} />
      )}
    </div>
  );
}
