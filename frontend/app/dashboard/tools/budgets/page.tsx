'use client';

import { useState } from 'react';
import {
  Wallet,
  Plus,
  Search,
  AlertCircle,
  TrendingUp,
  Users,
  Key,
  DollarSign,
  Edit,
  Trash2,
} from 'lucide-react';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Badge, StatusBadge } from '@/components/ui/Badge';

interface Budget {
  id: string;
  name: string;
  entityType: 'team' | 'user' | 'key';
  entityName: string;
  maxBudget: number;
  currentSpend: number;
  period: 'monthly' | 'weekly' | 'daily' | 'total';
  alertThreshold: number;
  status: 'active' | 'warning' | 'exceeded';
}

// Mock budgets data
const budgets: Budget[] = [
  {
    id: 'budget-1',
    name: 'AI Platform Monthly',
    entityType: 'team',
    entityName: 'AI Platform',
    maxBudget: 10000,
    currentSpend: 7850,
    period: 'monthly',
    alertThreshold: 80,
    status: 'warning',
  },
  {
    id: 'budget-2',
    name: 'Data Science Budget',
    entityType: 'team',
    entityName: 'Data Science',
    maxBudget: 15000,
    currentSpend: 8756,
    period: 'monthly',
    alertThreshold: 80,
    status: 'active',
  },
  {
    id: 'budget-3',
    name: 'Production API Key',
    entityType: 'key',
    entityName: 'Production API',
    maxBudget: 5000,
    currentSpend: 2345,
    period: 'monthly',
    alertThreshold: 80,
    status: 'active',
  },
  {
    id: 'budget-4',
    name: 'Developer Weekly',
    entityType: 'user',
    entityName: 'marcus.johnson@company.com',
    maxBudget: 500,
    currentSpend: 123,
    period: 'weekly',
    alertThreshold: 50,
    status: 'active',
  },
  {
    id: 'budget-5',
    name: 'Customer Support Bot',
    entityType: 'key',
    entityName: 'Customer Support Bot',
    maxBudget: 2000,
    currentSpend: 2156,
    period: 'monthly',
    alertThreshold: 90,
    status: 'exceeded',
  },
];

const budgetMetrics = {
  totalBudgets: budgets.length,
  totalAllocated: budgets.reduce((sum, b) => sum + b.maxBudget, 0),
  totalSpent: budgets.reduce((sum, b) => sum + b.currentSpend, 0),
  budgetsAtRisk: budgets.filter(b => b.status === 'warning' || b.status === 'exceeded').length,
};

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

export default function BudgetsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [entityFilter, setEntityFilter] = useState('all');

  const filteredBudgets = budgets.filter((budget) => {
    const matchesSearch =
      budget.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      budget.entityName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesEntity = entityFilter === 'all' || budget.entityType === entityFilter;
    return matchesSearch && matchesEntity;
  });

  const getEntityIcon = (type: string) => {
    switch (type) {
      case 'team':
        return Users;
      case 'user':
        return Users;
      case 'key':
        return Key;
      default:
        return Wallet;
    }
  };

  const columns: Column<Budget>[] = [
    {
      key: 'name',
      header: 'Budget',
      sortable: true,
      render: (budget) => {
        const Icon = getEntityIcon(budget.entityType);
        return (
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-50 rounded-lg">
              <Icon className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">{budget.name}</p>
              <p className="text-xs text-gray-500">{budget.entityName}</p>
            </div>
          </div>
        );
      },
    },
    {
      key: 'entityType',
      header: 'Type',
      sortable: true,
      render: (budget) => (
        <Badge variant="default" className="capitalize">{budget.entityType}</Badge>
      ),
    },
    {
      key: 'maxBudget',
      header: 'Budget',
      sortable: true,
      render: (budget) => (
        <span className="text-gray-900 font-medium">${budget.maxBudget.toLocaleString()}</span>
      ),
    },
    {
      key: 'currentSpend',
      header: 'Spent',
      sortable: true,
      render: (budget) => {
        const percentage = (budget.currentSpend / budget.maxBudget) * 100;
        return (
          <div>
            <span className="text-gray-900">${budget.currentSpend.toLocaleString()}</span>
            <div className="w-24 bg-gray-200 rounded-full h-1.5 mt-1">
              <div
                className={`h-1.5 rounded-full ${
                  percentage >= 100 ? 'bg-red-500' : percentage >= 80 ? 'bg-amber-500' : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(percentage, 100)}%` }}
              />
            </div>
          </div>
        );
      },
    },
    {
      key: 'period',
      header: 'Period',
      sortable: true,
      render: (budget) => (
        <span className="text-gray-600 capitalize text-sm">{budget.period}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (budget) => (
        <StatusBadge
          status={
            budget.status === 'exceeded' ? 'error' :
            budget.status === 'warning' ? 'warning' : 'success'
          }
        >
          {budget.status === 'exceeded' ? 'Exceeded' :
           budget.status === 'warning' ? 'Near Limit' : 'On Track'}
        </StatusBadge>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: () => (
        <div className="flex items-center gap-1">
          <button className="p-1.5 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600">
            <Edit className="w-4 h-4" />
          </button>
          <button className="p-1.5 hover:bg-red-50 rounded text-gray-400 hover:text-red-600">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-100 rounded-lg">
            <Wallet className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Budgets</h1>
            <p className="text-sm text-gray-500">Manage spending limits for teams, users, and keys</p>
          </div>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium">
          <Plus className="w-4 h-4" />
          Create Budget
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPICard
          title="Total Budgets"
          value={budgetMetrics.totalBudgets}
          icon={Wallet}
          color="purple"
        />
        <KPICard
          title="Total Allocated"
          value={`$${budgetMetrics.totalAllocated.toLocaleString()}`}
          icon={DollarSign}
          color="blue"
        />
        <KPICard
          title="Total Spent"
          value={`$${budgetMetrics.totalSpent.toLocaleString()}`}
          subtitle={`${((budgetMetrics.totalSpent / budgetMetrics.totalAllocated) * 100).toFixed(0)}% utilized`}
          icon={TrendingUp}
          color="emerald"
        />
        <KPICard
          title="Budgets at Risk"
          value={budgetMetrics.budgetsAtRisk}
          subtitle="Warning or exceeded"
          icon={AlertCircle}
          color="red"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search budgets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <select
          value={entityFilter}
          onChange={(e) => setEntityFilter(e.target.value)}
          className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">All Types</option>
          <option value="team">Teams</option>
          <option value="user">Users</option>
          <option value="key">Keys</option>
        </select>
      </div>

      {/* Table */}
      <DataTable
        data={filteredBudgets}
        columns={columns}
        pageSize={10}
      />
    </div>
  );
}
