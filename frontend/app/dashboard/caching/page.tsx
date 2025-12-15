'use client';

import { useState } from 'react';
import {
  Database,
  Zap,
  DollarSign,
  Clock,
  TrendingUp,
  Settings,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  cacheMetrics,
  cacheConfig,
  cacheHitsTrend,
  cacheByModel,
  dailyCacheSavings,
  topCachedPrompts,
  cacheUtilization,
  CacheConfig,
} from '@/data/mock/cache';
import { DataTable, Column } from '@/components/ui/DataTable';
import Modal, { ModalButton } from '@/components/ui/Modal';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import FormInput, { FormSelect, FormCheckbox } from '@/components/ui/FormInput';

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
    blue: 'from-blue-500/20 to-blue-600/5 border-blue-500/30 text-blue-400',
    emerald: 'from-emerald-500/20 to-emerald-600/5 border-emerald-500/30 text-emerald-400',
    amber: 'from-amber-500/20 to-amber-600/5 border-amber-500/30 text-amber-400',
    purple: 'from-purple-500/20 to-purple-600/5 border-purple-500/30 text-purple-400',
    cyan: 'from-cyan-500/20 to-cyan-600/5 border-cyan-500/30 text-cyan-400',
  };

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} border rounded-xl p-5`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-400">{title}</p>
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
          {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
        </div>
        <div className="p-3 rounded-lg bg-slate-800/50">
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}

function ConfigModal({
  isOpen,
  onClose,
  config,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  config: CacheConfig;
  onSave: (config: CacheConfig) => void;
}) {
  const [formData, setFormData] = useState(config);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Cache Configuration"
      size="lg"
      footer={
        <>
          <ModalButton variant="secondary" onClick={onClose}>Cancel</ModalButton>
          <ModalButton variant="primary" onClick={() => { onSave(formData); onClose(); }}>Save Changes</ModalButton>
        </>
      }
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
          <div>
            <p className="font-medium text-white">Enable Caching</p>
            <p className="text-sm text-slate-400">Turn caching on or off globally</p>
          </div>
          <button
            onClick={() => setFormData({ ...formData, enabled: !formData.enabled })}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              formData.enabled ? 'bg-blue-600' : 'bg-slate-600'
            }`}
          >
            <div
              className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                formData.enabled ? 'left-7' : 'left-1'
              }`}
            />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormInput
            label="Default TTL (seconds)"
            type="number"
            value={formData.defaultTTL}
            onChange={(e) => setFormData({ ...formData, defaultTTL: parseInt(e.target.value) })}
          />
          <FormInput
            label="Max Cache Size (MB)"
            type="number"
            value={formData.maxCacheSize / (1024 * 1024)}
            onChange={(e) => setFormData({ ...formData, maxCacheSize: parseInt(e.target.value) * 1024 * 1024 })}
          />
        </div>

        <FormSelect
          label="Eviction Policy"
          value={formData.evictionPolicy}
          onChange={(e) => setFormData({ ...formData, evictionPolicy: e.target.value as 'lru' | 'lfu' | 'ttl' })}
          options={[
            { value: 'lru', label: 'Least Recently Used (LRU)' },
            { value: 'lfu', label: 'Least Frequently Used (LFU)' },
            { value: 'ttl', label: 'Time-To-Live (TTL)' },
          ]}
        />

        <div className="p-4 bg-slate-800/50 rounded-lg space-y-4">
          <h4 className="font-medium text-white">Semantic Caching</h4>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-300">Enable Semantic Caching</p>
              <p className="text-xs text-slate-500">Match similar prompts, not just exact matches</p>
            </div>
            <button
              onClick={() => setFormData({ ...formData, semanticCaching: !formData.semanticCaching })}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                formData.semanticCaching ? 'bg-blue-600' : 'bg-slate-600'
              }`}
            >
              <div
                className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                  formData.semanticCaching ? 'left-7' : 'left-1'
                }`}
              />
            </button>
          </div>
          {formData.semanticCaching && (
            <div>
              <label className="block text-sm text-slate-400 mb-2">
                Similarity Threshold: {formData.similarityThreshold}
              </label>
              <input
                type="range"
                min="0.5"
                max="1"
                step="0.01"
                value={formData.similarityThreshold}
                onChange={(e) => setFormData({ ...formData, similarityThreshold: parseFloat(e.target.value) })}
                className="w-full"
              />
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}

export default function CachingPage() {
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [config, setConfig] = useState(cacheConfig);

  const cacheByModelColumns: Column<typeof cacheByModel[0]>[] = [
    {
      key: 'model',
      header: 'Model',
      sortable: true,
      render: (c) => <span className="font-medium text-white">{c.model}</span>,
    },
    {
      key: 'entries',
      header: 'Entries',
      sortable: true,
      render: (c) => <span className="text-slate-300">{c.entries}</span>,
    },
    {
      key: 'hits',
      header: 'Hits',
      sortable: true,
      render: (c) => <span className="text-slate-300">{c.hits.toLocaleString()}</span>,
    },
    {
      key: 'tokensSaved',
      header: 'Tokens Saved',
      sortable: true,
      render: (c) => <span className="text-amber-400">{(c.tokensSaved / 1000000).toFixed(1)}M</span>,
    },
    {
      key: 'costSaved',
      header: 'Cost Saved',
      sortable: true,
      render: (c) => <span className="text-emerald-400 font-medium">${c.costSaved.toFixed(2)}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Caching</h1>
          <p className="text-slate-400 mt-1">Monitor cache performance and savings</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg">
            <Trash2 className="w-4 h-4" />
            Clear Cache
          </button>
          <button
            onClick={() => setConfigModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
          >
            <Settings className="w-4 h-4" />
            Configure
          </button>
        </div>
      </div>

      {/* Status Banner */}
      <div className={`p-4 rounded-lg flex items-center justify-between ${
        config.enabled ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-amber-500/10 border border-amber-500/30'
      }`}>
        <div className="flex items-center gap-3">
          <Database className={`w-5 h-5 ${config.enabled ? 'text-emerald-400' : 'text-amber-400'}`} />
          <div>
            <p className={`font-medium ${config.enabled ? 'text-emerald-400' : 'text-amber-400'}`}>
              Caching is {config.enabled ? 'Enabled' : 'Disabled'}
            </p>
            <p className="text-sm text-slate-400">
              {config.enabled ? `Semantic caching: ${config.semanticCaching ? 'On' : 'Off'} | TTL: ${config.defaultTTL}s` : 'Enable caching to reduce costs'}
            </p>
          </div>
        </div>
        <Badge variant={config.enabled ? 'success' : 'warning'}>
          {config.evictionPolicy.toUpperCase()}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard title="Hit Rate" value={`${cacheMetrics.hitRate.toFixed(1)}%`} icon={TrendingUp} color="emerald" />
        <KPICard title="Total Hits" value={cacheMetrics.totalHits.toLocaleString()} subtitle={`${cacheMetrics.totalMisses.toLocaleString()} misses`} icon={Zap} color="blue" />
        <KPICard title="Tokens Saved" value={`${(cacheMetrics.totalTokensSaved / 1000000).toFixed(1)}M`} icon={RefreshCw} color="amber" />
        <KPICard title="Cost Saved" value={`$${cacheMetrics.totalCostSaved.toFixed(2)}`} icon={DollarSign} color="purple" />
        <KPICard title="Cache Size" value={`${(cacheMetrics.cacheSize / (1024 * 1024)).toFixed(1)}MB`} subtitle={`of ${cacheMetrics.maxCacheSize / (1024 * 1024)}MB`} icon={Database} color="cyan" />
      </div>

      {/* Cache Utilization Bar */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-white">Cache Utilization</h3>
          <span className="text-sm text-slate-400">{cacheUtilization.percentUsed.toFixed(1)}% used</span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-4">
          <div
            className={`h-4 rounded-full transition-all ${
              cacheUtilization.percentUsed >= 90 ? 'bg-red-500' :
              cacheUtilization.percentUsed >= 75 ? 'bg-amber-500' : 'bg-blue-500'
            }`}
            style={{ width: `${cacheUtilization.percentUsed}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-slate-500">
          <span>{(cacheUtilization.used / (1024 * 1024)).toFixed(1)}MB used</span>
          <span>{(cacheUtilization.available / (1024 * 1024)).toFixed(1)}MB available</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Cache Hits Over Time (24h)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={cacheHitsTrend}>
              <defs>
                <linearGradient id="cacheHits" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="cacheMisses" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="hour" stroke="#64748B" fontSize={12} tickFormatter={(v) => v.split('T')[1]?.substring(0,5) || v} />
              <YAxis stroke="#64748B" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '8px' }} />
              <Legend />
              <Area type="monotone" dataKey="hits" name="Hits" stroke="#10B981" fill="url(#cacheHits)" strokeWidth={2} />
              <Area type="monotone" dataKey="misses" name="Misses" stroke="#EF4444" fill="url(#cacheMisses)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Daily Cost Savings (30 Days)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={dailyCacheSavings}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" stroke="#64748B" fontSize={12} tickFormatter={(v) => new Date(v).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} />
              <YAxis stroke="#64748B" fontSize={12} tickFormatter={(v) => `$${v}`} />
              <Tooltip contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '8px' }} formatter={(v: number) => [`$${v.toFixed(2)}`, 'Saved']} />
              <Bar dataKey="costSaved" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Cache Performance by Model</h3>
        <DataTable data={cacheByModel} columns={cacheByModelColumns} pageSize={10} />
      </div>

      <ConfigModal isOpen={configModalOpen} onClose={() => setConfigModalOpen(false)} config={config} onSave={setConfig} />
    </div>
  );
}
