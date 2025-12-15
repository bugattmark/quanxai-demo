'use client';

import { useState } from 'react';
import {
  Tag,
  Plus,
  Search,
  DollarSign,
  Activity,
  Edit,
  Trash2,
  TrendingUp,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';

interface TagData {
  id: string;
  name: string;
  description: string;
  color: string;
  spend: number;
  requests: number;
  keysUsing: number;
  createdAt: string;
}

// Mock tags data
const tags: TagData[] = [
  {
    id: 'tag-1',
    name: 'production',
    description: 'Production environment requests',
    color: '#10B981',
    spend: 2890.12,
    requests: 105000,
    keysUsing: 8,
    createdAt: '2024-09-01T10:00:00Z',
  },
  {
    id: 'tag-2',
    name: 'staging',
    description: 'Staging environment for testing',
    color: '#F59E0B',
    spend: 567.89,
    requests: 22000,
    keysUsing: 4,
    createdAt: '2024-09-15T14:00:00Z',
  },
  {
    id: 'tag-3',
    name: 'development',
    description: 'Development and testing',
    color: '#3B82F6',
    spend: 377.89,
    requests: 16000,
    keysUsing: 12,
    createdAt: '2024-09-01T10:00:00Z',
  },
  {
    id: 'tag-4',
    name: 'customer-support',
    description: 'Customer support bot requests',
    color: '#8B5CF6',
    spend: 1245.67,
    requests: 45000,
    keysUsing: 3,
    createdAt: '2024-10-01T09:00:00Z',
  },
  {
    id: 'tag-5',
    name: 'analytics',
    description: 'Data analytics and reporting',
    color: '#EC4899',
    spend: 890.45,
    requests: 32000,
    keysUsing: 5,
    createdAt: '2024-10-15T11:00:00Z',
  },
  {
    id: 'tag-6',
    name: 'internal-tools',
    description: 'Internal productivity tools',
    color: '#06B6D4',
    spend: 456.78,
    requests: 18000,
    keysUsing: 6,
    createdAt: '2024-11-01T08:00:00Z',
  },
];

const COLORS = ['#10B981', '#F59E0B', '#3B82F6', '#8B5CF6', '#EC4899', '#06B6D4'];

const tagMetrics = {
  totalTags: tags.length,
  totalSpend: tags.reduce((sum, t) => sum + t.spend, 0),
  totalRequests: tags.reduce((sum, t) => sum + t.requests, 0),
  avgSpendPerTag: tags.reduce((sum, t) => sum + t.spend, 0) / tags.length,
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
  color?: 'blue' | 'emerald' | 'amber' | 'purple';
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    emerald: 'bg-green-50 text-green-600',
    amber: 'bg-amber-50 text-amber-600',
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

export default function TagsPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTags = tags.filter((tag) =>
    tag.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tag.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pieData = tags.map((tag) => ({
    name: tag.name,
    value: tag.spend,
    color: tag.color,
  }));

  const columns: Column<TagData>[] = [
    {
      key: 'name',
      header: 'Tag',
      sortable: true,
      render: (tag) => (
        <div className="flex items-center gap-3">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: tag.color }}
          />
          <div>
            <p className="font-medium text-gray-900">{tag.name}</p>
            <p className="text-xs text-gray-500">{tag.description}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'spend',
      header: 'Spend',
      sortable: true,
      render: (tag) => (
        <span className="text-green-600 font-medium">${tag.spend.toFixed(2)}</span>
      ),
    },
    {
      key: 'requests',
      header: 'Requests',
      sortable: true,
      render: (tag) => (
        <span className="text-gray-900">{tag.requests.toLocaleString()}</span>
      ),
    },
    {
      key: 'keysUsing',
      header: 'Keys Using',
      sortable: true,
      render: (tag) => (
        <Badge variant="default">{tag.keysUsing} keys</Badge>
      ),
    },
    {
      key: 'createdAt',
      header: 'Created',
      sortable: true,
      render: (tag) => (
        <span className="text-gray-500 text-sm">
          {new Date(tag.createdAt).toLocaleDateString()}
        </span>
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
          <div className="p-2 bg-indigo-100 rounded-lg">
            <Tag className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Tag Management</h1>
            <p className="text-sm text-gray-500">Organize and track costs by tags</p>
          </div>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium">
          <Plus className="w-4 h-4" />
          Create Tag
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPICard
          title="Total Tags"
          value={tagMetrics.totalTags}
          icon={Tag}
          color="purple"
        />
        <KPICard
          title="Total Spend"
          value={`$${tagMetrics.totalSpend.toFixed(2)}`}
          icon={DollarSign}
          color="emerald"
        />
        <KPICard
          title="Total Requests"
          value={`${(tagMetrics.totalRequests / 1000).toFixed(0)}k`}
          icon={Activity}
          color="blue"
        />
        <KPICard
          title="Avg Spend/Tag"
          value={`$${tagMetrics.avgSpendPerTag.toFixed(2)}`}
          icon={TrendingUp}
          color="amber"
        />
      </div>

      {/* Chart and Filters Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Pie Chart */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Spend by Tag</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
                nameKey="name"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #E5E7EB', borderRadius: '8px' }}
                formatter={(value: number) => [`$${value.toFixed(2)}`, 'Spend']}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {tags.slice(0, 4).map((tag) => (
              <div key={tag.id} className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: tag.color }}
                />
                <span className="text-xs text-gray-600 truncate">{tag.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Search and Filter */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Filter Tags</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <p className="text-sm text-gray-500 mt-4">
              Showing {filteredTags.length} of {tags.length} tags
            </p>
          </div>
        </div>
      </div>

      {/* Table */}
      <DataTable
        data={filteredTags}
        columns={columns}
        pageSize={10}
      />
    </div>
  );
}
