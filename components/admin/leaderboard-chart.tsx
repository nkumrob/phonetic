'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

interface LeaderboardItem {
  tool: string;
  uses: number;
}

export const LeaderboardChart = dynamic<{ data: LeaderboardItem[] }>(
  () => import('./leaderboard-chart-inner'),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[280px] w-full" />,
  }
);
