'use client';

import { useState } from 'react';
import {
  Wallet,
  Plus,
  Eye,
  AlertTriangle,
  CheckCircle,
  XCircle,
  TrendingUp,
  Bell,
  DollarSign,
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
  Cell,
} from 'recharts';
import {
  budgets,
  budgetAlerts,
  budgetMetrics,
  budgetsByEntityType,
  budgetTrend,
  Budget,
  BudgetAlert,
} from '@/data/mock/budgets';
import { DataTable, Column } from '@/components/ui/DataTable';
import Modal from '@/components/ui/Modal';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { Tabs, TabPanel } from '@/components/ui/Tabs';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

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
    blue: 'from-blue-500/20 to-blue-600/5 border-blue-500/30 text-blue-400',
    emerald: 'from-emerald-500/20 to-emerald-600/5 border-emerald-500/30 text-emerald-400',
    amber: 'from-amber-500/20 to-amber-600/5 border-amber-500/30 text-amber-400',
    red: 'from-red-500/20 to-red-600/5 border-red-500/30 text-red-400',
    purple: 'from-purple-500/20 to-purple-600/5 border-purple-500/30 text-purple-400',
  };

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} border rounded-xl p-5`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-400">{title}</p>
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
          {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-lg bg-slate-800/50`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}

function BudgetDetailModal({
  isOpen,
  onClose,
  budget,
}: {
  isOpen: boolean;
  onClose: () => void;
  budget: Budget | null;
}) {
  if (!budget) return null;

  const percentUsed = (budget.spentUsd / budget.maxBudgetUsd) * 100;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Budget Details" size="lg">
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-semibold text-white">{budget.name}</h3>
            <p className="text-sm text-slate-400 mt-1">{budget.entityName}</p>
          </div>
          <StatusBadge
            status={
              budget.status === 'healthy' ? 'success' :
              budget.status === 'warning' ? 'warning' :
              budget.status === 'critical' ? 'error' : 'error'
            }
          >
            {budget.status}
          </StatusBadge>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-800/50 rounded-lg p-4">
            <p className="text-xs text-slate-500">Entity Type</p>
            <Badge variant="default" className="mt-1 capitalize">{budget.entityType}</Badge>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-4">
            <p className="text-xs text-slate-500">Period</p>
            <Badge variant="info" className="mt-1 capitalize">{budget.period}</Badge>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">Budget Utilization</span>
            <span className="text-sm text-white">
              ${budget.spentUsd.toLocaleString()} / ${budget.maxBudgetUsd.toLocaleString()}
            </span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-4">
            <div
              className={`h-4 rounded-full transition-all ${
                percentUsed >= 100 ? 'bg-red-500' :
                percentUsed >= 90 ? 'bg-red-500' :
                percentUsed >= 75 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(percentUsed, 100)}%` }}
            />
          </div>
          <p className="text-xs text-slate-500 mt-1">{percentUsed.toFixed(1)}% used</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-800/50 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-emerald-400">${budget.spentUsd.toLocaleString()}</p>
            <p className="text-xs text-slate-500">Spent</p>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-white">
              ${(budget.maxBudgetUsd - budget.spentUsd).toLocaleString()}
            </p>
            <p className="text-xs text-slate-500">Remaining</p>
          </div>
        </div>

        <div>
          <p className="text-xs text-slate-500 mb-2">Alert Thresholds</p>
          <div className="flex gap-2">
            {budget.alertThresholds.map((threshold) => (
              <Badge
                key={threshold}
                variant={budget.alertsTriggered.includes(String(threshold)) ? 'error' : 'default'}
              >
                {threshold}%
              </Badge>
            ))}
          </div>
        </div>

        {budget.resetDate && (
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <p className="text-sm text-blue-400">
              Resets on {new Date(budget.resetDate).toLocaleDateString()}
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
}

export default function BudgetsPage() {
  const [activeTab, setActiveTab] = useState('budgets');
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const handleViewBudget = (budget: Budget) => {
    setSelectedBudget(budget);
    setDetailModalOpen(true);
  };

  const tabs = [
    { id: 'budgets', label: 'Budgets', icon: <Wallet className="w-4 h-4" /> },
    { id: 'alerts', label: 'Alerts', icon: <Bell className="w-4 h-4" />, badge: budgetMetrics.unacknowledgedAlerts },
  ];

  const budgetColumns: Column<Budget>[] = [
    {
      key: 'name',
      header: 'Budget',
      sortable: true,
      render: (b) => (
        <div>
          <p className="font-medium text-white">{b.name}</p>
          <p className="text-xs text-slate-500">{b.entityName}</p>
        </div>
      ),
    },
    {
      key: 'entityType',
      header: 'Type',
      render: (b) => <Badge variant="default" className="capitalize">{b.entityType}</Badge>,
    },
    {
      key: 'period',
      header: 'Period',
      render: (b) => <Badge variant="info" className="capitalize">{b.period}</Badge>,
    },
    {
      key: 'spentUsd',
      header: 'Spent / Budget',
      sortable: true,
      render: (b) => {
        const percent = (b.spentUsd / b.maxBudgetUsd) * 100;
        return (
          <div>
            <p className="text-white">${b.spentUsd.toLocaleString()} / ${b.maxBudgetUsd.toLocaleString()}</p>
            <div className="w-24 bg-slate-700 rounded-full h-1.5 mt-1">
              <div
                className={`h-1.5 rounded-full ${
                  percent >= 100 ? 'bg-red-500' :
                  percent >= 75 ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(percent, 100)}%` }}
              />
            </div>
          </div>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (b) => (
        <StatusBadge
          status={
            b.status === 'healthy' ? 'success' :
            b.status === 'warning' ? 'warning' : 'error'
          }
        >
          {b.status}
        </StatusBadge>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (b) => (
        <button
          onClick={(e) => { e.stopPropagation(); handleViewBudget(b); }}
          className="p-1.5 hover:bg-slate-700 rounded text-slate-400 hover:text-white"
        >
          <Eye className="w-4 h-4" />
        </button>
      ),
    },
  ];

  const alertColumns: Column<BudgetAlert>[] = [
    {
      key: 'triggeredAt',
      header: 'Time',
      sortable: true,
      render: (a) => (
        <div>
          <p className="text-white text-sm">{new Date(a.triggeredAt).toLocaleDateString()}</p>
          <p className="text-xs text-slate-500">{new Date(a.triggeredAt).toLocaleTimeString()}</p>
        </div>
      ),
    },
    {
      key: 'budgetName',
      header: 'Budget',
      render: (a) => (
        <div>
          <p className="text-white">{a.budgetName}</p>
          <p className="text-xs text-slate-500">{a.entityName}</p>
        </div>
      ),
    },
    {
      key: 'threshold',
      header: 'Threshold',
      render: (a) => <Badge variant="warning">{a.threshold}%</Badge>,
    },
    {
      key: 'percentUsed',
      header: 'Current Usage',
      sortable: true,
      render: (a) => (
        <span className={a.percentUsed >= 100 ? 'text-red-400' : 'text-amber-400'}>
          {a.percentUsed.toFixed(1)}%
        </span>
      ),
    },
    {
      key: 'severity',
      header: 'Severity',
      render: (a) => (
        <StatusBadge status={a.severity === 'critical' ? 'error' : a.severity === 'warning' ? 'warning' : 'info'}>
          {a.severity}
        </StatusBadge>
      ),
    },
    {
      key: 'acknowledged',
      header: 'Status',
      render: (a) => (
        <Badge variant={a.acknowledged ? 'success' : 'error'}>
          {a.acknowledged ? 'Acknowledged' : 'Pending'}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Budgets</h1>
          <p className="text-slate-400 mt-1">Manage spending limits and alerts</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
          <Plus className="w-4 h-4" />
          Create Budget
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard title="Total Budgets" value={budgetMetrics.totalBudgets} icon={Wallet} color="blue" />
        <KPICard title="Total Allocated" value={`$${budgetMetrics.totalAllocated.toLocaleString()}`} icon={DollarSign} color="purple" />
        <KPICard title="Exceeded" value={budgetMetrics.budgetsExceeded} icon={XCircle} color="red" />
        <KPICard title="Critical" value={budgetMetrics.budgetsCritical} icon={AlertTriangle} color="amber" />
        <KPICard title="Healthy" value={budgetMetrics.budgetsHealthy} icon={CheckCircle} color="emerald" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Spend Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={budgetTrend}>
              <defs>
                <linearGradient id="budgetSpend" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" stroke="#64748B" fontSize={12} tickFormatter={(v) => new Date(v).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} />
              <YAxis stroke="#64748B" fontSize={12} tickFormatter={(v) => `$${v}`} />
              <Tooltip contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '8px' }} formatter={(v: number) => [`$${v.toFixed(2)}`, 'Spend']} />
              <Area type="monotone" dataKey="dailySpend" stroke="#8B5CF6" fill="url(#budgetSpend)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Budgets by Entity Type</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={budgetsByEntityType}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="type" stroke="#64748B" fontSize={12} />
              <YAxis stroke="#64748B" fontSize={12} tickFormatter={(v) => `$${v}`} />
              <Tooltip contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '8px' }} />
              <Bar dataKey="totalSpent" name="Spent" fill="#10B981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="totalBudget" name="Budget" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} variant="pills" />

      <TabPanel active={activeTab === 'budgets'}>
        <DataTable data={budgets} columns={budgetColumns} pageSize={10} onRowClick={handleViewBudget} />
      </TabPanel>
      <TabPanel active={activeTab === 'alerts'}>
        <DataTable data={budgetAlerts} columns={alertColumns} pageSize={10} />
      </TabPanel>

      <BudgetDetailModal isOpen={detailModalOpen} onClose={() => setDetailModalOpen(false)} budget={selectedBudget} />
    </div>
  );
}
