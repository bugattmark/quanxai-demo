'use client';

export type BadgeVariant =
  | 'default'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'purple'
  | 'cyan'
  | 'pink';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-slate-700 text-slate-300',
  success: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
  warning: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
  error: 'bg-red-500/20 text-red-400 border border-red-500/30',
  info: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
  purple: 'bg-purple-500/20 text-purple-400 border border-purple-500/30',
  cyan: 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30',
  pink: 'bg-pink-500/20 text-pink-400 border border-pink-500/30',
};

const dotColors: Record<BadgeVariant, string> = {
  default: 'bg-slate-400',
  success: 'bg-emerald-400',
  warning: 'bg-amber-400',
  error: 'bg-red-400',
  info: 'bg-blue-400',
  purple: 'bg-purple-400',
  cyan: 'bg-cyan-400',
  pink: 'bg-pink-400',
};

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs',
  lg: 'px-3 py-1.5 text-sm',
};

function BadgeComponent({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  className = '',
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]}`} />
      )}
      {children}
    </span>
  );
}

// Predefined status badges
export function StatusBadge({ status, children }: { status: 'active' | 'inactive' | 'blocked' | 'expired' | 'pending' | 'success' | 'error' | 'warning' | 'info', children?: React.ReactNode }) {
  const statusConfig: Record<string, { variant: BadgeVariant; label: string }> = {
    active: { variant: 'success', label: 'Active' },
    inactive: { variant: 'default', label: 'Inactive' },
    blocked: { variant: 'error', label: 'Blocked' },
    expired: { variant: 'warning', label: 'Expired' },
    pending: { variant: 'info', label: 'Pending' },
    success: { variant: 'success', label: 'Success' },
    error: { variant: 'error', label: 'Error' },
    warning: { variant: 'warning', label: 'Warning' },
    info: { variant: 'info', label: 'Info' },
  };

  const config = statusConfig[status] || { variant: 'default', label: status };
  return (
    <BadgeComponent variant={config.variant} dot>
      {children || config.label}
    </BadgeComponent>
  );
}

// Success/Error badge for request status
export function RequestStatusBadge({ success }: { success: boolean }) {
  return (
    <BadgeComponent variant={success ? 'success' : 'error'} dot>
      {success ? 'Success' : 'Failed'}
    </BadgeComponent>
  );
}

// Provider badge
export function ProviderBadge({ provider }: { provider: string }) {
  const providerColors: Record<string, BadgeVariant> = {
    openai: 'success',
    anthropic: 'purple',
    aws: 'warning',
    bedrock: 'warning',
    google: 'info',
    azure: 'cyan',
    meta: 'info',
    mistral: 'pink',
    cohere: 'cyan',
  };

  return (
    <BadgeComponent variant={providerColors[provider.toLowerCase()] || 'default'}>
      {provider}
    </BadgeComponent>
  );
}

// Region badge for AWS
export function RegionBadge({ region }: { region: string }) {
  return (
    <BadgeComponent variant="info" size="sm">
      {region}
    </BadgeComponent>
  );
}

// Named export for compatibility
export const Badge = BadgeComponent;

// Default export
export default BadgeComponent;
