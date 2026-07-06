'use client';

import dynamic from 'next/dynamic';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface DailyPoint {
  date: string;
  ai: number;
  other: number;
}

function formatDate(date: string): string {
  // YYYY-MM-DD → MM-DD
  return date.slice(5);
}

function ActivityChartInner({ data }: { data: DailyPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -16 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey="date"
          tickFormatter={formatDate}
          tick={{ fontSize: 11 }}
          tickLine={false}
        />
        <YAxis allowDecimals={false} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
        <Tooltip />
        <Area
          type="monotone"
          dataKey="ai"
          stackId="1"
          stroke="#2563EB"
          fill="#2563EB"
          fillOpacity={0.8}
        />
        <Area
          type="monotone"
          dataKey="other"
          stackId="1"
          stroke="#93C5FD"
          fill="#93C5FD"
          fillOpacity={0.6}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// Export wrapped with next/dynamic (ssr:false) to prevent hydration issues
export const ActivityChart = dynamic(
  () => Promise.resolve(ActivityChartInner),
  { ssr: false },
);
