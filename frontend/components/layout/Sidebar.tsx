'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils/cn';
import {
  Key,
  TestTube,
  Cpu,
  BarChart3,
  Users,
  User,
  FileText,
  Package,
  Shield,
  Wallet,
  Database,
  Tag,
  Terminal,
  ClipboardList,
  Settings,
  ChevronDown,
  Building2,
  Box,
  Layers,
  BookOpen,
  Wrench,
  FlaskConical,
} from 'lucide-react';
import { useState } from 'react';

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  badge?: string | number;
}

function NavItem({ href, icon, label, isActive, badge }: NavItemProps) {
  return (
    <Link
      href={href}
      className={cn(
        'flex items-center justify-between px-3 py-2 rounded-lg transition-colors text-sm',
        isActive
          ? 'bg-indigo-50 text-indigo-600 font-medium'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
      )}
    >
      <div className="flex items-center gap-3">
        {icon}
        <span>{label}</span>
      </div>
      {badge !== undefined && (
        <span className="px-2 py-0.5 text-xs bg-gray-200 text-gray-600 rounded-full">
          {badge}
        </span>
      )}
    </Link>
  );
}

interface ExpandableSectionProps {
  icon: React.ReactNode;
  label: string;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  isActive?: boolean;
}

function ExpandableSection({
  icon,
  label,
  expanded,
  onToggle,
  children,
  isActive,
}: ExpandableSectionProps) {
  return (
    <div>
      <button
        onClick={onToggle}
        className={cn(
          'flex items-center justify-between w-full px-3 py-2 rounded-lg transition-colors text-sm',
          isActive
            ? 'text-indigo-600 font-medium'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
        )}
      >
        <div className="flex items-center gap-3">
          {icon}
          <span>{label}</span>
        </div>
        <ChevronDown
          className={cn('w-4 h-4 transition-transform', expanded && 'rotate-180')}
        />
      </button>
      {expanded && <div className="ml-4 mt-1 space-y-1">{children}</div>}
    </div>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const [modelsExpanded, setModelsExpanded] = useState(false);
  const [productsExpanded, setProductsExpanded] = useState(false);
  const [toolsExpanded, setToolsExpanded] = useState(false);
  const [experimentalExpanded, setExperimentalExpanded] = useState(false);
  const [settingsExpanded, setSettingsExpanded] = useState(false);

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen">
      {/* Logo */}
      <div className="p-4 border-b border-gray-200">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">Q</span>
          </div>
          <span className="text-xl font-bold text-gray-900">QuanXAI</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {/* Virtual Keys */}
        <NavItem
          href="/dashboard/keys"
          icon={<Key className="w-5 h-5" />}
          label="Virtual Keys"
          isActive={pathname.startsWith('/dashboard/keys')}
        />

        {/* Test Key */}
        <NavItem
          href="/dashboard/playground"
          icon={<TestTube className="w-5 h-5" />}
          label="Test Key"
          isActive={pathname === '/dashboard/playground'}
        />

        {/* Models + Endpoints */}
        <NavItem
          href="/dashboard/models"
          icon={<Cpu className="w-5 h-5" />}
          label="Models + Endpoints"
          isActive={pathname.startsWith('/dashboard/models')}
        />

        {/* Usage */}
        <NavItem
          href="/dashboard/usage"
          icon={<BarChart3 className="w-5 h-5" />}
          label="Usage"
          isActive={pathname.startsWith('/dashboard/usage')}
        />

        {/* Teams */}
        <NavItem
          href="/dashboard/teams"
          icon={<Users className="w-5 h-5" />}
          label="Teams"
          isActive={pathname.startsWith('/dashboard/teams')}
        />

        {/* Organizations */}
        <NavItem
          href="/dashboard"
          icon={<Building2 className="w-5 h-5" />}
          label="Organizations"
          isActive={pathname === '/dashboard'}
        />

        {/* Internal Users */}
        <NavItem
          href="/dashboard/users"
          icon={<User className="w-5 h-5" />}
          label="Internal Users"
          isActive={pathname.startsWith('/dashboard/users')}
        />

        {/* API Reference */}
        <NavItem
          href="/dashboard/api-reference"
          icon={<BookOpen className="w-5 h-5" />}
          label="API Reference"
          isActive={pathname === '/dashboard/api-reference'}
        />

        {/* Model Hub */}
        <NavItem
          href="/dashboard/model-hub"
          icon={<Layers className="w-5 h-5" />}
          label="Model Hub"
          isActive={pathname.startsWith('/dashboard/model-hub')}
        />

        {/* Logs */}
        <NavItem
          href="/dashboard/logs"
          icon={<FileText className="w-5 h-5" />}
          label="Logs"
          isActive={pathname.startsWith('/dashboard/logs')}
        />

        {/* Guardrails */}
        <NavItem
          href="/dashboard/guardrails"
          icon={<Shield className="w-5 h-5" />}
          label="Guardrails"
          isActive={pathname.startsWith('/dashboard/guardrails')}
        />

        {/* Products Section */}
        <ExpandableSection
          icon={<Package className="w-5 h-5" />}
          label="Products"
          expanded={productsExpanded}
          onToggle={() => setProductsExpanded(!productsExpanded)}
          isActive={pathname.startsWith('/dashboard/products')}
        >
          <Link
            href="/dashboard/products"
            className={cn(
              'flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors',
              pathname === '/dashboard/products'
                ? 'bg-indigo-50 text-indigo-600'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
            )}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Overview</span>
          </Link>
          <Link
            href="/dashboard/products/foundation-models"
            className={cn(
              'flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors',
              pathname === '/dashboard/products/foundation-models'
                ? 'bg-indigo-50 text-indigo-600'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
            )}
          >
            <Box className="w-4 h-4" />
            <span>Foundation Models</span>
          </Link>
          <Link
            href="/dashboard/products/custom-endpoints"
            className={cn(
              'flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors',
              pathname === '/dashboard/products/custom-endpoints'
                ? 'bg-indigo-50 text-indigo-600'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
            )}
          >
            <Cpu className="w-4 h-4" />
            <span>Custom Endpoints</span>
          </Link>
        </ExpandableSection>

        {/* Tools Section */}
        <ExpandableSection
          icon={<Wrench className="w-5 h-5" />}
          label="Tools"
          expanded={toolsExpanded}
          onToggle={() => setToolsExpanded(!toolsExpanded)}
          isActive={pathname.startsWith('/dashboard/tools')}
        >
          <Link
            href="/dashboard/budgets"
            className={cn(
              'flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors',
              pathname === '/dashboard/budgets'
                ? 'bg-indigo-50 text-indigo-600'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
            )}
          >
            <Wallet className="w-4 h-4" />
            <span>Budgets</span>
          </Link>
          <Link
            href="/dashboard/caching"
            className={cn(
              'flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors',
              pathname === '/dashboard/caching'
                ? 'bg-indigo-50 text-indigo-600'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
            )}
          >
            <Database className="w-4 h-4" />
            <span>Caching</span>
          </Link>
          <Link
            href="/dashboard/tags"
            className={cn(
              'flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors',
              pathname === '/dashboard/tags'
                ? 'bg-indigo-50 text-indigo-600'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
            )}
          >
            <Tag className="w-4 h-4" />
            <span>Tag Management</span>
          </Link>
        </ExpandableSection>

        {/* Experimental Section */}
        <ExpandableSection
          icon={<FlaskConical className="w-5 h-5" />}
          label="Experimental"
          expanded={experimentalExpanded}
          onToggle={() => setExperimentalExpanded(!experimentalExpanded)}
          isActive={pathname.startsWith('/dashboard/experimental')}
        >
          <Link
            href="/dashboard/audit"
            className={cn(
              'flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors',
              pathname === '/dashboard/audit'
                ? 'bg-indigo-50 text-indigo-600'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
            )}
          >
            <ClipboardList className="w-4 h-4" />
            <span>Audit Logs</span>
          </Link>
        </ExpandableSection>

        {/* Settings Section */}
        <ExpandableSection
          icon={<Settings className="w-5 h-5" />}
          label="Settings"
          expanded={settingsExpanded}
          onToggle={() => setSettingsExpanded(!settingsExpanded)}
          isActive={pathname.startsWith('/dashboard/settings')}
        >
          <Link
            href="/dashboard/settings"
            className={cn(
              'flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors',
              pathname === '/dashboard/settings'
                ? 'bg-indigo-50 text-indigo-600'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
            )}
          >
            <span>General</span>
          </Link>
        </ExpandableSection>
      </nav>

      {/* User dropdown at bottom */}
      <div className="p-3 border-t border-gray-200">
        <div className="flex items-center justify-between px-3 py-2">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Docs</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">User</span>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </div>
        </div>
      </div>
    </aside>
  );
}
