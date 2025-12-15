'use client';

import { useState } from 'react';
import { Plus, Trash2, ArrowUpDown } from 'lucide-react';
import { guardrails, Guardrail } from '@/data/mock/guardrails';

export default function GuardrailsPage() {
  const [sortColumn, setSortColumn] = useState<string>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const sortedGuardrails = [...guardrails].sort((a, b) => {
    let aVal = a[sortColumn as keyof Guardrail];
    let bVal = b[sortColumn as keyof Guardrail];

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

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const getProviderLabel = (type: string) => {
    const providers: Record<string, string> = {
      openai_moderation: 'OpenAI Moderation',
      presidio: 'Presidio PII',
      prompt_injection: 'Prompt Injection',
      bedrock: 'Bedrock Guardrail',
      custom_regex: 'Custom Regex',
    };
    return providers[type] || type;
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header with Add Button */}
      <div className="mb-6">
        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium">
          <Plus className="w-4 h-4" />
          Add New Guardrail
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <SortButton column="id" label="Guardrail ID" />
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <SortButton column="name" label="Name" />
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <SortButton column="type" label="Provider" />
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <SortButton column="mode" label="Mode" />
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Default On
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <SortButton column="createdAt" label="Created At" />
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <SortButton column="updatedAt" label="Updated At" />
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sortedGuardrails.map((guardrail) => (
              <tr key={guardrail.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <span className="text-sm text-indigo-600 font-mono">
                    {guardrail.id.substring(0, 8)}...
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {guardrail.name}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 bg-gray-100 rounded flex items-center justify-center">
                      <span className="text-xs">🛡️</span>
                    </span>
                    <span className="text-sm text-gray-600">
                      {getProviderLabel(guardrail.type)}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {guardrail.mode}
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                    guardrail.enabled
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {guardrail.enabled ? 'Default On' : 'Default Off'}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {formatDate(guardrail.createdAt)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {formatDate(guardrail.updatedAt || guardrail.createdAt)}
                </td>
                <td className="px-4 py-3 text-right">
                  <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
