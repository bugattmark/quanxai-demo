'use client';

import { useState } from 'react';
import { DollarSign, Zap, Hash, Clock } from 'lucide-react';
import SpendTrendChart from '@/components/charts/SpendTrendChart';
import CostByModelChart from '@/components/charts/CostByModelChart';
import { formatCurrency, formatNumber, formatPercent } from '@/lib/utils/formatters';
import { organizationMetrics, costByModel, spendTrendData } from '@/data/mock/organization';

// KPI Card Component - Light Theme
function KPICard({
  title,
  value,
  icon,
  subtitle,
  trend,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  subtitle?: string;
  trend?: { value: number; direction: 'up' | 'down' };
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
          {trend && (
            <div className={`flex items-center gap-1 text-xs mt-2 ${trend.direction === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              <span>{trend.direction === 'up' ? '+' : '-'}{trend.value}% vs last period</span>
            </div>
          )}
        </div>
        <div className="p-3 rounded-lg bg-indigo-50 text-indigo-600">
          {icon}
        </div>
      </div>
    </div>
  );
}

// Chart Card Component - Light Theme
function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

// Date Range Selector - Light Theme
function DateRangeSelector({
  value,
  onChange,
}: {
  value: 'last7days' | 'last30days' | 'last90days';
  onChange: (val: 'last7days' | 'last30days' | 'last90days') => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as 'last7days' | 'last30days' | 'last90days')}
      className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
    >
      <option value="last7days">Last 7 Days</option>
      <option value="last30days">Last 30 Days</option>
      <option value="last90days">Last 90 Days</option>
    </select>
  );
}

export default function OrganizationDashboard() {
  const [dateRange, setDateRange] = useState<'last7days' | 'last30days' | 'last90days'>('last30days');

  // Adjust metrics based on date range for demo purposes
  const rangeMultiplier = dateRange === 'last7days' ? 0.25 : dateRange === 'last90days' ? 3 : 1;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Organization Overview</h1>
          <p className="text-sm text-gray-500 mt-1">
            Analytics for {dateRange === 'last7days' ? 'Last 7 Days' : dateRange === 'last30days' ? 'Nov 1 - Nov 30, 2025' : 'Last 90 Days'}
          </p>
        </div>
        <DateRangeSelector value={dateRange} onChange={setDateRange} />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPICard
          title="Total Spend"
          value={formatCurrency(organizationMetrics.totalSpend * rangeMultiplier)}
          icon={<DollarSign className="w-5 h-5" />}
          trend={{ value: 12.5, direction: 'up' }}
        />
        <KPICard
          title="Total Requests"
          value={formatNumber(Math.round(organizationMetrics.totalRequests * rangeMultiplier))}
          icon={<Zap className="w-5 h-5" />}
          subtitle={`${formatPercent(organizationMetrics.successRate)} Success Rate`}
        />
        <KPICard
          title="Tokens Processed"
          value={formatNumber(Math.round(organizationMetrics.tokensProcessed * rangeMultiplier))}
          icon={<Hash className="w-5 h-5" />}
          subtitle="Across 24 active teams"
        />
        <KPICard
          title="Avg. Cost per Request"
          value={formatCurrency(organizationMetrics.avgCostPerRequest)}
          icon={<Clock className="w-5 h-5" />}
          subtitle={`P95: ${(organizationMetrics.avgLatencyMs / 1000).toFixed(1)}s`}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spend Trend */}
        <ChartCard
          title="Spend Trend"
          subtitle="Daily spend over the last 30 days"
        >
          <SpendTrendChart data={spendTrendData} height={280} />
        </ChartCard>

        {/* Cost by Model */}
        <ChartCard
          title="Cost by Model"
          subtitle="Distribution of spend across models"
        >
          <CostByModelChart data={costByModel} height={280} />
        </ChartCard>
      </div>
    </div>
  );
}
