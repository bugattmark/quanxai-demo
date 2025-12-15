'use client';

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';
import { formatCurrency, formatPercent } from '@/lib/utils/formatters';

interface CostByModelChartProps {
  data: Array<{
    name: string;
    value: number;
    percentage: number;
  }>;
  height?: number;
}

const COLORS = ['#3B82F6', '#10B981', '#1F2937', '#F59E0B'];

export default function CostByModelChart({ data, height = 300 }: CostByModelChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={2}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            background: '#1E293B',
            border: '1px solid #334155',
            borderRadius: '8px',
            color: '#F1F5F9',
          }}
          formatter={(value: number, name: string) => [
            formatCurrency(value),
            name,
          ]}
        />
        <Legend
          layout="vertical"
          align="right"
          verticalAlign="middle"
          formatter={(value, entry: any) => (
            <span className="text-slate-300 text-sm">
              {value}
              <span className="text-slate-500 ml-2">
                {formatCurrency(entry.payload.value)} ({formatPercent(entry.payload.percentage)})
              </span>
            </span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
