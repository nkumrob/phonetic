/**
 * TopList — generic label + count + proportional bar list.
 *
 * Used for top pages, top countries, and any other ranked list.
 * The widest bar (max count) is always 100%; all others are proportional.
 */

interface TopItem {
  label: string;
  count: number;
}

interface TopListProps {
  data: TopItem[];
  /** Text shown when data is empty. Default: "No data." */
  emptyText?: string;
}

export function TopList({ data, emptyText = 'No data.' }: TopListProps) {
  if (data.length === 0) {
    return <p className="text-sm text-tertiary">{emptyText}</p>;
  }

  const max = Math.max(1, ...data.map((d) => d.count));

  return (
    <ul className="space-y-3">
      {data.map(({ label, count }) => (
        <li key={label}>
          <div className="mb-1 flex items-center justify-between gap-2 text-sm">
            <span className="truncate text-gray-600 dark:text-warmNeutral-200">{label}</span>
            <span className="shrink-0 font-mono text-xs font-bold">
              {count.toLocaleString('en-US')}
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-warmNeutral-100 dark:bg-warmNeutral-700">
            <div
              className="h-1.5 rounded-full bg-coolBlue-500"
              style={{ width: `${(count / max) * 100}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
