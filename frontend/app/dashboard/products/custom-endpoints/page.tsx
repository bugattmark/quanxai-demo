'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Cpu,
  DollarSign,
  Activity,
  Clock,
  Search,
  ArrowLeft,
  Eye,
  Server,
  Globe,
  Plus,
} from 'lucide-react';
import { sagemakerEndpoints, sagemakerMetrics, SageMakerEndpoint } from '@/data/mock/products';
import { DataTable, Column } from '@/components/ui/DataTable';
import Modal from '@/components/ui/Modal';
import { StatusBadge } from '@/components/ui/Badge';

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'InService':
        return 'success';
      case 'Creating':
      case 'Updating':
        return 'warning';
      case 'Failed':
      case 'Deleting':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Endpoint Details" size="lg">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-50 rounded-lg">
              <Cpu className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-900">{endpoint.endpointName}</p>
              <p className="text-sm text-gray-500">{endpoint.modelName}</p>
            </div>
          </div>
          <StatusBadge status={getStatusColor(endpoint.status) as 'success' | 'warning' | 'error' | 'default'}>
            {endpoint.status}
          </StatusBadge>
        </div>

        {/* Instance Info */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs text-gray-500 mb-1">Instance Type</p>
            <p className="text-lg font-semibold text-gray-900">{endpoint.instanceType}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs text-gray-500 mb-1">Instance Count</p>
            <p className="text-lg font-semibold text-gray-900">{endpoint.instanceCount}</p>
          </div>
        </div>

        {/* Region & Created */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <Globe className="w-3 h-3 text-gray-400" />
              <p className="text-xs text-gray-500">Region</p>
            </div>
            <p className="text-gray-900">{endpoint.region}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs text-gray-500 mb-1">Created</p>
            <p className="text-gray-900">{new Date(endpoint.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Usage Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <Activity className="w-5 h-5 text-blue-600 mx-auto mb-2" />
            <p className="text-lg font-bold text-gray-900">{endpoint.requestsPerHour.toLocaleString()}</p>
            <p className="text-xs text-gray-500">Requests/Hour</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <DollarSign className="w-5 h-5 text-green-600 mx-auto mb-2" />
            <p className="text-lg font-bold text-gray-900">${endpoint.costPerHour.toFixed(2)}</p>
            <p className="text-xs text-gray-500">Cost/Hour</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <Clock className="w-5 h-5 text-cyan-600 mx-auto mb-2" />
            <p className="text-lg font-bold text-gray-900">{endpoint.avgLatencyMs}ms</p>
            <p className="text-xs text-gray-500">Avg Latency</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <Activity className="w-5 h-5 text-emerald-600 mx-auto mb-2" />
            <p className="text-lg font-bold text-gray-900">{endpoint.successRate}%</p>
            <p className="text-xs text-gray-500">Success Rate</p>
          </div>
        </div>

        {/* Estimated Monthly Cost */}
        <div className="bg-purple-50 rounded-lg p-4">
          <p className="text-xs text-purple-600 mb-1">Estimated Monthly Cost</p>
          <p className="text-2xl font-bold text-purple-700">
            ${(endpoint.costPerHour * 730).toFixed(2)}
          </p>
          <p className="text-xs text-purple-500 mt-1">Based on 730 hours/month</p>
        </div>
      </div>
    </Modal>
  );
}

export default function CustomEndpointsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedEndpoint, setSelectedEndpoint] = useState<SageMakerEndpoint | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const filteredEndpoints = sagemakerEndpoints.filter((endpoint) => {
    const matchesSearch =
      endpoint.endpointName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      endpoint.modelName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || endpoint.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleViewEndpoint = (endpoint: SageMakerEndpoint) => {
    setSelectedEndpoint(endpoint);
    setDetailModalOpen(true);
  };

  const getStatusBadgeStatus = (status: string): 'success' | 'warning' | 'error' | 'default' => {
    switch (status) {
      case 'InService':
        return 'success';
      case 'Creating':
      case 'Updating':
        return 'warning';
      case 'Failed':
      case 'Deleting':
        return 'error';
      default:
        return 'default';
    }
  };

  const columns: Column<SageMakerEndpoint>[] = [
    {
      key: 'endpointName',
      header: 'Endpoint',
      sortable: true,
      render: (endpoint) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-50 rounded-lg">
            <Cpu className="w-4 h-4 text-purple-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">{endpoint.endpointName}</p>
            <p className="text-xs text-gray-500">{endpoint.modelName}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'instanceType',
      header: 'Instance',
      sortable: true,
      render: (endpoint) => (
        <div>
          <p className="text-gray-900 text-sm">{endpoint.instanceType}</p>
          <p className="text-xs text-gray-500">{endpoint.instanceCount} instance(s)</p>
        </div>
      ),
    },
    {
      key: 'region',
      header: 'Region',
      sortable: true,
      render: (endpoint) => (
        <div className="flex items-center gap-1">
          <Globe className="w-3 h-3 text-gray-400" />
          <span className="text-gray-600 text-sm">{endpoint.region}</span>
        </div>
      ),
    },
    {
      key: 'requestsPerHour',
      header: 'Req/Hour',
      sortable: true,
      render: (endpoint) => <span className="text-gray-900">{endpoint.requestsPerHour.toLocaleString()}</span>,
    },
    {
      key: 'costPerHour',
      header: 'Cost/Hour',
      sortable: true,
      render: (endpoint) => <span className="text-green-600 font-medium">${endpoint.costPerHour.toFixed(2)}</span>,
    },
    {
      key: 'avgLatencyMs',
      header: 'Latency',
      sortable: true,
      render: (endpoint) => (
        <span className={`text-sm ${endpoint.avgLatencyMs > 500 ? 'text-amber-600' : 'text-gray-600'}`}>
          {endpoint.avgLatencyMs}ms
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (endpoint) => (
        <StatusBadge status={getStatusBadgeStatus(endpoint.status)}>
          {endpoint.status}
        </StatusBadge>
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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Cpu className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Custom Endpoints</h1>
              <p className="text-sm text-gray-500">Self-hosted and fine-tuned model endpoints</p>
            </div>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium">
            <Plus className="w-4 h-4" />
            Create Endpoint
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPICard
          title="Total Endpoints"
          value={sagemakerMetrics.totalEndpoints}
          subtitle={`${sagemakerMetrics.activeEndpoints} active`}
          icon={Server}
          color="purple"
        />
        <KPICard
          title="Total Cost/Hour"
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
        />
        <KPICard
          title="Custom Models"
          value={sagemakerMetrics.customModels}
          icon={Cpu}
          color="cyan"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search endpoints..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">All Status</option>
          <option value="InService">In Service</option>
          <option value="Creating">Creating</option>
          <option value="Updating">Updating</option>
          <option value="Failed">Failed</option>
        </select>
      </div>

      {/* Table */}
      <DataTable
        data={filteredEndpoints}
        columns={columns}
        pageSize={10}
        onRowClick={handleViewEndpoint}
      />

      {/* Endpoint Detail Modal */}
      <EndpointDetailModal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        endpoint={selectedEndpoint}
      />
    </div>
  );
}
