'use client';

import { cn } from '@/lib/utils/cn';
import { TrendingUp, TrendingDown, DollarSign, Zap, Clock, CheckCircle } from 'lucide-react';
import { ReactNode } from 'react';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
  };
  icon?: ReactNode;
  iconType?: 'dollar' | 'zap' | 'clock' | 'check';
  progressBar?: {
    current: number;
    max: number;
    label?: string;
  };
  className?: string;
}

const iconMap = {
  dollar: DollarSign,
  zap: Zap,
  clock: Clock,
  check: CheckCircle,
};

export default function KPICard({
  title,
  value,
  subtitle,
  trend,
  icon,
  iconType,
  progressBar,
  className,
}: KPICardProps) {
  const IconComponent = iconType ? iconMap[iconType] : null;

  return (
    <div
      className={cn(
        'bg-slate-800 rounded-xl p-6 border border-slate-700',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 text-slate-400 text-sm mb-2">
            <span>{title}</span>
            {IconComponent && <IconComponent className="w-4 h-4" />}
            {icon}
          </div>
          <div className="text-3xl font-bold text-white mb-1">{value}</div>
          {subtitle && (
            <div className="text-sm text-slate-500">{subtitle}</div>
          )}
          {trend && (
            <div
              className={cn(
                'flex items-center gap-1 text-sm mt-2',
                trend.direction === 'up' && 'text-emerald-400',
                trend.direction === 'down' && 'text-red-400',
                trend.direction === 'neutral' && 'text-slate-400'
              )}
            >
              {trend.direction === 'up' && <TrendingUp className="w-4 h-4" />}
              {trend.direction === 'down' && <TrendingDown className="w-4 h-4" />}
              <span>
                {trend.direction === 'up' && '+'}
                {trend.value}% from last period
              </span>
            </div>
          )}
        </div>
      </div>

      {progressBar && (
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Budget: ${progressBar.max.toLocaleString()}</span>
            <span>{Math.round((progressBar.current / progressBar.max) * 100)}%</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div
              className={cn(
                'h-2 rounded-full transition-all',
                (progressBar.current / progressBar.max) > 0.9
                  ? 'bg-red-500'
                  : (progressBar.current / progressBar.max) > 0.7
                  ? 'bg-amber-500'
                  : 'bg-blue-500'
              )}
              style={{
                width: `${Math.min((progressBar.current / progressBar.max) * 100, 100)}%`,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
