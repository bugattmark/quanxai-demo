'use client';

import { useState } from 'react';
import {
  ClipboardList,
  Search,
  Filter,
  Download,
  Eye,
  User,
  Key,
  Users,
  Shield,
  Wallet,
  Settings,
  LogIn,
  Clock,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import {
  auditLogs,
  auditMetrics,
  actionsByCategory,
  activityByActor,
  activityTimeline,
  AuditLog,
} from '@/data/mock/audit';
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
  color?: 'blue' | 'emerald' | 'amber' | 'red' | 'purple';
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    emerald: 'bg-green-50 text-green-600',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600',
    purple: 'bg-purple-50 text-purple-600',
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

function AuditDetailModal({
  isOpen,
  onClose,
  log,
}: {
  isOpen: boolean;
  onClose: () => void;
  log: AuditLog | null;
}) {
  if (!log) return null;

  const categoryIcons: Record<string, React.ElementType> = {
    key: Key,
    team: Users,
    user: User,
    model: Settings,
    budget: Wallet,
    guardrail: Shield,
    settings: Settings,
    auth: LogIn,
  };

  const Icon = categoryIcons[log.actionCategory] || ClipboardList;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Audit Log Details" size="lg">
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gray-100 rounded-lg">
              <Icon className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-900">{log.action.replace(/\./g, ' ').replace(/_/g, ' ')}</p>
              <p className="text-sm text-gray-500">{log.entityType} - {log.entityName}</p>
            </div>
          </div>
          <StatusBadge status={log.status === 'success' ? 'success' : 'error'}>
            {log.status}
          </StatusBadge>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs text-gray-500 mb-1">Timestamp</p>
            <p className="text-gray-900">{new Date(log.timestamp).toLocaleString()}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs text-gray-500 mb-1">Category</p>
            <Badge variant="default" className="capitalize">{log.actionCategory}</Badge>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-xs text-gray-500 mb-2">Actor</p>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
              <User className="w-5 h-5 text-gray-500" />
            </div>
            <div>
              <p className="text-gray-900 font-medium">{log.actorName}</p>
              <p className="text-sm text-gray-500">
                {log.actorEmail || log.actorType}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs text-gray-500 mb-1">Entity Type</p>
            <p className="text-gray-900">{log.entityType}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs text-gray-500 mb-1">Entity ID</p>
            <code className="text-sm text-gray-600">{log.entityId}</code>
          </div>
        </div>

        {Object.keys(log.details).length > 0 && (
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs text-gray-500 mb-2">Details</p>
            <pre className="text-sm text-gray-600 overflow-x-auto">
              {JSON.stringify(log.details, null, 2)}
            </pre>
          </div>
        )}

        {(log.ipAddress || log.userAgent) && (
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <p className="text-xs text-gray-500">Request Info</p>
            {log.ipAddress && (
              <p className="text-sm text-gray-600">
                <span className="text-gray-400">IP:</span> {log.ipAddress}
              </p>
            )}
            {log.userAgent && (
              <p className="text-sm text-gray-600 truncate">
                <span className="text-gray-400">User Agent:</span> {log.userAgent}
              </p>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}

export default function AuditLogsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const categories = Array.from(new Set(auditLogs.map(l => l.actionCategory)));

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.actorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.entityName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || log.actionCategory === categoryFilter;
    const matchesStatus = statusFilter === 'all' || log.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleViewLog = (log: AuditLog) => {
    setSelectedLog(log);
    setDetailModalOpen(true);
  };

  const columns: Column<AuditLog>[] = [
    {
      key: 'timestamp',
      header: 'Time',
      sortable: true,
      render: (l) => (
        <div>
          <p className="text-gray-900 text-sm">{new Date(l.timestamp).toLocaleDateString()}</p>
          <p className="text-xs text-gray-500">{new Date(l.timestamp).toLocaleTimeString()}</p>
        </div>
      ),
    },
    {
      key: 'action',
      header: 'Action',
      sortable: true,
      render: (l) => (
        <div>
          <p className="font-medium text-gray-900">{l.action.replace(/\./g, ' ').replace(/_/g, ' ')}</p>
          <Badge variant="default" className="text-xs mt-1 capitalize">{l.actionCategory}</Badge>
        </div>
      ),
    },
    {
      key: 'actorName',
      header: 'Actor',
      sortable: true,
      render: (l) => (
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
            <User className="w-3 h-3 text-gray-500" />
          </div>
          <div>
            <p className="text-gray-900 text-sm">{l.actorName}</p>
            <p className="text-xs text-gray-500">{l.actorType}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'entityName',
      header: 'Entity',
      render: (l) => (
        <div>
          <p className="text-gray-900 text-sm">{l.entityName}</p>
          <p className="text-xs text-gray-500">{l.entityType}</p>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (l) => (
        <StatusBadge status={l.status === 'success' ? 'success' : 'error'}>
          {l.status}
        </StatusBadge>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (l) => (
        <button
          onClick={(e) => { e.stopPropagation(); handleViewLog(l); }}
          className="p-1.5 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600"
        >
          <Eye className="w-4 h-4" />
        </button>
      ),
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Audit Logs</h1>
          <p className="text-sm text-gray-500 mt-1">Track all administrative actions and changes</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg text-sm">
          <Download className="w-4 h-4" />
          Export Logs
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPICard title="Total Logs" value={auditMetrics.totalLogs.toLocaleString()} icon={ClipboardList} color="blue" />
        <KPICard title="Last 24 Hours" value={auditMetrics.logsLast24h} icon={Clock} color="emerald" />
        <KPICard title="Last 7 Days" value={auditMetrics.logsLast7d} icon={Clock} color="purple" />
        <KPICard title="Failed Actions" value={auditMetrics.failedActions} icon={ClipboardList} color="red" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Activity by Category</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={actionsByCategory} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis type="number" stroke="#9CA3AF" fontSize={12} />
              <YAxis type="category" dataKey="category" stroke="#9CA3AF" fontSize={11} width={100} />
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #E5E7EB', borderRadius: '8px' }} />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {actionsByCategory.map((entry) => (
                  <Cell key={entry.category} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Activity Timeline (7 Days)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={activityTimeline}>
              <defs>
                <linearGradient id="auditSuccess" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="auditFailed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} tickFormatter={(v) => new Date(v).toLocaleDateString('en-US', { weekday: 'short' })} />
              <YAxis stroke="#9CA3AF" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #E5E7EB', borderRadius: '8px' }} />
              <Area type="monotone" dataKey="success" name="Success" stroke="#10B981" fill="url(#auditSuccess)" strokeWidth={2} />
              <Area type="monotone" dataKey="failed" name="Failed" stroke="#EF4444" fill="url(#auditFailed)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Most Active Users */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Most Active Users</h3>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {activityByActor.slice(0, 5).map((actor) => (
            <div key={actor.name} className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mx-auto mb-2">
                <span className="text-gray-600 font-medium">{actor.name.charAt(0)}</span>
              </div>
              <p className="text-gray-900 font-medium text-sm truncate">{actor.name}</p>
              <p className="text-xs text-gray-500">{actor.actions} actions</p>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search actions, actors, entities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Status</option>
            <option value="success">Success</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      <DataTable data={filteredLogs} columns={columns} pageSize={15} onRowClick={handleViewLog} />

      <AuditDetailModal isOpen={detailModalOpen} onClose={() => setDetailModalOpen(false)} log={selectedLog} />
    </div>
  );
}
