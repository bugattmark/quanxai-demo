'use client';

import { useState } from 'react';
import {
  Database,
  Zap,
  DollarSign,
  TrendingUp,
  Clock,
  RefreshCw,
  Settings,
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

// Mock caching data
const cachingMetrics = {
  cacheHitRate: 68.5,
  totalCacheHits: 156789,
  totalCacheMisses: 71234,
  estimatedSavings: 2345.67,
  avgLatencyReduction: 850,
  cacheSize: '2.4 GB',
};

// Generate daily cache performance data
const dailyCacheData = Array.from({ length: 14 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (13 - i));
  return {
    date: date.toISOString().split('T')[0],
    hits: 10000 + Math.floor(Math.random() * 5000) + i * 200,
    misses: 4000 + Math.floor(Math.random() * 2000),
    hitRate: 60 + Math.random() * 15 + i * 0.5,
  };
});

// Cache by model data
const cacheByModel = [
  { model: 'GPT-4o', hits: 45230, misses: 12300, hitRate: 78.6 },
  { model: 'Claude 3 Sonnet', hits: 38900, misses: 18200, hitRate: 68.1 },
  { model: 'Claude 3 Haiku', hits: 32100, misses: 15600, hitRate: 67.3 },
  { model: 'GPT-3.5 Turbo', hits: 25600, misses: 14200, hitRate: 64.3 },
  { model: 'Llama 3 70B', hits: 14959, misses: 10934, hitRate: 57.8 },
];

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

export default function CachingPage() {
  const [cacheEnabled, setCacheEnabled] = useState(true);
  const [ttlMinutes, setTtlMinutes] = useState(60);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-100 rounded-lg">
            <Database className="w-5 h-5 text-cyan-600" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Prompt Caching</h1>
            <p className="text-sm text-gray-500">Monitor and configure prompt caching for cost savings</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Caching</span>
          <button
            onClick={() => setCacheEnabled(!cacheEnabled)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              cacheEnabled ? 'bg-indigo-600' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                cacheEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
        <KPICard
          title="Cache Hit Rate"
          value={`${cachingMetrics.cacheHitRate}%`}
          icon={TrendingUp}
          color="emerald"
        />
        <KPICard
          title="Cache Hits"
          value={cachingMetrics.totalCacheHits.toLocaleString()}
          icon={Zap}
          color="blue"
        />
        <KPICard
          title="Cache Misses"
          value={cachingMetrics.totalCacheMisses.toLocaleString()}
          icon={RefreshCw}
          color="amber"
        />
        <KPICard
          title="Est. Savings"
          value={`$${cachingMetrics.estimatedSavings.toFixed(2)}`}
          subtitle="This month"
          icon={DollarSign}
          color="purple"
        />
        <KPICard
          title="Latency Saved"
          value={`${cachingMetrics.avgLatencyReduction}ms`}
          subtitle="Avg per hit"
          icon={Clock}
          color="cyan"
        />
        <KPICard
          title="Cache Size"
          value={cachingMetrics.cacheSize}
          icon={Database}
          color="blue"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Cache Performance Over Time */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Cache Hit Rate Over Time</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={dailyCacheData}>
              <defs>
                <linearGradient id="colorHitRate" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                dataKey="date"
                stroke="#9CA3AF"
                fontSize={12}
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis stroke="#9CA3AF" fontSize={12} tickFormatter={(v) => `${v}%`} domain={[50, 100]} />
              <Tooltip
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #E5E7EB', borderRadius: '8px' }}
                formatter={(value: number) => [`${value.toFixed(1)}%`, 'Hit Rate']}
                labelFormatter={(label) => new Date(label).toLocaleDateString()}
              />
              <Area type="monotone" dataKey="hitRate" stroke="#10B981" fill="url(#colorHitRate)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Hits vs Misses Over Time */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Hits vs Misses</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={dailyCacheData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                dataKey="date"
                stroke="#9CA3AF"
                fontSize={12}
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis stroke="#9CA3AF" fontSize={12} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #E5E7EB', borderRadius: '8px' }}
                formatter={(value: number) => [value.toLocaleString(), '']}
                labelFormatter={(label) => new Date(label).toLocaleDateString()}
              />
              <Bar dataKey="hits" name="Cache Hits" fill="#10B981" stackId="cache" />
              <Bar dataKey="misses" name="Cache Misses" fill="#F59E0B" stackId="cache" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Cache by Model & Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cache by Model */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Cache Performance by Model</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Model</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase">Hits</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase">Misses</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase">Hit Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {cacheByModel.map((model) => (
                  <tr key={model.model} className="hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <span className="font-medium text-gray-900">{model.model}</span>
                    </td>
                    <td className="py-3 px-4 text-right text-gray-600">
                      {model.hits.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right text-gray-600">
                      {model.misses.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className="h-2 rounded-full bg-green-500"
                            style={{ width: `${model.hitRate}%` }}
                          />
                        </div>
                        <span className={`text-sm font-medium ${model.hitRate >= 70 ? 'text-green-600' : 'text-amber-600'}`}>
                          {model.hitRate.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Cache Settings */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Settings className="w-5 h-5 text-gray-500" />
            <h3 className="text-lg font-medium text-gray-900">Cache Settings</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-500 mb-2">Default TTL (minutes)</label>
              <input
                type="number"
                value={ttlMinutes}
                onChange={(e) => setTtlMinutes(parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-500 mb-2">Cache Strategy</label>
              <select className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option>Semantic Matching</option>
                <option>Exact Match</option>
                <option>Fuzzy Match</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-500 mb-2">Max Cache Size</label>
              <select className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option>1 GB</option>
                <option>2 GB</option>
                <option>5 GB</option>
                <option>10 GB</option>
              </select>
            </div>

            <button className="w-full mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium">
              Save Settings
            </button>

            <button className="w-full px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium">
              Clear Cache
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
