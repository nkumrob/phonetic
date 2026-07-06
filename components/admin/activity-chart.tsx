'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

interface DailyPoint {
  date: string;
  ai: number;
  other: number;
  /** Total (ai + other) from the equivalent day in the previous window. */
  prevTotal: number;
}

export const ActivityChart = dynamic<{ data: DailyPoint[] }>(
  () => import('./activity-chart-inner'),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[280px] w-full" />,
  }
);
