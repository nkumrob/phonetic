'use client';

import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface DailyPoint {
  date: string;
  ai: number;
  other: number;
  /** Total (ai + other) from the equivalent day in the previous window. */
  prevTotal: number;
}

function formatDate(date: string): string {
  // YYYY-MM-DD → MM-DD
  return date.slice(5);
}

export default function ActivityChartInner({ data }: { data: DailyPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <ComposedChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -16 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey="date"
          tickFormatter={formatDate}
          tick={{ fontSize: 11 }}
          tickLine={false}
        />
        <YAxis allowDecimals={false} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
        <Tooltip />
        <Legend />
        <Area
          type="monotone"
          dataKey="ai"
          name="AI"
          stackId="1"
          stroke="#2563EB"
          fill="#2563EB"
          fillOpacity={0.8}
        />
        <Area
          type="monotone"
          dataKey="other"
          name="Other"
          stackId="1"
          stroke="#93C5FD"
          fill="#93C5FD"
          fillOpacity={0.6}
        />
        <Line
          type="monotone"
          dataKey="prevTotal"
          name="prev period"
          stroke="#9CA3AF"
          strokeDasharray="3 3"
          dot={false}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
