'use client';

import { useState } from 'react';

export interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
}

export interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
  variant?: 'default' | 'pills' | 'underline';
}

function TabsComponent({
  tabs,
  activeTab,
  onChange,
  variant = 'default',
}: TabsProps) {
  const getTabClasses = (tab: Tab) => {
    const isActive = tab.id === activeTab;

    switch (variant) {
      case 'pills':
        return isActive
          ? 'bg-blue-600 text-white'
          : 'text-slate-400 hover:text-white hover:bg-slate-700';
      case 'underline':
        return isActive
          ? 'text-blue-400 border-b-2 border-blue-400'
          : 'text-slate-400 hover:text-white border-b-2 border-transparent';
      default:
        return isActive
          ? 'bg-slate-700 text-white'
          : 'text-slate-400 hover:text-white hover:bg-slate-800';
    }
  };

  const containerClasses = {
    default: 'bg-slate-800 rounded-lg p-1',
    pills: 'flex gap-2',
    underline: 'border-b border-slate-700',
  };

  return (
    <div className={`flex ${containerClasses[variant]}`}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${getTabClasses(tab)}`}
        >
          {tab.icon}
          {tab.label}
          {tab.badge !== undefined && (
            <span
              className={`px-2 py-0.5 text-xs rounded-full ${
                tab.id === activeTab
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-600 text-slate-300'
              }`}
            >
              {tab.badge}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

// Tab Panel wrapper
export function TabPanel({
  children,
  isActive,
  active,
}: {
  children: React.ReactNode;
  isActive?: boolean;
  active?: boolean;
}) {
  const isVisible = isActive ?? active ?? false;
  if (!isVisible) return null;
  return <div className="mt-6">{children}</div>;
}

// Named export for compatibility
export const Tabs = TabsComponent;

// Default export
export default TabsComponent;
