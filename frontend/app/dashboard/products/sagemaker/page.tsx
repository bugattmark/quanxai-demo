'use client';

import { useState } from 'react';
import {
  Server,
  DollarSign,
  Activity,
  Clock,
  TrendingUp,
  Eye,
  Play,
  Pause,
  Settings,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  sagemakerEndpoints,
  sagemakerMetrics,
  SageMakerEndpoint,
} from '@/data/mock/products';
import { DataTable, Column } from '@/components/ui/DataTable';
import Modal from '@/components/ui/Modal';
import { Badge, StatusBadge, RegionBadge } from '@/components/ui/Badge';

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

// Endpoint Detail Modal
function EndpointDetailModal({
  isOpen,
  onClose,
  endpoint,
}: {
  isOpen: boolean;
  onClose: () => void;
  endpoint: SageMakerEndpoint | null;
}) {
  if (!endpoint) return null;

  const statusColors = {
    InService: 'success' as const,
    Creating: 'info' as const,
    Updating: 'warning' as const,
    Failed: 'error' as const,
    Deleting: 'error' as const,
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Endpoint Details" size="lg">
      <div className="space-y-6">
        {/* Endpoint Header */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-semibold text-white">{endpoint.endpointName}</h3>
            <p className="text-sm text-slate-400 mt-1">{endpoint.modelName}</p>
          </div>
          <StatusBadge status={statusColors[endpoint.status]}>
            {endpoint.status}
          </StatusBadge>
        </div>

        {/* Instance Info */}
        <div className="bg-slate-800/50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-white mb-3">Instance Configuration</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-slate-500">Instance Type</p>
              <p className="text-white font-mono">{endpoint.instanceType}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Instance Count</p>
              <p className="text-white">{endpoint.instanceCount}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Region</p>
              <div className="mt-1">
                <RegionBadge region={endpoint.region} />
              </div>
            </div>
            <div>
              <p className="text-xs text-slate-500">Created</p>
              <p className="text-white">{new Date(endpoint.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-800/50 rounded-lg p-4 text-center">
            <Activity className="w-5 h-5 text-blue-400 mx-auto mb-2" />
            <p className="text-lg font-bold text-white">{endpoint.requestsPerHour.toLocaleString()}</p>
            <p className="text-xs text-slate-500">Requests/Hour</p>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-4 text-center">
            <DollarSign className="w-5 h-5 text-emerald-400 mx-auto mb-2" />
            <p className="text-lg font-bold text-white">${endpoint.costPerHour.toFixed(2)}</p>
            <p className="text-xs text-slate-500">Cost/Hour</p>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-4 text-center">
            <Clock className="w-5 h-5 text-amber-400 mx-auto mb-2" />
            <p className="text-lg font-bold text-white">{endpoint.avgLatencyMs}ms</p>
            <p className="text-xs text-slate-500">Avg Latency</p>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-4 text-center">
            <CheckCircle className="w-5 h-5 text-emerald-400 mx-auto mb-2" />
            <p className="text-lg font-bold text-white">{endpoint.successRate}%</p>
            <p className="text-xs text-slate-500">Success Rate</p>
          </div>
        </div>

        {/* Estimated Costs */}
        <div className="bg-slate-800/50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-white mb-3">Estimated Costs</h4>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-slate-500">Daily</p>
              <p className="text-lg font-semibold text-white">${(endpoint.costPerHour * 24).toFixed(2)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Weekly</p>
              <p className="text-lg font-semibold text-white">${(endpoint.costPerHour * 24 * 7).toFixed(2)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Monthly</p>
              <p className="text-lg font-semibold text-emerald-400">${(endpoint.costPerHour * 730).toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {endpoint.status === 'InService' && (
            <button className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors">
              <Pause className="w-4 h-4" />
              Stop Endpoint
            </button>
          )}
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors">
            <Settings className="w-4 h-4" />
            Update Configuration
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default function SageMakerPage() {
  const [selectedEndpoint, setSelectedEndpoint] = useState<SageMakerEndpoint | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const handleViewEndpoint = (endpoint: SageMakerEndpoint) => {
    setSelectedEndpoint(endpoint);
    setDetailModalOpen(true);
  };

  // Generate mock hourly data
  const hourlyData = Array.from({ length: 24 }, (_, i) => ({
    hour: `${i.toString().padStart(2, '0')}:00`,
    requests: Math.floor(sagemakerMetrics.totalRequestsPerHour * (0.5 + Math.random() * 0.5)),
    cost: sagemakerMetrics.totalCostPerHour * (0.8 + Math.random() * 0.4),
  }));

  // Cost by instance type
  const costByInstance = sagemakerEndpoints.reduce((acc, endpoint) => {
    const existing = acc.find(i => i.type === endpoint.instanceType);
    if (existing) {
      existing.cost += endpoint.costPerHour;
      existing.count += 1;
    } else {
      acc.push({ type: endpoint.instanceType, cost: endpoint.costPerHour, count: 1 });
    }
    return acc;
  }, [] as { type: string; cost: number; count: number }[]).sort((a, b) => b.cost - a.cost);

  // Table columns
  const columns: Column<SageMakerEndpoint>[] = [
    {
      key: 'endpointName',
      header: 'Endpoint',
      sortable: true,
      render: (endpoint) => (
        <div>
          <p className="font-medium text-white">{endpoint.endpointName}</p>
          <p className="text-xs text-slate-500">{endpoint.modelName}</p>
        </div>
      ),
    },
    {
      key: 'instanceType',
      header: 'Instance',
      sortable: true,
      render: (endpoint) => (
        <div>
          <code className="text-sm text-slate-300">{endpoint.instanceType}</code>
          <p className="text-xs text-slate-500">{endpoint.instanceCount} instance(s)</p>
        </div>
      ),
    },
    {
      key: 'region',
      header: 'Region',
      sortable: true,
      render: (endpoint) => <RegionBadge region={endpoint.region} />,
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (endpoint) => {
        const statusColors = {
          InService: 'success' as const,
          Creating: 'info' as const,
          Updating: 'warning' as const,
          Failed: 'error' as const,
          Deleting: 'error' as const,
        };
        return (
          <StatusBadge status={statusColors[endpoint.status]}>
            {endpoint.status}
          </StatusBadge>
        );
      },
    },
    {
      key: 'requestsPerHour',
      header: 'Req/Hour',
      sortable: true,
      render: (endpoint) => (
        <span className="text-slate-300">{endpoint.requestsPerHour.toLocaleString()}</span>
      ),
    },
    {
      key: 'costPerHour',
      header: 'Cost/Hour',
      sortable: true,
      render: (endpoint) => (
        <span className="text-emerald-400 font-medium">${endpoint.costPerHour.toFixed(2)}</span>
      ),
    },
    {
      key: 'avgLatencyMs',
      header: 'Latency',
      sortable: true,
      render: (endpoint) => (
        <span className={endpoint.avgLatencyMs > 500 ? 'text-amber-400' : 'text-slate-300'}>
          {endpoint.avgLatencyMs}ms
        </span>
      ),
    },
    {
      key: 'successRate',
      header: 'Success',
      sortable: true,
      render: (endpoint) => (
        <span className={endpoint.successRate < 99 ? 'text-amber-400' : 'text-emerald-400'}>
          {endpoint.successRate}%
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (endpoint) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleViewEndpoint(endpoint);
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
          <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-violet-600">
            <Server className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">AWS SageMaker</h1>
        </div>
        <p className="text-slate-400">
          Custom model endpoints for real-time inference and batch processing
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard
          title="Total Endpoints"
          value={sagemakerMetrics.totalEndpoints}
          subtitle={`${sagemakerMetrics.activeEndpoints} active`}
          icon={Server}
          color="purple"
        />
        <KPICard
          title="Hourly Cost"
          value={`$${sagemakerMetrics.totalCostPerHour.toFixed(2)}`}
          subtitle={`~$${(sagemakerMetrics.totalCostPerHour * 730).toFixed(0)}/mo`}
          icon={DollarSign}
          color="emerald"
        />
        <KPICard
          title="Requests/Hour"
          value={sagemakerMetrics.totalRequestsPerHour.toLocaleString()}
          icon={Activity}
          color="blue"
          trend={{ value: 15.2, label: 'vs last hour' }}
        />
        <KPICard
          title="Custom Models"
          value={sagemakerMetrics.customModels}
          icon={Settings}
          color="amber"
        />
        <KPICard
          title="Active"
          value={sagemakerMetrics.activeEndpoints}
          subtitle={`of ${sagemakerMetrics.totalEndpoints} total`}
          icon={CheckCircle}
          color="orange"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Requests Over Time */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Requests (Last 24 Hours)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={hourlyData}>
              <defs>
                <linearGradient id="smRequests" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="hour" stroke="#64748B" fontSize={12} />
              <YAxis stroke="#64748B" fontSize={12} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '8px' }}
                formatter={(value: number) => [value.toLocaleString(), 'Requests']}
              />
              <Area type="monotone" dataKey="requests" stroke="#8B5CF6" fill="url(#smRequests)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Cost by Instance Type */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Cost by Instance Type</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={costByInstance} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis type="number" stroke="#64748B" fontSize={12} tickFormatter={(value) => `$${value}/hr`} />
              <YAxis type="category" dataKey="type" stroke="#64748B" fontSize={11} width={100} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '8px' }}
                formatter={(value: number) => [`$${value.toFixed(2)}/hr`, 'Cost']}
              />
              <Bar dataKey="cost" fill="#8B5CF6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Endpoints Table */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Endpoints</h3>
          <button className="flex items-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm">
            <Play className="w-4 h-4" />
            Create Endpoint
          </button>
        </div>
        <DataTable
          data={sagemakerEndpoints}
          columns={columns}
          pageSize={10}
          onRowClick={handleViewEndpoint}
        />
      </div>

      {/* Endpoint Detail Modal */}
      <EndpointDetailModal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        endpoint={selectedEndpoint}
      />
    </div>
  );
}
