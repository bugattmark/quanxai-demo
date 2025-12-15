'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Box,
  Cpu,
  DollarSign,
  Activity,
  Zap,
  Clock,
  TrendingUp,
  ArrowRight,
  Globe,
  ChevronDown,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  bedrockModels,
  sagemakerEndpoints,
  bedrockMetrics,
  sagemakerMetrics,
  bedrockDailyTrend,
  regionalBreakdown,
} from '@/data/mock/products';

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function ProductsOverviewPage() {
  const [foundationModelsExpanded, setFoundationModelsExpanded] = useState(true);
  const [customEndpointsExpanded, setCustomEndpointsExpanded] = useState(true);

  const totalSpend = bedrockMetrics.totalSpend + (sagemakerMetrics.totalCostPerHour * 730);
  const totalRequests = bedrockMetrics.totalRequests + (sagemakerMetrics.totalRequestsPerHour * 730);

  // Provider distribution from models
  const providerDistribution = bedrockModels.reduce((acc, model) => {
    const existing = acc.find(p => p.name === model.provider);
    if (existing) {
      existing.value += model.cost;
    } else {
      acc.push({ name: model.provider, value: model.cost });
    }
    return acc;
  }, [] as { name: string; value: number }[]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Products</h1>
        <p className="text-sm text-gray-500 mt-1">
          Monitor and manage your AI/ML model services
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Spend</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                ${totalSpend.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-gray-400 mt-1">This month</p>
            </div>
            <div className="p-3 bg-indigo-50 rounded-lg">
              <DollarSign className="w-5 h-5 text-indigo-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Requests</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {(totalRequests / 1000).toFixed(0)}k
              </p>
              <p className="text-xs text-gray-400 mt-1">Across all services</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <Activity className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Models</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {bedrockMetrics.activeModels + sagemakerMetrics.activeEndpoints}
              </p>
              <p className="text-xs text-gray-400 mt-1">Foundation + Custom</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <Zap className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Avg Latency</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {bedrockMetrics.avgLatency}ms
              </p>
              <p className="text-xs text-gray-400 mt-1">P95: 2.4s</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <Clock className="w-5 h-5 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Foundation Models Section */}
      <div className="bg-white rounded-lg border border-gray-200 mb-6">
        <button
          onClick={() => setFoundationModelsExpanded(!foundationModelsExpanded)}
          className="w-full flex items-center justify-between p-4 text-left"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Box className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-lg font-medium text-gray-900">Foundation Models</h2>
              <p className="text-sm text-gray-500">Pre-trained models from various providers</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-lg font-semibold text-gray-900">${bedrockMetrics.totalSpend.toFixed(2)}</p>
              <p className="text-xs text-gray-500">{bedrockModels.length} models</p>
            </div>
            <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${foundationModelsExpanded ? 'rotate-180' : ''}`} />
          </div>
        </button>

        {foundationModelsExpanded && (
          <div className="px-4 pb-4 border-t border-gray-100">
            <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">Requests</p>
                <p className="text-lg font-semibold text-gray-900">{(bedrockMetrics.totalRequests / 1000).toFixed(0)}k</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">Tokens</p>
                <p className="text-lg font-semibold text-gray-900">{(bedrockMetrics.totalTokens / 1000000).toFixed(1)}M</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">Avg Latency</p>
                <p className="text-lg font-semibold text-gray-900">{bedrockMetrics.avgLatency}ms</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">Active</p>
                <p className="text-lg font-semibold text-gray-900">{bedrockMetrics.activeModels}</p>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <Link
                href="/dashboard/products/foundation-models"
                className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800"
              >
                View Details
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Custom Endpoints Section */}
      <div className="bg-white rounded-lg border border-gray-200 mb-6">
        <button
          onClick={() => setCustomEndpointsExpanded(!customEndpointsExpanded)}
          className="w-full flex items-center justify-between p-4 text-left"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Cpu className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-lg font-medium text-gray-900">Custom Endpoints</h2>
              <p className="text-sm text-gray-500">Self-hosted and fine-tuned model endpoints</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-lg font-semibold text-gray-900">${(sagemakerMetrics.totalCostPerHour * 730).toFixed(2)}/mo</p>
              <p className="text-xs text-gray-500">{sagemakerEndpoints.length} endpoints</p>
            </div>
            <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${customEndpointsExpanded ? 'rotate-180' : ''}`} />
          </div>
        </button>

        {customEndpointsExpanded && (
          <div className="px-4 pb-4 border-t border-gray-100">
            <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">Active</p>
                <p className="text-lg font-semibold text-gray-900">{sagemakerMetrics.activeEndpoints}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">Req/Hour</p>
                <p className="text-lg font-semibold text-gray-900">{sagemakerMetrics.totalRequestsPerHour.toLocaleString()}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">Cost/Hour</p>
                <p className="text-lg font-semibold text-gray-900">${sagemakerMetrics.totalCostPerHour.toFixed(2)}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">Custom Models</p>
                <p className="text-lg font-semibold text-gray-900">{sagemakerMetrics.customModels}</p>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <Link
                href="/dashboard/products/custom-endpoints"
                className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800"
              >
                View Details
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Spend Trend */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Spend Trend (30 Days)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={bedrockDailyTrend}>
              <defs>
                <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                dataKey="date"
                stroke="#9CA3AF"
                fontSize={12}
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis stroke="#9CA3AF" fontSize={12} tickFormatter={(value) => `$${value}`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #E5E7EB', borderRadius: '8px' }}
                formatter={(value: number) => [`$${value.toFixed(2)}`, 'Cost']}
                labelFormatter={(label) => new Date(label).toLocaleDateString()}
              />
              <Area type="monotone" dataKey="cost" stroke="#4F46E5" fill="url(#colorCost)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Provider Distribution */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Cost by Provider</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={providerDistribution}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
                nameKey="name"
              >
                {providerDistribution.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #E5E7EB', borderRadius: '8px' }}
                formatter={(value: number) => [`$${value.toFixed(2)}`, 'Cost']}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {providerDistribution.map((provider, index) => (
              <div key={provider.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <span className="text-sm text-gray-600">{provider.name}</span>
                <span className="text-sm text-gray-400 ml-auto">${provider.value.toFixed(0)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Regional Distribution */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Regional Distribution</h3>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {regionalBreakdown.map((region) => (
            <div key={region.region} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Globe className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">{region.region}</span>
              </div>
              <p className="text-xl font-bold text-gray-900">${region.cost.toLocaleString()}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-500">{region.requests.toLocaleString()} requests</span>
                <span className="text-xs text-gray-400">{region.percentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                <div
                  className="h-1.5 rounded-full bg-indigo-500"
                  style={{ width: `${region.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
