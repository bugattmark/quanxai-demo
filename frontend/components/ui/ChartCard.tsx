'use client';

import { cn } from '@/lib/utils/cn';
import { ReactNode } from 'react';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  headerAction?: ReactNode;
  className?: string;
}

export default function ChartCard({
  title,
  subtitle,
  children,
  headerAction,
  className,
}: ChartCardProps) {
  return (
    <div
      className={cn(
        'bg-slate-800 rounded-xl p-6 border border-slate-700',
        className
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          {subtitle && (
            <p className="text-sm text-slate-400 mt-1">{subtitle}</p>
          )}
        </div>
        {headerAction}
      </div>
      <div className="w-full">{children}</div>
    </div>
  );
}
