'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { formatDate, formatNumber } from '@/lib/utils/formatters';

interface CachingMetricsChartProps {
  data: Array<{
    date: string;
    cache_read: number;
    cache_creation: number;
  }>;
  height?: number;
}

export default function CachingMetricsChart({ data, height = 300 }: CachingMetricsChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={formatDate}
          stroke="#64748B"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tickFormatter={(value) => formatNumber(value)}
          stroke="#64748B"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          width={50}
        />
        <Tooltip
          contentStyle={{
            background: '#1E293B',
            border: '1px solid #334155',
            borderRadius: '8px',
            color: '#F1F5F9',
          }}
          formatter={(value: number, name: string) => [
            formatNumber(value),
            name === 'cache_read' ? 'Cache Read' : 'Cache Creation',
          ]}
          labelFormatter={(label) => formatDate(label)}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="cache_read"
          stroke="#3B82F6"
          strokeWidth={2}
          dot={false}
          name="Cache Read Input Tokens"
        />
        <Line
          type="monotone"
          dataKey="cache_creation"
          stroke="#8B5CF6"
          strokeWidth={2}
          strokeDasharray="5 5"
          dot={false}
          name="Cache Creation Input Tokens"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
