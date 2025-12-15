'use client';

import { useState } from 'react';
import {
  Cloud,
  DollarSign,
  Activity,
  Zap,
  Clock,
  TrendingUp,
  Globe,
  Eye,
  Settings,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import {
  AreaChart,
  Area,
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
  bedrockModels,
  bedrockMetrics,
  bedrockDailyTrend,
  regionalBreakdown,
  BedrockModel,
} from '@/data/mock/products';
import { DataTable, Column } from '@/components/ui/DataTable';
import Modal from '@/components/ui/Modal';
import { Badge, StatusBadge, ProviderBadge, RegionBadge } from '@/components/ui/Badge';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

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
  color?: 'blue' | 'emerald' | 'amber' | 'red' | 'purple' | 'orange';
}) {
  const colorClasses = {
    blue: 'from-blue-500/20 to-blue-600/5 border-blue-500/30',
    emerald: 'from-emerald-500/20 to-emerald-600/5 border-emerald-500/30',
    amber: 'from-amber-500/20 to-amber-600/5 border-amber-500/30',
    red: 'from-red-500/20 to-red-600/5 border-red-500/30',
    purple: 'from-purple-500/20 to-purple-600/5 border-purple-500/30',
    orange: 'from-orange-500/20 to-orange-600/5 border-orange-500/30',
  };

  const iconColorClasses = {
    blue: 'text-blue-400',
    emerald: 'text-emerald-400',
    amber: 'text-amber-400',
    red: 'text-red-400',
    purple: 'text-purple-400',
    orange: 'text-orange-400',
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

// Model Detail Modal
function ModelDetailModal({
  isOpen,
  onClose,
  model,
}: {
  isOpen: boolean;
  onClose: () => void;
  model: BedrockModel | null;
}) {
  if (!model) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Model Details" size="lg">
      <div className="space-y-6">
        {/* Model Header */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-semibold text-white">{model.displayName}</h3>
            <code className="text-sm text-slate-400 font-mono mt-1 block">{model.modelId}</code>
          </div>
          <StatusBadge status={model.status === 'active' ? 'success' : 'error'}>
            {model.status}
          </StatusBadge>
        </div>

        {/* Provider & Region */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-xs text-slate-500">Provider</span>
            <div className="mt-1">
              <ProviderBadge provider={model.provider.toLowerCase()} />
            </div>
          </div>
          <div>
            <span className="text-xs text-slate-500">Primary Region</span>
            <div className="mt-1">
              <RegionBadge region={model.region} />
            </div>
          </div>
        </div>

        {/* Available Regions */}
        <div>
          <span className="text-xs text-slate-500 mb-2 block">Available Regions</span>
          <div className="flex flex-wrap gap-2">
            {model.regionsAvailable.map((region) => (
              <Badge key={region} variant="default">{region}</Badge>
            ))}
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-slate-800/50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-white mb-3">Pricing ({model.pricingTier})</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-slate-500">Input Cost</p>
              <p className="text-lg font-semibold text-blue-400">${model.inputCostPer1k.toFixed(5)} / 1K tokens</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Output Cost</p>
              <p className="text-lg font-semibold text-emerald-400">${model.outputCostPer1k.toFixed(5)} / 1K tokens</p>
            </div>
          </div>
        </div>

        {/* Capabilities */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-slate-800/50 rounded-lg p-3 text-center">
            <p className="text-xs text-slate-500 mb-1">Max Tokens</p>
            <p className="text-lg font-semibold text-white">{model.maxTokens.toLocaleString()}</p>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-3 text-center">
            <p className="text-xs text-slate-500 mb-1">Streaming</p>
            <div className="flex items-center justify-center mt-1">
              {model.supportsStreaming ? (
                <CheckCircle className="w-5 h-5 text-emerald-400" />
              ) : (
                <XCircle className="w-5 h-5 text-slate-500" />
              )}
            </div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-3 text-center">
            <p className="text-xs text-slate-500 mb-1">Vision</p>
            <div className="flex items-center justify-center mt-1">
              {model.supportsVision ? (
                <CheckCircle className="w-5 h-5 text-emerald-400" />
              ) : (
                <XCircle className="w-5 h-5 text-slate-500" />
              )}
            </div>
          </div>
        </div>

        {/* Usage Stats */}
        <div className="bg-slate-800/50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-white mb-3">Usage Statistics</h4>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-slate-500">Requests</p>
              <p className="text-lg font-semibold text-white">{model.requests.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Tokens</p>
              <p className="text-lg font-semibold text-white">{(model.tokens / 1000000).toFixed(1)}M</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Cost</p>
              <p className="text-lg font-semibold text-emerald-400">${model.cost.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Avg Latency</p>
              <p className="text-lg font-semibold text-white">{model.avgLatencyMs}ms</p>
            </div>
          </div>
        </div>

        {/* Success Rate */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">Success Rate</span>
            <span className="text-sm text-white">{model.successRate}%</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div
              className="h-2 rounded-full bg-emerald-500"
              style={{ width: `${model.successRate}%` }}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default function BedrockPage() {
  const [selectedModel, setSelectedModel] = useState<BedrockModel | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const handleViewModel = (model: BedrockModel) => {
    setSelectedModel(model);
    setDetailModalOpen(true);
  };

  // Cost by provider
  const costByProvider = bedrockModels.reduce((acc, model) => {
    const existing = acc.find(p => p.name === model.provider);
    if (existing) {
      existing.value += model.cost;
    } else {
      acc.push({ name: model.provider, value: model.cost });
    }
    return acc;
  }, [] as { name: string; value: number }[]).sort((a, b) => b.value - a.value);

  // Table columns
  const columns: Column<BedrockModel>[] = [
    {
      key: 'displayName',
      header: 'Model',
      sortable: true,
      render: (model) => (
        <div>
          <p className="font-medium text-white">{model.displayName}</p>
          <code className="text-xs text-slate-500 font-mono">{model.modelId.substring(0, 30)}...</code>
        </div>
      ),
    },
    {
      key: 'provider',
      header: 'Provider',
      sortable: true,
      render: (model) => <ProviderBadge provider={model.provider.toLowerCase()} />,
    },
    {
      key: 'region',
      header: 'Region',
      sortable: true,
      render: (model) => <RegionBadge region={model.region} />,
    },
    {
      key: 'requests',
      header: 'Requests',
      sortable: true,
      render: (model) => <span className="text-slate-300">{model.requests.toLocaleString()}</span>,
    },
    {
      key: 'tokens',
      header: 'Tokens',
      sortable: true,
      render: (model) => <span className="text-slate-300">{(model.tokens / 1000000).toFixed(1)}M</span>,
    },
    {
      key: 'cost',
      header: 'Cost',
      sortable: true,
      render: (model) => <span className="text-emerald-400 font-medium">${model.cost.toLocaleString()}</span>,
    },
    {
      key: 'avgLatencyMs',
      header: 'Latency',
      sortable: true,
      render: (model) => (
        <span className={model.avgLatencyMs > 2000 ? 'text-amber-400' : 'text-slate-300'}>
          {model.avgLatencyMs}ms
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (model) => (
        <StatusBadge status={model.status === 'active' ? 'success' : 'error'}>
          {model.status}
        </StatusBadge>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (model) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleViewModel(model);
          }}
          className="p-1.5 hover:bg-slate-700 rounded text-slate-400 hover:text-white"
        >
          <Eye className="w-4 h-4" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500 to-amber-600">
            <Cloud className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">AWS Bedrock</h1>
        </div>
        <p className="text-slate-400">
          Foundation models from leading AI providers available through Amazon Bedrock
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard
          title="Total Spend"
          value={`$${bedrockMetrics.totalSpend.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          subtitle="This month"
          icon={DollarSign}
          color="orange"
          trend={{ value: 18.5, label: 'vs last month' }}
        />
        <KPICard
          title="Total Requests"
          value={`${(bedrockMetrics.totalRequests / 1000).toFixed(0)}k`}
          icon={Activity}
          color="blue"
          trend={{ value: 22.3, label: 'vs last month' }}
        />
        <KPICard
          title="Total Tokens"
          value={`${(bedrockMetrics.totalTokens / 1000000).toFixed(1)}M`}
          icon={Zap}
          color="amber"
        />
        <KPICard
          title="Avg Latency"
          value={`${bedrockMetrics.avgLatency}ms`}
          icon={Clock}
          color="purple"
        />
        <KPICard
          title="Cross-Region Calls"
          value={bedrockMetrics.crossRegionCalls.toLocaleString()}
          icon={Globe}
          color="emerald"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spend Trend */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Cost Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={bedrockDailyTrend}>
              <defs>
                <linearGradient id="bedrockCost" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis
                dataKey="date"
                stroke="#64748B"
                fontSize={12}
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis stroke="#64748B" fontSize={12} tickFormatter={(value) => `$${value}`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '8px' }}
                formatter={(value: number) => [`$${value.toFixed(2)}`, 'Cost']}
                labelFormatter={(label) => new Date(label).toLocaleDateString()}
              />
              <Area type="monotone" dataKey="cost" stroke="#F59E0B" fill="url(#bedrockCost)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Cost by Provider */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Cost by Provider</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={costByProvider} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis type="number" stroke="#64748B" fontSize={12} tickFormatter={(value) => `$${value}`} />
              <YAxis type="category" dataKey="name" stroke="#64748B" fontSize={12} width={80} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '8px' }}
                formatter={(value: number) => [`$${value.toFixed(2)}`, 'Cost']}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {costByProvider.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Models Table */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Available Models</h3>
        <DataTable
          data={bedrockModels}
          columns={columns}
          pageSize={10}
          onRowClick={handleViewModel}
        />
      </div>

      {/* Model Detail Modal */}
      <ModelDetailModal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        model={selectedModel}
      />
    </div>
  );
}
