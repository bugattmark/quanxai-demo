'use client';

import { useState } from 'react';
import {
  FileText,
  Search,
  Filter,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  DollarSign,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { requestLogs, logMetrics, logsErrorBreakdown, RequestLog } from '@/data/mock/logs';
import { DataTable, Column } from '@/components/ui/DataTable';
import Modal from '@/components/ui/Modal';
import { Badge, StatusBadge, ProviderBadge } from '@/components/ui/Badge';

// KPI Card Component - Light Theme
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
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}

// Log Detail Modal - Light Theme
function LogDetailModal({
  isOpen,
  onClose,
  log,
}: {
  isOpen: boolean;
  onClose: () => void;
  log: RequestLog | null;
}) {
  if (!log) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Request Details" size="lg">
      <div className="space-y-6">
        {/* Status Banner */}
        <div
          className={`p-4 rounded-lg flex items-center gap-3 ${
            log.status === 'success'
              ? 'bg-green-50 border border-green-200'
              : 'bg-red-50 border border-red-200'
          }`}
        >
          {log.status === 'success' ? (
            <CheckCircle className="w-5 h-5 text-green-600" />
          ) : (
            <XCircle className="w-5 h-5 text-red-600" />
          )}
          <div>
            <p className={`font-medium ${log.status === 'success' ? 'text-green-700' : 'text-red-700'}`}>
              {log.status === 'success' ? 'Request Successful' : 'Request Failed'}
            </p>
            {log.errorMessage && <p className="text-sm text-gray-500 mt-1">{log.errorMessage}</p>}
          </div>
        </div>

        {/* Request Info Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-xs text-gray-500">Request ID</span>
            <p className="text-gray-900 font-mono text-sm">{log.requestId}</p>
          </div>
          <div>
            <span className="text-xs text-gray-500">Timestamp</span>
            <p className="text-gray-900">{new Date(log.createdAt).toLocaleString()}</p>
          </div>
          <div>
            <span className="text-xs text-gray-500">Model</span>
            <div className="mt-1">
              <Badge variant="default">{log.model}</Badge>
            </div>
          </div>
          <div>
            <span className="text-xs text-gray-500">Provider</span>
            <div className="mt-1">
              <ProviderBadge provider={log.provider} />
            </div>
          </div>
          <div>
            <span className="text-xs text-gray-500">Key</span>
            <p className="text-gray-900">{log.keyAlias}</p>
          </div>
          <div>
            <span className="text-xs text-gray-500">Status Code</span>
            <p className={`font-mono ${log.statusCode < 400 ? 'text-green-600' : 'text-red-600'}`}>
              {log.statusCode}
            </p>
          </div>
        </div>

        {/* User/Team Info */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-xs text-gray-500">User</span>
            <p className="text-gray-900">{log.userName || 'N/A'}</p>
          </div>
          <div>
            <span className="text-xs text-gray-500">Team</span>
            <p className="text-gray-900">{log.teamName || 'N/A'}</p>
          </div>
        </div>

        {/* Token Usage */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Token Usage</h4>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{log.promptTokens.toLocaleString()}</p>
              <p className="text-xs text-gray-500">Input Tokens</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{log.completionTokens.toLocaleString()}</p>
              <p className="text-xs text-gray-500">Output Tokens</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{log.totalTokens.toLocaleString()}</p>
              <p className="text-xs text-gray-500">Total Tokens</p>
            </div>
          </div>
        </div>

        {/* Performance & Cost */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <Clock className="w-5 h-5 text-cyan-600 mx-auto mb-2" />
            <p className="text-lg font-bold text-gray-900">{log.latencyMs}ms</p>
            <p className="text-xs text-gray-500">Latency</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <DollarSign className="w-5 h-5 text-green-600 mx-auto mb-2" />
            <p className="text-lg font-bold text-gray-900">${log.costUsd.toFixed(4)}</p>
            <p className="text-xs text-gray-500">Cost</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <Zap className="w-5 h-5 text-amber-500 mx-auto mb-2" />
            <p className="text-lg font-bold text-gray-900">{log.cacheHit ? 'Yes' : 'No'}</p>
            <p className="text-xs text-gray-500">Cache Hit</p>
          </div>
        </div>

        {/* Request Flags */}
        <div className="flex items-center gap-3">
          {log.isStreaming && (
            <Badge variant="info">Streaming</Badge>
          )}
          {log.cacheHit && (
            <Badge variant="success">Cache Hit</Badge>
          )}
          {log.errorType && (
            <Badge variant="error">{log.errorType.replace(/_/g, ' ')}</Badge>
          )}
        </div>

        {/* Error Details (if failed) */}
        {log.status === 'failed' && log.errorMessage && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span className="text-sm font-medium text-red-700">Error Details</span>
            </div>
            <code className="text-sm text-gray-700 block">{log.errorMessage}</code>
          </div>
        )}
      </div>
    </Modal>
  );
}

export default function LogsPage() {
  const [logs] = useState<RequestLog[]>(requestLogs);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [modelFilter, setModelFilter] = useState<string>('all');
  const [providerFilter, setProviderFilter] = useState<string>('all');
  const [selectedLog, setSelectedLog] = useState<RequestLog | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  // Get unique models and providers
  const uniqueModels = Array.from(new Set(logs.map((l) => l.model)));
  const uniqueProviders = Array.from(new Set(logs.map((l) => l.provider)));

  // Filter logs
  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.requestId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.keyAlias.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.teamName?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || log.status === statusFilter;
    const matchesModel = modelFilter === 'all' || log.model === modelFilter;
    const matchesProvider = providerFilter === 'all' || log.provider === providerFilter;

    return matchesSearch && matchesStatus && matchesModel && matchesProvider;
  });

  const handleViewLog = (log: RequestLog) => {
    setSelectedLog(log);
    setDetailModalOpen(true);
  };

  // Table columns
  const columns: Column<RequestLog>[] = [
    {
      key: 'createdAt',
      header: 'Timestamp',
      sortable: true,
      render: (log) => (
        <div>
          <p className="text-gray-900 text-sm">{new Date(log.createdAt).toLocaleDateString()}</p>
          <p className="text-xs text-gray-500">{new Date(log.createdAt).toLocaleTimeString()}</p>
        </div>
      ),
    },
    {
      key: 'requestId',
      header: 'Request ID',
      render: (log) => (
        <code className="text-xs text-gray-500 font-mono">{log.requestId.substring(0, 12)}...</code>
      ),
    },
    {
      key: 'model',
      header: 'Model',
      sortable: true,
      render: (log) => (
        <div>
          <Badge variant="default" className="text-xs">{log.model}</Badge>
          <p className="text-xs text-gray-500 mt-1 capitalize">{log.provider}</p>
        </div>
      ),
    },
    {
      key: 'keyAlias',
      header: 'Key',
      sortable: true,
      render: (log) => (
        <div>
          <p className="text-gray-900 text-sm">{log.keyAlias}</p>
          {log.userName && <p className="text-xs text-gray-500">{log.userName}</p>}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (log) => (
        <StatusBadge status={log.status === 'success' ? 'success' : 'error'}>
          {log.statusCode}
        </StatusBadge>
      ),
    },
    {
      key: 'totalTokens',
      header: 'Tokens',
      sortable: true,
      render: (log) => (
        <div>
          <p className="text-gray-900 text-sm">{log.totalTokens.toLocaleString()}</p>
          <p className="text-xs text-gray-500">
            {log.promptTokens} / {log.completionTokens}
          </p>
        </div>
      ),
    },
    {
      key: 'latencyMs',
      header: 'Latency',
      sortable: true,
      render: (log) => (
        <span className={`text-sm ${log.latencyMs > 3000 ? 'text-amber-600' : 'text-gray-600'}`}>
          {log.latencyMs}ms
        </span>
      ),
    },
    {
      key: 'costUsd',
      header: 'Cost',
      sortable: true,
      render: (log) => (
        <span className="text-green-600 text-sm">${log.costUsd.toFixed(4)}</span>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (log) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleViewLog(log);
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Request Logs</h1>
          <p className="text-sm text-gray-500 mt-1">
            View and analyze all API requests through your proxy
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg transition-colors text-sm">
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg transition-colors text-sm">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <KPICard
          title="Total Requests"
          value={logMetrics.totalRequests.toLocaleString()}
          icon={FileText}
          color="blue"
        />
        <KPICard
          title="Success Rate"
          value={`${logMetrics.successRate}%`}
          subtitle={`${logMetrics.failedRequests} failed`}
          icon={CheckCircle}
          color="emerald"
        />
        <KPICard
          title="Total Tokens"
          value={`${(logMetrics.totalTokens / 1000000).toFixed(1)}M`}
          icon={Zap}
          color="amber"
        />
        <KPICard
          title="Avg Latency"
          value={`${logMetrics.avgLatency}ms`}
          icon={Clock}
          color="cyan"
        />
        <KPICard
          title="Cache Hit Rate"
          value={`${logMetrics.cacheHitRate}%`}
          icon={RefreshCw}
          color="purple"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by request ID, model, key, or user..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Status</option>
            <option value="success">Success</option>
            <option value="failed">Failed</option>
          </select>

          <select
            value={modelFilter}
            onChange={(e) => setModelFilter(e.target.value)}
            className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Models</option>
            {uniqueModels.map((model) => (
              <option key={model} value={model}>{model}</option>
            ))}
          </select>

          <select
            value={providerFilter}
            onChange={(e) => setProviderFilter(e.target.value)}
            className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Providers</option>
            {uniqueProviders.map((provider) => (
              <option key={provider} value={provider}>{provider}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="flex items-center gap-6 py-3 px-4 bg-white border border-gray-200 rounded-lg mb-6">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Showing</span>
          <span className="text-sm font-medium text-gray-900">{filteredLogs.length}</span>
          <span className="text-sm text-gray-500">of {logs.length} requests</span>
        </div>
        <div className="h-4 w-px bg-gray-200" />
        <div className="flex items-center gap-4">
          {logsErrorBreakdown.slice(0, 3).map((error) => (
            <div key={error.type} className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              <span className="text-xs text-gray-500">
                {error.type.replace(/_/g, ' ')}: {error.count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Logs Table */}
      <DataTable
        data={filteredLogs}
        columns={columns}
        pageSize={25}
        onRowClick={handleViewLog}
      />

      {/* Log Detail Modal */}
      <LogDetailModal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        log={selectedLog}
      />
    </div>
  );
}
