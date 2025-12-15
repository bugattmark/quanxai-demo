'use client';

import { useState } from 'react';
import {
  DollarSign,
  Activity,
  Zap,
  Clock,
  TrendingUp,
  TrendingDown,
  Users,
  Tag,
  Building2,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Tabs, TabPanel } from '@/components/ui/Tabs';
import { DataTable, Column } from '@/components/ui/DataTable';
import {
  usageSummary,
  dailyUsage,
  usageByTeam,
  usageByTag,
  usageByCustomer,
  usageByModel,
  topSpendingKeys,
  usageErrorBreakdown,
  UsageByEntity,
} from '@/data/mock/usage';

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

// KPI Card Component - Light Theme
function KPICard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = 'blue',
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  trend?: { value: number; label: string };
  color?: 'blue' | 'emerald' | 'amber' | 'red' | 'purple' | 'cyan';
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    emerald: 'bg-green-50 text-green-600',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600',
    purple: 'bg-purple-50 text-purple-600',
    cyan: 'bg-cyan-50 text-cyan-600',
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
          {trend && (
            <div className={`flex items-center gap-1 text-xs mt-2 ${trend.value >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend.value >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              <span>{trend.value >= 0 ? '+' : ''}{trend.value}% {trend.label}</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}

// Usage Table Component - Light Theme
function UsageTable({
  data,
  entityLabel,
  icon: Icon,
}: {
  data: UsageByEntity[];
  entityLabel: string;
  icon: React.ElementType;
}) {
  const columns: Column<UsageByEntity>[] = [
    {
      key: 'name',
      header: entityLabel,
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-gray-400" />
          <span className="font-medium text-gray-900">{item.name}</span>
        </div>
      ),
    },
    {
      key: 'spend',
      header: 'Spend',
      sortable: true,
      render: (item) => <span className="text-gray-900">${item.spend.toLocaleString()}</span>,
    },
    {
      key: 'requests',
      header: 'Requests',
      sortable: true,
      render: (item) => <span className="text-gray-600">{item.requests.toLocaleString()}</span>,
    },
    {
      key: 'tokens',
      header: 'Tokens',
      sortable: true,
      render: (item) => <span className="text-gray-600">{(item.tokens / 1000000).toFixed(1)}M</span>,
    },
    {
      key: 'percentage',
      header: '% of Total',
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-2">
          <div className="w-16 bg-gray-200 rounded-full h-2">
            <div
              className="h-2 rounded-full bg-indigo-500"
              style={{ width: `${item.percentage}%` }}
            />
          </div>
          <span className="text-gray-500 text-sm">{item.percentage}%</span>
        </div>
      ),
    },
    {
      key: 'trend',
      header: 'Trend',
      sortable: true,
      render: (item) => (
        <div className={`flex items-center gap-1 ${item.trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {item.trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          <span className="text-sm">{item.trend >= 0 ? '+' : ''}{item.trend}%</span>
        </div>
      ),
    },
  ];

  return <DataTable data={data} columns={columns} pageSize={10} />;
}

// All Usage Tab Content
function AllUsageTab() {
  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Spend"
          value={`$${usageSummary.totalSpend.toLocaleString()}`}
          subtitle="This month"
          icon={DollarSign}
          color="purple"
          trend={{ value: 12.5, label: 'vs last month' }}
        />
        <KPICard
          title="Total Requests"
          value={`${(usageSummary.totalRequests / 1000000).toFixed(2)}M`}
          subtitle={`${usageSummary.successRate}% success rate`}
          icon={Activity}
          color="blue"
          trend={{ value: 8.3, label: 'vs last month' }}
        />
        <KPICard
          title="Total Tokens"
          value={`${(usageSummary.totalTokens / 1000000).toFixed(0)}M`}
          subtitle={`${(usageSummary.inputTokens / 1000000).toFixed(0)}M in / ${(usageSummary.outputTokens / 1000000).toFixed(0)}M out`}
          icon={Zap}
          color="amber"
          trend={{ value: 15.7, label: 'vs last month' }}
        />
        <KPICard
          title="Avg Latency"
          value={`${usageSummary.avgLatencyMs}ms`}
          subtitle={`P95: ${usageSummary.p95LatencyMs}ms`}
          icon={Clock}
          color="cyan"
          trend={{ value: -5.2, label: 'improvement' }}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spend Over Time */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Spend Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={dailyUsage}>
              <defs>
                <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                dataKey="date"
                stroke="#9CA3AF"
                fontSize={12}
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis stroke="#9CA3AF" fontSize={12} tickFormatter={(value) => `$${value}`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #E5E7EB', borderRadius: '8px' }}
                labelStyle={{ color: '#374151' }}
                formatter={(value: number) => [`$${value.toFixed(2)}`, 'Spend']}
                labelFormatter={(label) => new Date(label).toLocaleDateString()}
              />
              <Area type="monotone" dataKey="spend" stroke="#8B5CF6" fill="url(#colorSpend)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Token Usage */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Token Usage Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dailyUsage}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                dataKey="date"
                stroke="#9CA3AF"
                fontSize={12}
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis stroke="#9CA3AF" fontSize={12} tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #E5E7EB', borderRadius: '8px' }}
                labelStyle={{ color: '#374151' }}
                formatter={(value: number) => [`${(value / 1000000).toFixed(2)}M`, '']}
                labelFormatter={(label) => new Date(label).toLocaleDateString()}
              />
              <Legend />
              <Bar dataKey="inputTokens" name="Input Tokens" fill="#4F46E5" stackId="tokens" />
              <Bar dataKey="outputTokens" name="Output Tokens" fill="#10B981" stackId="tokens" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Model Distribution */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Spend by Model</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={usageByModel}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="spend"
                nameKey="name"
              >
                {usageByModel.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #E5E7EB', borderRadius: '8px' }}
                formatter={(value: number) => [`$${value.toLocaleString()}`, 'Spend']}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {usageByModel.slice(0, 4).map((model, index) => (
              <div key={model.id} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                  <span className="text-gray-600">{model.name}</span>
                </div>
                <span className="text-gray-400">{model.percentage}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Spending Keys */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Top Spending Keys</h3>
          <div className="space-y-3">
            {topSpendingKeys.map((key, index) => (
              <div key={key.keyId} className="flex items-center gap-3">
                <span className="text-gray-400 text-sm w-4">{index + 1}</span>
                <div className="flex-1">
                  <p className="text-gray-900 text-sm">{key.keyAlias}</p>
                  <p className="text-xs text-gray-500">{key.requests.toLocaleString()} requests</p>
                </div>
                <span className="text-green-600 font-medium">${key.spend.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Error Breakdown */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Error Breakdown</h3>
          <div className="space-y-3">
            {usageErrorBreakdown.map((error) => (
              <div key={error.type}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-600">{error.type.replace(/_/g, ' ')}</span>
                  <span className="text-gray-400">{error.count.toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-red-500"
                    style={{ width: `${error.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Requests Over Time */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Requests Over Time</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={dailyUsage}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis
              dataKey="date"
              stroke="#9CA3AF"
              fontSize={12}
              tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            />
            <YAxis stroke="#9CA3AF" fontSize={12} tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
            <Tooltip
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #E5E7EB', borderRadius: '8px' }}
              labelStyle={{ color: '#374151' }}
              formatter={(value: number) => [value.toLocaleString(), 'Requests']}
              labelFormatter={(label) => new Date(label).toLocaleDateString()}
            />
            <Line type="monotone" dataKey="requests" stroke="#4F46E5" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// By Team Tab Content
function ByTeamTab() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Team Spend Chart */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Spend by Team</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={usageByTeam} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis type="number" stroke="#9CA3AF" fontSize={12} tickFormatter={(value) => `$${value.toLocaleString()}`} />
              <YAxis type="category" dataKey="name" stroke="#9CA3AF" fontSize={12} width={180} />
              <Tooltip
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #E5E7EB', borderRadius: '8px' }}
                formatter={(value: number) => [`$${value.toLocaleString()}`, 'Spend']}
              />
              <Bar dataKey="spend" fill="#4F46E5" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Team Distribution Pie */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={usageByTeam}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="percentage"
                nameKey="name"
              >
                {usageByTeam.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #E5E7EB', borderRadius: '8px' }}
                formatter={(value: number) => [`${value}%`, 'Share']}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {usageByTeam.map((team, index) => (
              <div key={team.id} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                  <span className="text-gray-500 truncate max-w-[120px]">{team.name}</span>
                </div>
                <span className="text-gray-600">{team.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team Table */}
      <UsageTable data={usageByTeam} entityLabel="Team" icon={Users} />
    </div>
  );
}

// By Tag Tab Content
function ByTagTab() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tag Spend Chart */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Spend by Tag</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={usageByTag} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis type="number" stroke="#9CA3AF" fontSize={12} tickFormatter={(value) => `$${value.toLocaleString()}`} />
              <YAxis type="category" dataKey="name" stroke="#9CA3AF" fontSize={12} width={120} />
              <Tooltip
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #E5E7EB', borderRadius: '8px' }}
                formatter={(value: number) => [`$${value.toLocaleString()}`, 'Spend']}
              />
              <Bar dataKey="spend" fill="#F59E0B" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Tag Distribution Pie */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={usageByTag}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="percentage"
                nameKey="name"
              >
                {usageByTag.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #E5E7EB', borderRadius: '8px' }}
                formatter={(value: number) => [`${value}%`, 'Share']}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {usageByTag.map((tag, index) => (
              <div key={tag.id} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                  <span className="text-gray-500">{tag.name}</span>
                </div>
                <span className="text-gray-600">{tag.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tag Table */}
      <UsageTable data={usageByTag} entityLabel="Tag" icon={Tag} />
    </div>
  );
}

// By Customer Tab Content
function ByCustomerTab() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer Spend Chart */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Spend by Customer</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={usageByCustomer} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis type="number" stroke="#9CA3AF" fontSize={12} tickFormatter={(value) => `$${value.toLocaleString()}`} />
              <YAxis type="category" dataKey="name" stroke="#9CA3AF" fontSize={12} width={150} />
              <Tooltip
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #E5E7EB', borderRadius: '8px' }}
                formatter={(value: number) => [`$${value.toLocaleString()}`, 'Spend']}
              />
              <Bar dataKey="spend" fill="#10B981" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Customer Distribution Pie */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={usageByCustomer}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="percentage"
                nameKey="name"
              >
                {usageByCustomer.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #E5E7EB', borderRadius: '8px' }}
                formatter={(value: number) => [`${value}%`, 'Share']}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {usageByCustomer.map((customer, index) => (
              <div key={customer.id} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                  <span className="text-gray-500 truncate max-w-[120px]">{customer.name}</span>
                </div>
                <span className="text-gray-600">{customer.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Customer Table */}
      <UsageTable data={usageByCustomer} entityLabel="Customer" icon={Building2} />
    </div>
  );
}

export default function UsageAnalyticsPage() {
  const [activeTab, setActiveTab] = useState('all');

  const tabs = [
    { id: 'all', label: 'All Usage', icon: <Activity className="w-4 h-4" /> },
    { id: 'team', label: 'By Team', icon: <Users className="w-4 h-4" /> },
    { id: 'tag', label: 'By Tag', icon: <Tag className="w-4 h-4" /> },
    { id: 'customer', label: 'By Customer', icon: <Building2 className="w-4 h-4" /> },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Usage Analytics</h1>
        <p className="text-sm text-gray-500 mt-1">
          Track spending, requests, and token usage across your organization
        </p>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} variant="pills" />

      {/* Tab Content */}
      <div className="mt-6">
        <TabPanel active={activeTab === 'all'}>
          <AllUsageTab />
        </TabPanel>
        <TabPanel active={activeTab === 'team'}>
          <ByTeamTab />
        </TabPanel>
        <TabPanel active={activeTab === 'tag'}>
          <ByTagTab />
        </TabPanel>
        <TabPanel active={activeTab === 'customer'}>
          <ByCustomerTab />
        </TabPanel>
      </div>
    </div>
  );
}
