'use client';

import { Settings, Bell, Shield, Key, Database, Palette } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage your QuanXAI platform configuration
        </p>
      </div>

      {/* Settings Sections */}
      <div className="grid gap-4 max-w-3xl">
        {/* General */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Settings className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-lg font-medium text-gray-900">General</h2>
          </div>
          <p className="text-sm text-gray-500">
            Platform-wide settings and preferences. Coming soon.
          </p>
        </div>

        {/* API Keys */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-50 rounded-lg">
              <Key className="w-5 h-5 text-green-600" />
            </div>
            <h2 className="text-lg font-medium text-gray-900">API Keys</h2>
          </div>
          <p className="text-sm text-gray-500">
            Manage API keys for your organization, teams, and users. Coming soon.
          </p>
        </div>

        {/* Security */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-amber-50 rounded-lg">
              <Shield className="w-5 h-5 text-amber-600" />
            </div>
            <h2 className="text-lg font-medium text-gray-900">Security</h2>
          </div>
          <p className="text-sm text-gray-500">
            Authentication, access controls, and audit logs. Coming soon.
          </p>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Bell className="w-5 h-5 text-purple-600" />
            </div>
            <h2 className="text-lg font-medium text-gray-900">Notifications</h2>
          </div>
          <p className="text-sm text-gray-500">
            Budget alerts, usage notifications, and email preferences. Coming soon.
          </p>
        </div>

        {/* Database */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-cyan-50 rounded-lg">
              <Database className="w-5 h-5 text-cyan-600" />
            </div>
            <h2 className="text-lg font-medium text-gray-900">Data & Storage</h2>
          </div>
          <p className="text-sm text-gray-500">
            Database connections and data retention policies. Coming soon.
          </p>
        </div>

        {/* Appearance */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-pink-50 rounded-lg">
              <Palette className="w-5 h-5 text-pink-600" />
            </div>
            <h2 className="text-lg font-medium text-gray-900">Appearance</h2>
          </div>
          <p className="text-sm text-gray-500">
            Theme customization and branding options. Coming soon.
          </p>
        </div>
      </div>
    </div>
  );
}
