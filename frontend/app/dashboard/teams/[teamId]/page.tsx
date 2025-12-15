'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import KPICard from '@/components/ui/KPICard';
import ChartCard from '@/components/ui/ChartCard';
import DateRangeSelector from '@/components/ui/DateRangeSelector';
import DailyBarChart from '@/components/charts/DailyBarChart';
import CachingMetricsChart from '@/components/charts/CachingMetricsChart';
import { formatCurrency, formatPercent, formatNumber } from '@/lib/utils/formatters';
import { teams, getTeamById, generateTeamDailySpend, generateTeamCacheMetrics } from '@/data/mock/teams';
import { DollarSign, CheckCircle, Users, Zap } from 'lucide-react';

export default function TeamDashboard() {
  const params = useParams();
  const teamId = params.teamId as string;
  const [dateRange, setDateRange] = useState<'last7days' | 'last30days' | 'last90days'>('last7days');

  const team = getTeamById(teamId) || teams[0];
  const dailySpend = generateTeamDailySpend(teamId);
  const cacheMetrics = generateTeamCacheMetrics(teamId);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">{team.name}</h1>
          <p className="text-slate-400 mt-1">
            Analytics for Last 7 Days (Nov 23-29, 2025)
          </p>
        </div>
        <DateRangeSelector value={dateRange} onChange={setDateRange} />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KPICard
          title="Total Spend"
          value={formatCurrency(team.totalSpend)}
          icon={<DollarSign className="w-4 h-4" />}
          progressBar={{
            current: team.totalSpend,
            max: team.budget,
          }}
        />
        <KPICard
          title="Success Rate"
          value={formatPercent(team.successRate)}
          icon={<CheckCircle className="w-4 h-4" />}
          subtitle="Target: 95%"
          trend={{
            value: 1.5,
            direction: team.successRate > 95 ? 'up' : 'down',
          }}
        />
        <KPICard
          title="Active Members"
          value={team.activeMembers.toString()}
          icon={<Users className="w-4 h-4" />}
          subtitle="DAU: 8-12"
        />
        <KPICard
          title="Token Efficiency"
          value={formatNumber(team.tokenEfficiency)}
          icon={<Zap className="w-4 h-4" />}
          subtitle="tokens/$ (Target: 1200)"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Spend & Requests */}
        <ChartCard
          title="Daily Spend & Requests"
          subtitle="Last 7 Days Activity"
        >
          <DailyBarChart data={dailySpend} height={280} />
        </ChartCard>

        {/* Prompt Caching Metrics */}
        <ChartCard
          title="Prompt Caching Metrics"
          subtitle="Cache Read: 0 tokens | Cache Creation: 0 tokens"
        >
          <CachingMetricsChart data={cacheMetrics} height={280} />
        </ChartCard>
      </div>
    </div>
  );
}
