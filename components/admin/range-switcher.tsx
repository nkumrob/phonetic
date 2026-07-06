'use client';

import { cn } from '@/lib/utils/cn';

const RANGES = [7, 30, 90] as const;
export type StatsRange = (typeof RANGES)[number];

export function RangeSwitcher({
  value,
  onChange,
}: {
  value: StatsRange;
  onChange: (days: StatsRange) => void;
}) {
  return (
    <div className="inline-flex gap-1 rounded-lg border border-warmNeutral-200 p-1 dark:border-warmNeutral-700">
      {RANGES.map((days) => (
        <button
          type="button"
          key={days}
          aria-pressed={value === days}
          onClick={() => onChange(days)}
          className={cn(
            'rounded-md px-3 py-1 font-mono text-xs font-bold',
            value === days
              ? 'bg-coolBlue-600 text-white'
              : 'text-gray-600 hover:bg-warmNeutral-100 dark:text-warmNeutral-200',
          )}
        >
          {days}d
        </button>
      ))}
    </div>
  );
}
