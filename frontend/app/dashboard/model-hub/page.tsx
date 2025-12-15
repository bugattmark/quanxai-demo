'use client';

import { useState } from 'react';
import { Search, Plus, Copy, ArrowUpDown, ChevronDown } from 'lucide-react';
import { models } from '@/data/mock/models';

interface ModelLink {
  id: string;
  displayName: string;
  url: string;
}

export default function ModelHubPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [providerFilter, setProviderFilter] = useState('all');
  const [modeFilter, setModeFilter] = useState('all');
  const [featuresFilter, setFeaturesFilter] = useState('all');
  const [links, setLinks] = useState<ModelLink[]>([]);
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [newLinkName, setNewLinkName] = useState('');
  const [linkManagementOpen, setLinkManagementOpen] = useState(true);

  const modelHubUrl = 'http://localhost:4000/ui/model_hub_table';

  const filteredModels = models.filter(model => {
    const matchesSearch = model.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesProvider = providerFilter === 'all' || model.provider.toLowerCase() === providerFilter.toLowerCase();
    return matchesSearch && matchesProvider;
  });

  const handleAddLink = () => {
    if (newLinkUrl && newLinkName) {
      setLinks([...links, { id: Date.now().toString(), displayName: newLinkName, url: newLinkUrl }]);
      setNewLinkUrl('');
      setNewLinkName('');
    }
  };

  const handleDeleteLink = (id: string) => {
    setLinks(links.filter(l => l.id !== id));
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(modelHubUrl);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Model Hub</h1>
          <p className="text-sm text-gray-500 mt-1">
            Make models public for developers to know what models are available on the proxy.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Model Hub URL:</span>
            <div className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 rounded-lg border border-gray-200">
              <span className="text-sm text-gray-700 font-mono">{modelHubUrl}</span>
              <button
                onClick={handleCopyUrl}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium">
            Make Public
          </button>
        </div>
      </div>

      {/* Link Management Section */}
      <div className="bg-white rounded-lg border border-gray-200 mb-6">
        <button
          onClick={() => setLinkManagementOpen(!linkManagementOpen)}
          className="w-full flex items-center justify-between p-4 text-left"
        >
          <div>
            <h2 className="text-lg font-medium text-gray-900">Link Management</h2>
            <p className="text-sm text-gray-500">
              Manage the links that are displayed under 'Useful Links' on the public model hub.
            </p>
          </div>
          <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${linkManagementOpen ? 'rotate-180' : ''}`} />
        </button>

        {linkManagementOpen && (
          <div className="px-4 pb-4 border-t border-gray-100">
            {/* Add New Link */}
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Add New Link</h3>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <label className="block text-xs text-gray-500 mb-1">URL</label>
                  <input
                    type="text"
                    placeholder="https://example.com"
                    value={newLinkUrl}
                    onChange={(e) => setNewLinkUrl(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs text-gray-500 mb-1">Display Name</label>
                  <input
                    type="text"
                    placeholder="Friendly name"
                    value={newLinkName}
                    onChange={(e) => setNewLinkName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="pt-5">
                  <button
                    onClick={handleAddLink}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50"
                  >
                    <Plus className="w-4 h-4" />
                    Add Link
                  </button>
                </div>
              </div>
            </div>

            {/* Existing Links */}
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Manage Existing Links</h3>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Display Name</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">URL</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {links.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-4 py-4 text-center text-sm text-gray-500">
                          No links added yet. Add a new link above.
                        </td>
                      </tr>
                    ) : (
                      links.map((link) => (
                        <tr key={link.id} className="border-b border-gray-100 last:border-0">
                          <td className="px-4 py-2 text-sm text-gray-900">{link.displayName}</td>
                          <td className="px-4 py-2 text-sm text-gray-600">{link.url}</td>
                          <td className="px-4 py-2 text-right">
                            <button
                              onClick={() => handleDeleteLink(link.id)}
                              className="text-red-500 hover:text-red-700 text-sm"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Model Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1">Search Models:</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search model names..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-3 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Provider:</label>
            <select
              value={providerFilter}
              onChange={(e) => setProviderFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Providers</option>
              <option value="openai">OpenAI</option>
              <option value="anthropic">Anthropic</option>
              <option value="meta">Meta</option>
              <option value="google">Google</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Mode:</label>
            <select
              value={modeFilter}
              onChange={(e) => setModeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Modes</option>
              <option value="chat">Chat</option>
              <option value="completion">Completion</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Features:</label>
            <select
              value={featuresFilter}
              onChange={(e) => setFeaturesFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Features</option>
              <option value="vision">Vision</option>
              <option value="function_calling">Function Calling</option>
            </select>
          </div>
        </div>
      </div>

      {/* Models Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center gap-1">
                  Public Model Name
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center gap-1">
                  Provider
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center gap-1">
                  Mode
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center gap-1">
                  Tokens
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center gap-1">
                  Cost/1M
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Features
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center gap-1">
                  Public
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Details
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredModels.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-sm text-gray-500">
                  No models found
                </td>
              </tr>
            ) : (
              filteredModels.map((model) => (
                <tr key={model.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {model.name}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700">
                      {model.provider}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    chat
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    128K
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    $5.00 / $15.00
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-700">
                        Vision
                      </span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-purple-100 text-purple-700">
                        Functions
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-700">
                      Yes
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button className="text-indigo-600 hover:text-indigo-800 text-sm">
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-gray-200 text-sm text-gray-500">
          Showing {filteredModels.length} of {models.length} models
        </div>
      </div>
    </div>
  );
}
