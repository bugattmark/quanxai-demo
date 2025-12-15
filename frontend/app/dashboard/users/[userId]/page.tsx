'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import KPICard from '@/components/ui/KPICard';
import ChartCard from '@/components/ui/ChartCard';
import { formatCurrency, formatPercent } from '@/lib/utils/formatters';
import { users, getUserById, generateUserActivity } from '@/data/mock/users';
import { DollarSign, CheckCircle, Zap, TrendingUp } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function UserDashboard() {
  const params = useParams();
  const userId = params.userId as string;

  const user = getUserById(userId) || users[0];
  const activityData = generateUserActivity(userId);

  return (
    <div className="p-8">
      {/* User Profile Header */}
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 mb-8">
        <div className="flex items-center gap-6">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl">
            {user.name.split(' ').map(n => n[0]).join('')}
          </div>

          {/* Info */}
          <div>
            <h1 className="text-2xl font-bold text-white">{user.email}</h1>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-sm px-3 py-1 bg-slate-700 rounded-full text-slate-300">
                {user.role}
              </span>
              <span className="text-slate-400">
                {user.teamName}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KPICard
          title="Monthly Spend"
          value={formatCurrency(user.monthlySpend)}
          icon={<DollarSign className="w-4 h-4" />}
          subtitle={`${user.totalRequests.toLocaleString()} requests`}
        />
        <KPICard
          title="Cost per Request"
          value={formatCurrency(user.costPerRequest)}
          icon={<TrendingUp className="w-4 h-4" />}
          subtitle={`Better than team avg ($0.12)`}
          trend={{ value: 8, direction: 'down' }}
        />
        <KPICard
          title="Success Rate"
          value={formatPercent(user.successRate)}
          icon={<CheckCircle className="w-4 h-4" />}
          subtitle={`Team avg: 96.8%`}
          trend={{
            value: 1.4,
            direction: user.successRate > 96.8 ? 'up' : 'down',
          }}
        />
        <KPICard
          title="Cache Hit Rate"
          value={formatPercent(user.cacheHitRate)}
          icon={<Zap className="w-4 h-4" />}
          subtitle="Above average"
        />
      </div>

      {/* Activity Timeline */}
      <ChartCard
        title="Activity Timeline"
        subtitle="Weekly request volume and primary models"
      >
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={activityData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis
              dataKey="week"
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
              width={50}
            />
            <Tooltip
              contentStyle={{
                background: '#1E293B',
                border: '1px solid #334155',
                borderRadius: '8px',
                color: '#F1F5F9',
              }}
              formatter={(value: number) => [value.toLocaleString(), 'Requests']}
            />
            <Bar
              dataKey="requests"
              fill="#3B82F6"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}
