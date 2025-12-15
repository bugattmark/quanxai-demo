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
import { formatCurrency, formatDate } from '@/lib/utils/formatters';

interface DailyBarChartProps {
  data: Array<{
    date: string;
    spend: number;
    requests?: number;
  }>;
  height?: number;
  showRequests?: boolean;
}

export default function DailyBarChart({
  data,
  height = 300,
  showRequests = false,
}: DailyBarChartProps) {
  const formatDay = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={formatDay}
          stroke="#64748B"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tickFormatter={(value) => `$${value}`}
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
            name === 'spend' ? formatCurrency(value) : value.toLocaleString(),
            name === 'spend' ? 'Spend' : 'Requests',
          ]}
          labelFormatter={(label) => formatDate(label)}
        />
        <Bar
          dataKey="spend"
          fill="#3B82F6"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
