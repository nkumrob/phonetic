'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface LeaderboardItem {
  tool: string;
  uses: number;
}

export default function LeaderboardChartInner({ data }: { data: LeaderboardItem[] }) {
  // 40px per row + 40px padding
  const height = data.length * 40 + 40;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        layout="vertical"
        data={data}
        margin={{ top: 0, right: 8, bottom: 0, left: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
        <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} tickLine={false} />
        <YAxis
          type="category"
          dataKey="tool"
          width={140}
          tick={{ fontSize: 11 }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip />
        <Bar dataKey="uses" fill="#2563EB" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
