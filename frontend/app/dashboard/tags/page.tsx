'use client';

import { useState } from 'react';
import {
  Tag as TagIcon,
  Plus,
  Edit,
  Trash2,
  DollarSign,
  Activity,
  TrendingUp,
} from 'lucide-react';
import {
  BarChart,
  Bar,
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
  tags,
  tagMetrics,
  spendByTag,
  requestsByTag,
  availableColors,
  Tag,
} from '@/data/mock/tags';
import { DataTable, Column } from '@/components/ui/DataTable';
import Modal, { ModalButton } from '@/components/ui/Modal';
import FormInput from '@/components/ui/FormInput';

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
    blue: 'from-blue-500/20 to-blue-600/5 border-blue-500/30 text-blue-400',
    emerald: 'from-emerald-500/20 to-emerald-600/5 border-emerald-500/30 text-emerald-400',
    amber: 'from-amber-500/20 to-amber-600/5 border-amber-500/30 text-amber-400',
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
        <div className="p-3 rounded-lg bg-slate-800/50">
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}

function CreateTagModal({
  isOpen,
  onClose,
  onSubmit,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; description: string; color: string }) => void;
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(availableColors[0]);

  const handleSubmit = () => {
    onSubmit({ name, description, color });
    setName('');
    setDescription('');
    setColor(availableColors[0]);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Tag"
      footer={
        <>
          <ModalButton variant="secondary" onClick={onClose}>Cancel</ModalButton>
          <ModalButton variant="primary" onClick={handleSubmit}>Create Tag</ModalButton>
        </>
      }
    >
      <div className="space-y-4">
        <FormInput
          label="Tag Name"
          placeholder="e.g., production"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <FormInput
          label="Description"
          placeholder="Optional description..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Color</label>
          <div className="flex flex-wrap gap-2">
            {availableColors.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`w-8 h-8 rounded-full transition-transform ${
                  color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-110' : ''
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default function TagsPage() {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [tagsList, setTagsList] = useState<Tag[]>(tags);

  const handleCreateTag = (data: { name: string; description: string; color: string }) => {
    const newTag: Tag = {
      id: `tag-${Date.now()}`,
      name: data.name,
      description: data.description || null,
      color: data.color,
      keysCount: 0,
      requestsCount: 0,
      totalSpend: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setTagsList([newTag, ...tagsList]);
  };

  const handleDeleteTag = (tagId: string) => {
    if (confirm('Are you sure you want to delete this tag?')) {
      setTagsList(tagsList.filter((t) => t.id !== tagId));
    }
  };

  const columns: Column<Tag>[] = [
    {
      key: 'name',
      header: 'Tag',
      sortable: true,
      render: (t) => (
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: t.color }} />
          <div>
            <p className="font-medium text-white">{t.name}</p>
            {t.description && <p className="text-xs text-slate-500">{t.description}</p>}
          </div>
        </div>
      ),
    },
    {
      key: 'keysCount',
      header: 'Keys',
      sortable: true,
      render: (t) => <span className="text-slate-300">{t.keysCount}</span>,
    },
    {
      key: 'requestsCount',
      header: 'Requests',
      sortable: true,
      render: (t) => <span className="text-slate-300">{t.requestsCount.toLocaleString()}</span>,
    },
    {
      key: 'totalSpend',
      header: 'Total Spend',
      sortable: true,
      render: (t) => <span className="text-emerald-400 font-medium">${t.totalSpend.toLocaleString()}</span>,
    },
    {
      key: 'createdAt',
      header: 'Created',
      sortable: true,
      render: (t) => <span className="text-slate-400">{new Date(t.createdAt).toLocaleDateString()}</span>,
    },
    {
      key: 'actions',
      header: '',
      render: (t) => (
        <div className="flex items-center gap-1">
          <button className="p-1.5 hover:bg-slate-700 rounded text-slate-400 hover:text-white">
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleDeleteTag(t.id); }}
            className="p-1.5 hover:bg-slate-700 rounded text-slate-400 hover:text-red-400"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Tag Management</h1>
          <p className="text-slate-400 mt-1">Create and manage cost allocation tags</p>
        </div>
        <button
          onClick={() => setCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
        >
          <Plus className="w-4 h-4" />
          Create Tag
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Total Tags" value={tagMetrics.totalTags} icon={TagIcon} color="blue" />
        <KPICard title="Tagged Requests" value={`${(tagMetrics.totalTaggedRequests / 1000).toFixed(0)}k`} icon={Activity} color="purple" />
        <KPICard title="Tagged Spend" value={`$${tagMetrics.totalTaggedSpend.toLocaleString()}`} icon={DollarSign} color="emerald" />
        <KPICard
          title="Most Used"
          value={tagMetrics.mostUsedTag.name}
          subtitle={`${tagMetrics.mostUsedTag.requestsCount.toLocaleString()} requests`}
          icon={TrendingUp}
          color="amber"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Spend by Tag</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={spendByTag.slice(0, 6)}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
                nameKey="name"
                label={({ name, value }) => `${name}: $${value.toFixed(0)}`}
                labelLine={false}
              >
                {spendByTag.slice(0, 6).map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '8px' }}
                formatter={(value: number) => [`$${value.toLocaleString()}`, 'Spend']}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Requests by Tag</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={requestsByTag.slice(0, 6)} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis type="number" stroke="#64748B" fontSize={12} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <YAxis type="category" dataKey="name" stroke="#64748B" fontSize={12} width={100} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '8px' }}
                formatter={(value: number) => [value.toLocaleString(), 'Requests']}
              />
              <Bar dataKey="requests" radius={[0, 4, 4, 0]}>
                {requestsByTag.slice(0, 6).map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">All Tags</h3>
        <DataTable data={tagsList} columns={columns} pageSize={10} />
      </div>

      <CreateTagModal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} onSubmit={handleCreateTag} />
    </div>
  );
}
