'use client';

import { useState } from 'react';
import {
  DollarSign,
  Tag,
  Users,
  Building2,
  Download,
  Filter,
  TrendingUp,
  PieChart as PieChartIcon,
} from 'lucide-react';
import {
  BarChart,
  Bar,
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
import {
  costAllocationByTag,
  costAllocationByTeam,
  costAllocationByEnvironment,
  CostAllocation,
} from '@/data/mock/products';
import { Tabs, TabPanel } from '@/components/ui/Tabs';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#EC4899'];

// KPI Card Component
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
  color?: 'blue' | 'emerald' | 'amber' | 'red' | 'purple';
}) {
  const colorClasses = {
    blue: 'from-blue-500/20 to-blue-600/5 border-blue-500/30',
    emerald: 'from-emerald-500/20 to-emerald-600/5 border-emerald-500/30',
    amber: 'from-amber-500/20 to-amber-600/5 border-amber-500/30',
    red: 'from-red-500/20 to-red-600/5 border-red-500/30',
    purple: 'from-purple-500/20 to-purple-600/5 border-purple-500/30',
  };

  const iconColorClasses = {
    blue: 'text-blue-400',
    emerald: 'text-emerald-400',
    amber: 'text-amber-400',
    red: 'text-red-400',
    purple: 'text-purple-400',
  };

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} border rounded-xl p-5`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-400">{title}</p>
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
          {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
          {trend && (
            <div className={`flex items-center gap-1 text-xs mt-2 ${trend.value >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              <TrendingUp className="w-3 h-3" />
              <span>{trend.value >= 0 ? '+' : ''}{trend.value}% {trend.label}</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg bg-slate-800/50 ${iconColorClasses[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}

// Cost Allocation Table Component
function CostAllocationTable({
  data,
  tagLabel,
}: {
  data: CostAllocation[];
  tagLabel: string;
}) {
  const columns: Column<CostAllocation>[] = [
    {
      key: 'tagValue',
      header: tagLabel,
      sortable: true,
      render: (item) => (
        <Badge variant="default" className="font-medium">
          {item.tagValue}
        </Badge>
      ),
    },
    {
      key: 'cost',
      header: 'Cost',
      sortable: true,
      render: (item) => (
        <span className="text-emerald-400 font-medium">${item.cost.toLocaleString()}</span>
      ),
    },
    {
      key: 'requests',
      header: 'Requests',
      sortable: true,
      render: (item) => <span className="text-slate-300">{item.requests.toLocaleString()}</span>,
    },
    {
      key: 'tokens',
      header: 'Tokens',
      sortable: true,
      render: (item) => <span className="text-slate-300">{(item.tokens / 1000000).toFixed(1)}M</span>,
    },
    {
      key: 'percentage',
      header: '% of Total',
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-2">
          <div className="w-20 bg-slate-700 rounded-full h-2">
            <div
              className="h-2 rounded-full bg-blue-500"
              style={{ width: `${item.percentage}%` }}
            />
          </div>
          <span className="text-slate-400 text-sm">{item.percentage}%</span>
        </div>
      ),
    },
  ];

  return <DataTable data={data} columns={columns} pageSize={10} />;
}

// By Project Tab
function ByProjectTab() {
  const totalCost = costAllocationByTag.reduce((sum, item) => sum + item.cost, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Cost Distribution by Project</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={costAllocationByTag}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="cost"
                nameKey="tagValue"
                label={({ tagValue, percentage }) => `${tagValue}: ${percentage}%`}
                labelLine={false}
              >
                {costAllocationByTag.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '8px' }}
                formatter={(value: number) => [`$${value.toLocaleString()}`, 'Cost']}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Cost Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={costAllocationByTag} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis type="number" stroke="#64748B" fontSize={12} tickFormatter={(value) => `$${value}`} />
              <YAxis type="category" dataKey="tagValue" stroke="#64748B" fontSize={12} width={120} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '8px' }}
                formatter={(value: number) => [`$${value.toLocaleString()}`, 'Cost']}
              />
              <Bar dataKey="cost" radius={[0, 4, 4, 0]}>
                {costAllocationByTag.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Table */}
      <CostAllocationTable data={costAllocationByTag} tagLabel="Project" />
    </div>
  );
}

// By Team Tab
function ByTeamTab() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Cost Distribution by Team</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={costAllocationByTeam}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="cost"
                nameKey="tagValue"
              >
                {costAllocationByTeam.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '8px' }}
                formatter={(value: number) => [`$${value.toLocaleString()}`, 'Cost']}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Cost Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={costAllocationByTeam} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis type="number" stroke="#64748B" fontSize={12} tickFormatter={(value) => `$${value}`} />
              <YAxis type="category" dataKey="tagValue" stroke="#64748B" fontSize={12} width={120} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '8px' }}
                formatter={(value: number) => [`$${value.toLocaleString()}`, 'Cost']}
              />
              <Bar dataKey="cost" radius={[0, 4, 4, 0]}>
                {costAllocationByTeam.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Table */}
      <CostAllocationTable data={costAllocationByTeam} tagLabel="Team" />
    </div>
  );
}

// By Environment Tab
function ByEnvironmentTab() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Cost Distribution by Environment</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={costAllocationByEnvironment}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="cost"
                nameKey="tagValue"
              >
                {costAllocationByEnvironment.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '8px' }}
                formatter={(value: number) => [`$${value.toLocaleString()}`, 'Cost']}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Environment Cards */}
        <div className="space-y-4">
          {costAllocationByEnvironment.map((env, index) => (
            <div
              key={env.tagValue}
              className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 flex items-center gap-4"
            >
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <div className="flex-1">
                <p className="text-white font-medium capitalize">{env.tagValue}</p>
                <p className="text-xs text-slate-500">{env.requests.toLocaleString()} requests</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold text-emerald-400">${env.cost.toLocaleString()}</p>
                <p className="text-xs text-slate-500">{env.percentage}% of total</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Table */}
      <CostAllocationTable data={costAllocationByEnvironment} tagLabel="Environment" />
    </div>
  );
}

export default function CostAllocationPage() {
  const [activeTab, setActiveTab] = useState('project');

  const totalCost = costAllocationByTag.reduce((sum, item) => sum + item.cost, 0);
  const totalRequests = costAllocationByTag.reduce((sum, item) => sum + item.requests, 0);
  const totalTokens = costAllocationByTag.reduce((sum, item) => sum + item.tokens, 0);

  const tabs = [
    { id: 'project', label: 'By Project', icon: <Tag className="w-4 h-4" /> },
    { id: 'team', label: 'By Team', icon: <Users className="w-4 h-4" /> },
    { id: 'environment', label: 'By Environment', icon: <Building2 className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Cost Allocation</h1>
          </div>
          <p className="text-slate-400">
            Track and allocate AWS AI/ML costs by tags, teams, and business units
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors">
          <Download className="w-4 h-4" />
          Export Report
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total AWS Cost"
          value={`$${totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          subtitle="This month"
          icon={DollarSign}
          color="emerald"
          trend={{ value: 12.5, label: 'vs last month' }}
        />
        <KPICard
          title="Total Requests"
          value={`${(totalRequests / 1000).toFixed(0)}k`}
          icon={PieChartIcon}
          color="blue"
        />
        <KPICard
          title="Total Tokens"
          value={`${(totalTokens / 1000000).toFixed(1)}M`}
          icon={Tag}
          color="amber"
        />
        <KPICard
          title="Cost Tags Used"
          value="12"
          subtitle="Across 5 teams"
          icon={Building2}
          color="purple"
        />
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} variant="pills" />

      {/* Tab Content */}
      <TabPanel active={activeTab === 'project'}>
        <ByProjectTab />
      </TabPanel>
      <TabPanel active={activeTab === 'team'}>
        <ByTeamTab />
      </TabPanel>
      <TabPanel active={activeTab === 'environment'}>
        <ByEnvironmentTab />
      </TabPanel>
    </div>
  );
}
