'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { formatDate } from '@/lib/utils/formatters';

interface SuccessFailedChartProps {
  data: Array<{
    date: string;
    success: number;
    failed: number;
  }>;
  height?: number;
}

export default function SuccessFailedChart({ data, height = 300 }: SuccessFailedChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
          stroke="#64748B"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          width={40}
        />
        <Tooltip
          contentStyle={{
            background: '#1E293B',
            border: '1px solid #334155',
            borderRadius: '8px',
            color: '#F1F5F9',
          }}
          labelFormatter={(label) => formatDate(label)}
        />
        <Legend />
        <Area
          type="monotone"
          dataKey="success"
          stackId="1"
          stroke="#10B981"
          fill="#10B981"
          fillOpacity={0.6}
          name="Successful Requests"
        />
        <Area
          type="monotone"
          dataKey="failed"
          stackId="1"
          stroke="#EF4444"
          fill="#EF4444"
          fillOpacity={0.6}
          name="Failed Requests"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
