'use client';

import { useState } from 'react';
import { Plus, Trash2, ArrowUpDown, Copy, ChevronDown, X } from 'lucide-react';
import { virtualKeys, VirtualKey } from '@/data/mock/keys';

export default function VirtualKeysPage() {
  const [keys] = useState<VirtualKey[]>(virtualKeys);
  const [searchQuery, setSearchQuery] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [sortColumn, setSortColumn] = useState<string>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const filteredKeys = keys.filter((key) => {
    const query = searchQuery.toLowerCase();
    return (
      key.alias.toLowerCase().includes(query) ||
      key.keyId.toLowerCase().includes(query) ||
      key.teamAlias?.toLowerCase().includes(query) ||
      key.userEmail?.toLowerCase().includes(query)
    );
  });

  const sortedKeys = [...filteredKeys].sort((a, b) => {
    let aVal = a[sortColumn as keyof VirtualKey];
    let bVal = b[sortColumn as keyof VirtualKey];

    if (aVal === null || aVal === undefined) aVal = '';
    if (bVal === null || bVal === undefined) bVal = '';

    if (typeof aVal === 'string') aVal = aVal.toLowerCase();
    if (typeof bVal === 'string') bVal = bVal.toLowerCase();

    if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const SortButton = ({ column, label }: { column: string; label: string }) => (
    <button
      onClick={() => handleSort(column)}
      className="flex items-center gap-1 hover:text-gray-900"
    >
      {label}
      <ArrowUpDown className="w-3 h-3" />
    </button>
  );

  const formatDate = (date: string | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Virtual Keys</h1>
          <p className="text-sm text-gray-500 mt-1">
            Create and manage API keys for proxy access
          </p>
        </div>
        <button
          onClick={() => setCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Create New Key
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <input
          type="text"
          placeholder="Search by key alias, key ID, team, or user..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  <SortButton column="keyId" label="Key ID" />
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  <SortButton column="alias" label="Key Alias" />
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Secret Key
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  <SortButton column="teamAlias" label="Team Alias" />
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Team ID
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Organization ID
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  <SortButton column="userEmail" label="User Email" />
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  User ID
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  <SortButton column="createdAt" label="Created At" />
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Created By
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  <SortButton column="updatedAt" label="Updated At" />
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  <SortButton column="expiresAt" label="Expires" />
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  <SortButton column="spendUsd" label="Spend (USD)" />
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  <SortButton column="budgetUsd" label="Budget (USD)" />
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Budget Reset
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Models
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Rate Limits
                </th>
                <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sortedKeys.map((key) => (
                <tr key={key.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-3 py-3 text-sm font-mono text-indigo-600 whitespace-nowrap">
                    {key.keyId.substring(0, 12)}...
                  </td>
                  <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap">
                    {key.alias}
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-mono text-gray-600">{key.secretKey}</span>
                      <button
                        onClick={() => handleCopy(key.secretKey)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-sm text-gray-600 whitespace-nowrap">
                    {key.teamAlias || '-'}
                  </td>
                  <td className="px-3 py-3 text-sm font-mono text-gray-500 whitespace-nowrap">
                    {key.teamId ? `${key.teamId.substring(0, 10)}...` : '-'}
                  </td>
                  <td className="px-3 py-3 text-sm font-mono text-gray-500 whitespace-nowrap">
                    {key.organizationId ? `${key.organizationId.substring(0, 10)}...` : '-'}
                  </td>
                  <td className="px-3 py-3 text-sm text-gray-600 whitespace-nowrap">
                    {key.userEmail || '-'}
                  </td>
                  <td className="px-3 py-3 text-sm font-mono text-gray-500 whitespace-nowrap">
                    {key.userId ? `${key.userId.substring(0, 10)}...` : '-'}
                  </td>
                  <td className="px-3 py-3 text-sm text-gray-600 whitespace-nowrap">
                    {formatDate(key.createdAt)}
                  </td>
                  <td className="px-3 py-3 text-sm text-gray-600 whitespace-nowrap">
                    {key.createdBy || '-'}
                  </td>
                  <td className="px-3 py-3 text-sm text-gray-600 whitespace-nowrap">
                    {formatDate(key.updatedAt)}
                  </td>
                  <td className="px-3 py-3 text-sm whitespace-nowrap">
                    {key.expiresAt ? (
                      <span className={new Date(key.expiresAt) < new Date() ? 'text-red-600' : 'text-gray-600'}>
                        {formatDate(key.expiresAt)}
                      </span>
                    ) : (
                      <span className="text-gray-400">Never</span>
                    )}
                  </td>
                  <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap">
                    ${key.spendUsd.toFixed(2)}
                  </td>
                  <td className="px-3 py-3 text-sm text-gray-600 whitespace-nowrap">
                    {key.budgetUsd ? `$${key.budgetUsd.toLocaleString()}` : 'Unlimited'}
                  </td>
                  <td className="px-3 py-3 text-sm text-gray-600 whitespace-nowrap capitalize">
                    {key.budgetReset || '-'}
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    <div className="flex gap-1 flex-wrap max-w-[200px]">
                      {key.models.slice(0, 2).map((model) => (
                        <span
                          key={model}
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-700"
                        >
                          {model}
                        </span>
                      ))}
                      {key.models.length > 2 && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-700">
                          +{key.models.length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-3 text-sm text-gray-600 whitespace-nowrap">
                    {key.rateLimitRpm ? `${key.rateLimitRpm} RPM` : '-'}
                    {key.rateLimitTpm ? ` / ${(key.rateLimitTpm / 1000).toFixed(0)}k TPM` : ''}
                  </td>
                  <td className="px-3 py-3 text-right whitespace-nowrap">
                    <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-gray-200 text-sm text-gray-500">
          Showing {sortedKeys.length} of {keys.length} keys
        </div>
      </div>

      {/* Create Key Modal */}
      {createModalOpen && (
        <CreateKeyModal onClose={() => setCreateModalOpen(false)} />
      )}
    </div>
  );
}

function CreateKeyModal({ onClose }: { onClose: () => void }) {
  const [keyOwnershipExpanded, setKeyOwnershipExpanded] = useState(true);
  const [keyDetailsExpanded, setKeyDetailsExpanded] = useState(true);
  const [optionalSettingsExpanded, setOptionalSettingsExpanded] = useState(true);
  const [mcpSettingsExpanded, setMcpSettingsExpanded] = useState(false);
  const [loggingSettingsExpanded, setLoggingSettingsExpanded] = useState(false);
  const [modelAliasesExpanded, setModelAliasesExpanded] = useState(false);
  const [keyLifecycleExpanded, setKeyLifecycleExpanded] = useState(false);

  const [formData, setFormData] = useState({
    assignedTeam: '',
    assignedUser: '',
    keyAlias: '',
    models: [] as string[],
    maxBudget: '',
    resetBudget: 'never',
    tpm: '',
    rpm: '',
    maxParallelRequests: '',
    tags: '',
    allowedIps: '',
    expiresIn: 'never',
    budgetDuration: 'monthly',
  });

  const modelOptions = [
    'gpt-4',
    'gpt-4o',
    'gpt-3.5-turbo',
    'claude-3-sonnet',
    'claude-3-haiku',
    'claude-3-opus',
    'llama-3-70b',
    'bedrock/claude-3-sonnet',
    'bedrock/claude-3-haiku',
  ];

  const teamOptions = [
    { value: '', label: 'Select Team' },
    { value: 'team-ai-platform-001', label: 'AI Platform' },
    { value: 'team-data-science-002', label: 'Data Science' },
    { value: 'team-product-003', label: 'Product Engineering' },
    { value: 'team-devops-004', label: 'DevOps' },
    { value: 'team-customer-success-005', label: 'Customer Success' },
  ];

  const handleModelToggle = (model: string) => {
    if (formData.models.includes(model)) {
      setFormData({ ...formData, models: formData.models.filter(m => m !== model) });
    } else {
      setFormData({ ...formData, models: [...formData.models, model] });
    }
  };

  const Section = ({
    title,
    expanded,
    onToggle,
    children,
  }: {
    title: string;
    expanded: boolean;
    onToggle: () => void;
    children: React.ReactNode;
  }) => (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
      >
        <span className="font-medium text-gray-900">{title}</span>
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </button>
      {expanded && <div className="p-4 bg-white">{children}</div>}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Create New Key</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Key Ownership */}
          <Section
            title="Key Ownership"
            expanded={keyOwnershipExpanded}
            onToggle={() => setKeyOwnershipExpanded(!keyOwnershipExpanded)}
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assign to Team
                </label>
                <select
                  value={formData.assignedTeam}
                  onChange={(e) => setFormData({ ...formData, assignedTeam: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {teamOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assign to User (optional)
                </label>
                <input
                  type="email"
                  placeholder="user@company.com"
                  value={formData.assignedUser}
                  onChange={(e) => setFormData({ ...formData, assignedUser: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </Section>

          {/* Key Details */}
          <Section
            title="Key Details"
            expanded={keyDetailsExpanded}
            onToggle={() => setKeyDetailsExpanded(!keyDetailsExpanded)}
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Key Alias
                </label>
                <input
                  type="text"
                  placeholder="e.g., Production API Key"
                  value={formData.keyAlias}
                  onChange={(e) => setFormData({ ...formData, keyAlias: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Models
                </label>
                <div className="flex flex-wrap gap-2">
                  {modelOptions.map(model => (
                    <button
                      key={model}
                      type="button"
                      onClick={() => handleModelToggle(model)}
                      className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                        formData.models.includes(model)
                          ? 'bg-indigo-100 border-indigo-300 text-indigo-700'
                          : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {model}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Select the models this key can access. Leave empty for all models.
                </p>
              </div>
            </div>
          </Section>

          {/* Optional Settings */}
          <Section
            title="Optional Settings"
            expanded={optionalSettingsExpanded}
            onToggle={() => setOptionalSettingsExpanded(!optionalSettingsExpanded)}
          >
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Budget (USD)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g., 1000"
                    value={formData.maxBudget}
                    onChange={(e) => setFormData({ ...formData, maxBudget: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reset Budget
                  </label>
                  <select
                    value={formData.resetBudget}
                    onChange={(e) => setFormData({ ...formData, resetBudget: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="never">Never</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    TPM (Tokens Per Minute)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g., 100000"
                    value={formData.tpm}
                    onChange={(e) => setFormData({ ...formData, tpm: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    RPM (Requests Per Minute)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g., 100"
                    value={formData.rpm}
                    onChange={(e) => setFormData({ ...formData, rpm: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Parallel Requests
                </label>
                <input
                  type="number"
                  placeholder="e.g., 10"
                  value={formData.maxParallelRequests}
                  onChange={(e) => setFormData({ ...formData, maxParallelRequests: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g., production, backend, api"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Allowed IPs (optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g., 192.168.1.1, 10.0.0.0/24"
                  value={formData.allowedIps}
                  onChange={(e) => setFormData({ ...formData, allowedIps: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </Section>

          {/* MCP Settings */}
          <Section
            title="MCP Settings"
            expanded={mcpSettingsExpanded}
            onToggle={() => setMcpSettingsExpanded(!mcpSettingsExpanded)}
          >
            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                Configure Model Context Protocol settings for this key.
              </p>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="mcp-enabled" className="rounded border-gray-300" />
                <label htmlFor="mcp-enabled" className="text-sm text-gray-700">Enable MCP</label>
              </div>
            </div>
          </Section>

          {/* Logging Settings */}
          <Section
            title="Logging Settings"
            expanded={loggingSettingsExpanded}
            onToggle={() => setLoggingSettingsExpanded(!loggingSettingsExpanded)}
          >
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <input type="checkbox" id="log-requests" className="rounded border-gray-300" defaultChecked />
                <label htmlFor="log-requests" className="text-sm text-gray-700">Log requests</label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="log-responses" className="rounded border-gray-300" defaultChecked />
                <label htmlFor="log-responses" className="text-sm text-gray-700">Log responses</label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="log-metadata" className="rounded border-gray-300" />
                <label htmlFor="log-metadata" className="text-sm text-gray-700">Store metadata only (no content)</label>
              </div>
            </div>
          </Section>

          {/* Model Aliases */}
          <Section
            title="Model Aliases"
            expanded={modelAliasesExpanded}
            onToggle={() => setModelAliasesExpanded(!modelAliasesExpanded)}
          >
            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                Define custom model aliases for this key. Requests to the alias will be routed to the target model.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Alias</label>
                  <input
                    type="text"
                    placeholder="e.g., my-gpt"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Target Model</label>
                  <input
                    type="text"
                    placeholder="e.g., gpt-4"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <button className="text-sm text-indigo-600 hover:text-indigo-800">
                + Add another alias
              </button>
            </div>
          </Section>

          {/* Key Lifecycle */}
          <Section
            title="Key Lifecycle"
            expanded={keyLifecycleExpanded}
            onToggle={() => setKeyLifecycleExpanded(!keyLifecycleExpanded)}
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Key Expiration
                </label>
                <select
                  value={formData.expiresIn}
                  onChange={(e) => setFormData({ ...formData, expiresIn: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="never">Never expires</option>
                  <option value="7d">7 days</option>
                  <option value="30d">30 days</option>
                  <option value="90d">90 days</option>
                  <option value="180d">180 days</option>
                  <option value="365d">1 year</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Budget Duration
                </label>
                <select
                  value={formData.budgetDuration}
                  onChange={(e) => setFormData({ ...formData, budgetDuration: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                  <option value="total">Total (no reset)</option>
                </select>
              </div>
            </div>
          </Section>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            Create Key
          </button>
        </div>
      </div>
    </div>
  );
}
