import type { ActivityItem } from '@/lib/db/analytics/activity';

/** Converts an ISO datetime string into a short relative string like "3m ago". */
export function relativeTime(at: string): string {
  const diffMs = Date.now() - new Date(at).getTime();
  const secs = Math.floor(diffMs / 1000);
  if (secs < 60) return `${Math.max(0, secs)}s ago`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

/**
 * ActivityFeed — read-only table of recent AI tool runs and analytics events.
 * Columns: time (relative), kind badge, tool, anonShort (mono), country.
 */
export function ActivityFeed({ items }: { items: ActivityItem[] }) {
  if (items.length === 0) {
    return <p className="text-sm text-tertiary">No activity yet.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-warmNeutral-200 text-left dark:border-warmNeutral-700">
            <th className="pb-2 pr-4 text-xs font-bold uppercase tracking-widest text-tertiary">
              Time
            </th>
            <th className="pb-2 pr-4 text-xs font-bold uppercase tracking-widest text-tertiary">
              Kind
            </th>
            <th className="pb-2 pr-4 text-xs font-bold uppercase tracking-widest text-tertiary">
              Tool
            </th>
            <th className="pb-2 pr-4 text-xs font-bold uppercase tracking-widest text-tertiary">
              Visitor
            </th>
            <th className="pb-2 text-xs font-bold uppercase tracking-widest text-tertiary">
              Country
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-warmNeutral-100 dark:divide-warmNeutral-800">
          {items.map((item, i) => (
            <tr
              key={i}
              className="text-gray-600 dark:text-warmNeutral-200"
            >
              <td className="py-2 pr-4 text-xs">{relativeTime(item.at)}</td>
              <td className="py-2 pr-4">
                <span
                  className={
                    item.kind === 'ai'
                      ? 'rounded px-1.5 py-0.5 text-xs font-semibold bg-coolBlue-100 text-coolBlue-700 dark:bg-coolBlue-900/40 dark:text-coolBlue-300'
                      : 'rounded px-1.5 py-0.5 text-xs font-semibold bg-warmNeutral-100 text-gray-600 dark:bg-warmNeutral-700 dark:text-warmNeutral-200'
                  }
                >
                  {item.kind}
                </span>
              </td>
              <td className="py-2 pr-4">{item.tool ?? '—'}</td>
              <td className="py-2 pr-4 font-mono text-xs">{item.anonShort ?? '—'}</td>
              <td className="py-2">{item.country ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
