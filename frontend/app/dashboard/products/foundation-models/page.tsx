'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Box,
  DollarSign,
  Activity,
  Zap,
  Clock,
  Search,
  ArrowLeft,
  Check,
  X,
  Eye,
  Globe,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { bedrockModels, bedrockMetrics, BedrockModel } from '@/data/mock/products';
import { DataTable, Column } from '@/components/ui/DataTable';
import Modal from '@/components/ui/Modal';
import { Badge, StatusBadge } from '@/components/ui/Badge';

function KPICard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'blue',
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  color?: 'blue' | 'emerald' | 'amber' | 'purple' | 'cyan';
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    emerald: 'bg-green-50 text-green-600',
    amber: 'bg-amber-50 text-amber-600',
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
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}

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
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-50 rounded-lg">
              <Box className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-900">{model.displayName}</p>
              <p className="text-sm text-gray-500">{model.provider}</p>
            </div>
          </div>
          <StatusBadge status={model.status === 'active' ? 'success' : 'warning'}>
            {model.status}
          </StatusBadge>
        </div>

        {/* Model ID */}
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-xs text-gray-500 mb-1">Model ID</p>
          <code className="text-sm text-gray-700">{model.modelId}</code>
        </div>

        {/* Pricing */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs text-gray-500 mb-1">Input Cost</p>
            <p className="text-lg font-semibold text-gray-900">${model.inputCostPer1k.toFixed(5)}/1K tokens</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs text-gray-500 mb-1">Output Cost</p>
            <p className="text-lg font-semibold text-gray-900">${model.outputCostPer1k.toFixed(5)}/1K tokens</p>
          </div>
        </div>

        {/* Features */}
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-xs text-gray-500 mb-3">Capabilities</p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {model.supportsStreaming ? (
                <Check className="w-4 h-4 text-green-600" />
              ) : (
                <X className="w-4 h-4 text-gray-400" />
              )}
              <span className="text-sm text-gray-700">Streaming</span>
            </div>
            <div className="flex items-center gap-2">
              {model.supportsVision ? (
                <Check className="w-4 h-4 text-green-600" />
              ) : (
                <X className="w-4 h-4 text-gray-400" />
              )}
              <span className="text-sm text-gray-700">Vision</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Max Tokens:</span>
              <span className="text-sm font-medium text-gray-900">{model.maxTokens.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Regions */}
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-xs text-gray-500 mb-3">Available Regions</p>
          <div className="flex flex-wrap gap-2">
            {model.regionsAvailable.map((region) => (
              <Badge key={region} variant="default">{region}</Badge>
            ))}
          </div>
        </div>

        {/* Usage Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <Activity className="w-5 h-5 text-blue-600 mx-auto mb-2" />
            <p className="text-lg font-bold text-gray-900">{model.requests.toLocaleString()}</p>
            <p className="text-xs text-gray-500">Requests</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <Zap className="w-5 h-5 text-amber-500 mx-auto mb-2" />
            <p className="text-lg font-bold text-gray-900">{(model.tokens / 1000000).toFixed(1)}M</p>
            <p className="text-xs text-gray-500">Tokens</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <DollarSign className="w-5 h-5 text-green-600 mx-auto mb-2" />
            <p className="text-lg font-bold text-gray-900">${model.cost.toFixed(2)}</p>
            <p className="text-xs text-gray-500">Total Cost</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <Clock className="w-5 h-5 text-cyan-600 mx-auto mb-2" />
            <p className="text-lg font-bold text-gray-900">{model.avgLatencyMs}ms</p>
            <p className="text-xs text-gray-500">Avg Latency</p>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default function FoundationModelsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [providerFilter, setProviderFilter] = useState('all');
  const [selectedModel, setSelectedModel] = useState<BedrockModel | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const providers = Array.from(new Set(bedrockModels.map((m) => m.provider)));

  const filteredModels = bedrockModels.filter((model) => {
    const matchesSearch =
      model.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      model.modelId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      model.provider.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesProvider = providerFilter === 'all' || model.provider === providerFilter;
    return matchesSearch && matchesProvider;
  });

  const handleViewModel = (model: BedrockModel) => {
    setSelectedModel(model);
    setDetailModalOpen(true);
  };

  // Chart data - cost by provider
  const costByProvider = providers.map((provider) => ({
    name: provider,
    cost: bedrockModels.filter((m) => m.provider === provider).reduce((sum, m) => sum + m.cost, 0),
  }));

  const columns: Column<BedrockModel>[] = [
    {
      key: 'displayName',
      header: 'Model',
      sortable: true,
      render: (model) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 rounded-lg">
            <Box className="w-4 h-4 text-indigo-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">{model.displayName}</p>
            <p className="text-xs text-gray-500">{model.provider}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'region',
      header: 'Region',
      sortable: true,
      render: (model) => (
        <div className="flex items-center gap-1">
          <Globe className="w-3 h-3 text-gray-400" />
          <span className="text-gray-600 text-sm">{model.region}</span>
        </div>
      ),
    },
    {
      key: 'requests',
      header: 'Requests',
      sortable: true,
      render: (model) => <span className="text-gray-900">{model.requests.toLocaleString()}</span>,
    },
    {
      key: 'tokens',
      header: 'Tokens',
      sortable: true,
      render: (model) => <span className="text-gray-600">{(model.tokens / 1000000).toFixed(1)}M</span>,
    },
    {
      key: 'cost',
      header: 'Cost',
      sortable: true,
      render: (model) => <span className="text-green-600 font-medium">${model.cost.toFixed(2)}</span>,
    },
    {
      key: 'avgLatencyMs',
      header: 'Latency',
      sortable: true,
      render: (model) => (
        <span className={`text-sm ${model.avgLatencyMs > 2000 ? 'text-amber-600' : 'text-gray-600'}`}>
          {model.avgLatencyMs}ms
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (model) => (
        <StatusBadge status={model.status === 'active' ? 'success' : 'warning'}>
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
          className="p-1.5 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600"
        >
          <Eye className="w-4 h-4" />
        </button>
      ),
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/dashboard/products"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Products
        </Link>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <Box className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Foundation Models</h1>
            <p className="text-sm text-gray-500">Pre-trained models from various providers</p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <KPICard
          title="Total Spend"
          value={`$${bedrockMetrics.totalSpend.toFixed(2)}`}
          subtitle="This month"
          icon={DollarSign}
          color="purple"
        />
        <KPICard
          title="Total Requests"
          value={`${(bedrockMetrics.totalRequests / 1000).toFixed(0)}k`}
          icon={Activity}
          color="blue"
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
          color="cyan"
        />
        <KPICard
          title="Active Models"
          value={bedrockMetrics.activeModels}
          icon={Box}
          color="emerald"
        />
      </div>

      {/* Chart */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Cost by Provider</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={costByProvider}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} />
            <YAxis stroke="#9CA3AF" fontSize={12} tickFormatter={(v) => `$${v}`} />
            <Tooltip
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #E5E7EB', borderRadius: '8px' }}
              formatter={(value: number) => [`$${value.toFixed(2)}`, 'Cost']}
            />
            <Bar dataKey="cost" fill="#4F46E5" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search models..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <select
          value={providerFilter}
          onChange={(e) => setProviderFilter(e.target.value)}
          className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">All Providers</option>
          {providers.map((provider) => (
            <option key={provider} value={provider}>{provider}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <DataTable
        data={filteredModels}
        columns={columns}
        pageSize={10}
        onRowClick={handleViewModel}
      />

      {/* Model Detail Modal */}
      <ModelDetailModal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        model={selectedModel}
      />
    </div>
  );
}
