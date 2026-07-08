'use client';

import { useAdminStats } from '@/lib/hooks/use-admin-stats';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import type { FeatureRequest } from '@/lib/db/feature-requests-repo';

interface FeatureRequestsResponse {
  requests: FeatureRequest[];
}

export function FeatureRequestsView() {
  const { data, error } = useAdminStats<FeatureRequestsResponse>(
    '/api/admin/feature-requests'
  );

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-black tracking-headlines">Requests</h1>

      {data === null && !error && (
        <div className="flex justify-center py-16">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {error && (
        <p
          role="alert"
          className="rounded-xl border border-error/30 bg-white p-4 text-sm font-semibold text-error dark:bg-warmNeutral-800"
        >
          Could not load feature requests. Check the database connection and refresh.
        </p>
      )}

      {data !== null && !error && data.requests.length === 0 && (
        <p className="text-sm text-tertiary">No feature requests yet.</p>
      )}

      {data !== null && !error && data.requests.length > 0 && (
        <div className="space-y-4">
          {data.requests.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border border-warmNeutral-200 bg-white p-4 dark:border-warmNeutral-700 dark:bg-warmNeutral-800"
            >
              <p className="text-sm text-gray-800 dark:text-warmNeutral-100">{item.request}</p>
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1">
                <p className="font-semibold text-sm text-gray-700 dark:text-warmNeutral-200">
                  {item.name ?? 'Anonymous'}
                </p>
                {item.email && (
                  <p className="text-sm text-gray-500 dark:text-warmNeutral-400">{item.email}</p>
                )}
                <p className="text-xs text-tertiary ml-auto">
                  {new Date(item.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
