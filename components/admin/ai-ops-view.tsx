'use client';

'use client';

import { useState } from 'react';
import type { AiOpsStats } from '@/lib/db/analytics-repo';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useAdminStats } from '@/lib/hooks/use-admin-stats';
import { KpiCard } from './kpi-card';
import { RangeSwitcher, type StatsRange } from './range-switcher';
import { VotesList } from './votes-list';

export function AiOpsView() {
  const [days, setDays] = useState<StatsRange>(30);
  const { data: stats, error } = useAdminStats<AiOpsStats>(
    `/api/admin/stats/ai?days=${days}`,
  );

  if (error) {
    return (
      <p
        role="alert"
        className="rounded-xl border border-error/30 bg-white p-6 text-sm font-semibold dark:bg-warmNeutral-800"
      >
        Could not load AI stats. Check the database connection and refresh.
      </p>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-black tracking-headlines">AI Ops</h1>
        <RangeSwitcher value={days} onChange={setDays} />
      </div>

      {!stats ? (
        <div className="flex justify-center py-24">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <>
          {/* Per-model breakdown */}
          <section className="rounded-xl border border-warmNeutral-200 bg-white p-6 dark:border-warmNeutral-700 dark:bg-warmNeutral-800">
            <h2 className="mb-4 text-lg font-bold">By model</h2>
            {stats.byModel.length === 0 ? (
              <p className="text-sm text-tertiary">No AI conversations in this range.</p>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-warmNeutral-200 text-left dark:border-warmNeutral-700">
                        <th className="pb-2 pr-4 text-xs font-bold uppercase tracking-widest text-tertiary">
                          Model
                        </th>
                        <th className="pb-2 pr-4 text-right text-xs font-bold uppercase tracking-widest text-tertiary">
                          Convs
                        </th>
                        <th className="pb-2 pr-4 text-right text-xs font-bold uppercase tracking-widest text-tertiary">
                          Input tok
                        </th>
                        <th className="pb-2 pr-4 text-right text-xs font-bold uppercase tracking-widest text-tertiary">
                          Output tok
                        </th>
                        <th className="pb-2 text-right text-xs font-bold uppercase tracking-widest text-tertiary">
                          Est. cost
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-warmNeutral-100 dark:divide-warmNeutral-800">
                      {stats.byModel.map((row) => (
                        <tr key={row.model} className="text-gray-600 dark:text-warmNeutral-200">
                          <td className="py-2 pr-4 font-mono text-xs">{row.model}</td>
                          <td className="py-2 pr-4 text-right font-mono text-xs">
                            {row.conversations.toLocaleString('en-US')}
                          </td>
                          <td className="py-2 pr-4 text-right font-mono text-xs">
                            {row.inputTokens.toLocaleString('en-US')}
                          </td>
                          <td className="py-2 pr-4 text-right font-mono text-xs">
                            {row.outputTokens.toLocaleString('en-US')}
                          </td>
                          <td className="py-2 text-right font-mono text-xs">
                            {row.estimatedCostUsd === null
                              ? '—'
                              : `$${row.estimatedCostUsd.toFixed(4)}`}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    {stats.totalCostUsd !== null && (
                      <tfoot>
                        <tr className="border-t border-warmNeutral-200 dark:border-warmNeutral-700">
                          <td
                            colSpan={4}
                            className="pt-2 text-sm font-semibold text-tertiary"
                          >
                            Total
                          </td>
                          <td className="pt-2 text-right font-mono text-sm font-bold">
                            ${stats.totalCostUsd.toFixed(4)}
                          </td>
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>
                {stats.byModel.some((r) => r.estimatedCostUsd === null) && (
                  <p className="mt-3 text-xs text-tertiary">
                    Add prices in lib/constants/model-prices.ts
                  </p>
                )}
              </>
            )}
          </section>

          {/* Avg latency + time-saved votes */}
          <div className="grid gap-6 lg:grid-cols-2">
            <KpiCard
              label="Avg response latency"
              value={stats.avgLatencyMs}
              hint="ms — AI tool calls only"
            />
            <section className="rounded-xl border border-warmNeutral-200 bg-white p-6 dark:border-warmNeutral-700 dark:bg-warmNeutral-800">
              <h2 className="mb-4 text-lg font-bold">Time saved votes</h2>
              <VotesList data={stats.timeSavedDistribution} />
            </section>
          </div>
        </>
      )}
    </div>
  );
}
