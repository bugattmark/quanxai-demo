// Mock data for Budgets
export interface Budget {
  id: string;
  name: string;
  entityType: 'organization' | 'team' | 'user' | 'key';
  entityId: string;
  entityName: string;
  maxBudgetUsd: number;
  spentUsd: number;
  period: 'daily' | 'weekly' | 'monthly' | 'total';
  alertThresholds: number[];
  alertsTriggered: string[];
  status: 'healthy' | 'warning' | 'critical' | 'exceeded';
  resetDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetAlert {
  id: string;
  budgetId: string;
  budgetName: string;
  entityType: string;
  entityName: string;
  threshold: number;
  currentSpend: number;
  maxBudget: number;
  percentUsed: number;
  severity: 'info' | 'warning' | 'critical';
  acknowledged: boolean;
  triggeredAt: string;
}

function calculateStatus(spent: number, max: number): Budget['status'] {
  const percent = (spent / max) * 100;
  if (percent >= 100) return 'exceeded';
  if (percent >= 90) return 'critical';
  if (percent >= 75) return 'warning';
  return 'healthy';
}

export const budgets: Budget[] = [
  {
    id: 'budget-1',
    name: 'Organization Monthly Limit',
    entityType: 'organization',
    entityId: 'org-1',
    entityName: 'QuanXAI Inc.',
    maxBudgetUsd: 50000,
    spentUsd: 38456.78,
    period: 'monthly',
    alertThresholds: [50, 75, 90, 100],
    alertsTriggered: ['50', '75'],
    status: 'warning',
    resetDate: '2025-01-01T00:00:00Z',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-12-14T12:00:00Z',
  },
  {
    id: 'budget-2',
    name: 'Engineering Team Budget',
    entityType: 'team',
    entityId: 'team-1',
    entityName: 'Engineering - AI Platform Team',
    maxBudgetUsd: 15000,
    spentUsd: 12890.45,
    period: 'monthly',
    alertThresholds: [50, 80, 100],
    alertsTriggered: ['50', '80'],
    status: 'warning',
    resetDate: '2025-01-01T00:00:00Z',
    createdAt: '2024-06-01T00:00:00Z',
    updatedAt: '2024-12-14T10:00:00Z',
  },
  {
    id: 'budget-3',
    name: 'Data Science Experiments',
    entityType: 'team',
    entityId: 'team-2',
    entityName: 'Data Science',
    maxBudgetUsd: 20000,
    spentUsd: 18756.23,
    period: 'monthly',
    alertThresholds: [50, 75, 90, 100],
    alertsTriggered: ['50', '75', '90'],
    status: 'critical',
    resetDate: '2025-01-01T00:00:00Z',
    createdAt: '2024-06-01T00:00:00Z',
    updatedAt: '2024-12-14T11:00:00Z',
  },
  {
    id: 'budget-4',
    name: 'Product Team Monthly',
    entityType: 'team',
    entityId: 'team-3',
    entityName: 'Product Engineering',
    maxBudgetUsd: 8000,
    spentUsd: 4567.89,
    period: 'monthly',
    alertThresholds: [50, 80, 100],
    alertsTriggered: ['50'],
    status: 'healthy',
    resetDate: '2025-01-01T00:00:00Z',
    createdAt: '2024-08-01T00:00:00Z',
    updatedAt: '2024-12-14T09:00:00Z',
  },
  {
    id: 'budget-5',
    name: 'DevOps Automation',
    entityType: 'team',
    entityId: 'team-4',
    entityName: 'DevOps & Infrastructure',
    maxBudgetUsd: 3000,
    spentUsd: 1234.56,
    period: 'monthly',
    alertThresholds: [75, 100],
    alertsTriggered: [],
    status: 'healthy',
    resetDate: '2025-01-01T00:00:00Z',
    createdAt: '2024-09-01T00:00:00Z',
    updatedAt: '2024-12-14T08:00:00Z',
  },
  {
    id: 'budget-6',
    name: 'Customer Success Chatbots',
    entityType: 'team',
    entityId: 'team-5',
    entityName: 'Customer Success',
    maxBudgetUsd: 5000,
    spentUsd: 3890.12,
    period: 'monthly',
    alertThresholds: [50, 75, 90],
    alertsTriggered: ['50', '75'],
    status: 'warning',
    resetDate: '2025-01-01T00:00:00Z',
    createdAt: '2024-07-01T00:00:00Z',
    updatedAt: '2024-12-14T07:00:00Z',
  },
  {
    id: 'budget-7',
    name: 'Sarah Chen - Personal Limit',
    entityType: 'user',
    entityId: 'user-1',
    entityName: 'Sarah Chen',
    maxBudgetUsd: 2000,
    spentUsd: 1567.89,
    period: 'monthly',
    alertThresholds: [80, 100],
    alertsTriggered: [],
    status: 'warning',
    resetDate: '2025-01-01T00:00:00Z',
    createdAt: '2024-10-01T00:00:00Z',
    updatedAt: '2024-12-14T06:00:00Z',
  },
  {
    id: 'budget-8',
    name: 'Emily Rodriguez - Research',
    entityType: 'user',
    entityId: 'user-3',
    entityName: 'Emily Rodriguez',
    maxBudgetUsd: 5000,
    spentUsd: 5123.45,
    period: 'monthly',
    alertThresholds: [50, 75, 90, 100],
    alertsTriggered: ['50', '75', '90', '100'],
    status: 'exceeded',
    resetDate: '2025-01-01T00:00:00Z',
    createdAt: '2024-10-01T00:00:00Z',
    updatedAt: '2024-12-14T05:00:00Z',
  },
  {
    id: 'budget-9',
    name: 'Production API Key Limit',
    entityType: 'key',
    entityId: 'key-1',
    entityName: 'Production API',
    maxBudgetUsd: 5000,
    spentUsd: 2345.67,
    period: 'monthly',
    alertThresholds: [50, 80, 100],
    alertsTriggered: [],
    status: 'healthy',
    resetDate: '2025-01-01T00:00:00Z',
    createdAt: '2024-11-01T00:00:00Z',
    updatedAt: '2024-12-14T04:00:00Z',
  },
  {
    id: 'budget-10',
    name: 'Daily Spend Limit - Org',
    entityType: 'organization',
    entityId: 'org-1',
    entityName: 'QuanXAI Inc.',
    maxBudgetUsd: 2000,
    spentUsd: 1456.78,
    period: 'daily',
    alertThresholds: [75, 100],
    alertsTriggered: [],
    status: 'warning',
    resetDate: '2024-12-15T00:00:00Z',
    createdAt: '2024-12-01T00:00:00Z',
    updatedAt: '2024-12-14T15:00:00Z',
  },
];

// Generate budget alerts
export const budgetAlerts: BudgetAlert[] = [
  {
    id: 'alert-1',
    budgetId: 'budget-8',
    budgetName: 'Emily Rodriguez - Research',
    entityType: 'user',
    entityName: 'Emily Rodriguez',
    threshold: 100,
    currentSpend: 5123.45,
    maxBudget: 5000,
    percentUsed: 102.5,
    severity: 'critical',
    acknowledged: false,
    triggeredAt: '2024-12-14T03:00:00Z',
  },
  {
    id: 'alert-2',
    budgetId: 'budget-3',
    budgetName: 'Data Science Experiments',
    entityType: 'team',
    entityName: 'Data Science',
    threshold: 90,
    currentSpend: 18756.23,
    maxBudget: 20000,
    percentUsed: 93.8,
    severity: 'critical',
    acknowledged: true,
    triggeredAt: '2024-12-13T18:00:00Z',
  },
  {
    id: 'alert-3',
    budgetId: 'budget-2',
    budgetName: 'Engineering Team Budget',
    entityType: 'team',
    entityName: 'Engineering - AI Platform Team',
    threshold: 80,
    currentSpend: 12890.45,
    maxBudget: 15000,
    percentUsed: 85.9,
    severity: 'warning',
    acknowledged: true,
    triggeredAt: '2024-12-12T14:00:00Z',
  },
  {
    id: 'alert-4',
    budgetId: 'budget-1',
    budgetName: 'Organization Monthly Limit',
    entityType: 'organization',
    entityName: 'QuanXAI Inc.',
    threshold: 75,
    currentSpend: 38456.78,
    maxBudget: 50000,
    percentUsed: 76.9,
    severity: 'warning',
    acknowledged: false,
    triggeredAt: '2024-12-11T10:00:00Z',
  },
  {
    id: 'alert-5',
    budgetId: 'budget-6',
    budgetName: 'Customer Success Chatbots',
    entityType: 'team',
    entityName: 'Customer Success',
    threshold: 75,
    currentSpend: 3890.12,
    maxBudget: 5000,
    percentUsed: 77.8,
    severity: 'warning',
    acknowledged: false,
    triggeredAt: '2024-12-10T22:00:00Z',
  },
];

// Budget metrics
export const budgetMetrics = {
  totalBudgets: budgets.length,
  totalAllocated: budgets.reduce((sum, b) => sum + b.maxBudgetUsd, 0),
  totalSpent: budgets.filter(b => b.period === 'monthly').reduce((sum, b) => sum + b.spentUsd, 0),
  budgetsExceeded: budgets.filter(b => b.status === 'exceeded').length,
  budgetsCritical: budgets.filter(b => b.status === 'critical').length,
  budgetsWarning: budgets.filter(b => b.status === 'warning').length,
  budgetsHealthy: budgets.filter(b => b.status === 'healthy').length,
  unacknowledgedAlerts: budgetAlerts.filter(a => !a.acknowledged).length,
};

// Budget by entity type
export const budgetsByEntityType = [
  {
    type: 'Organization',
    count: budgets.filter(b => b.entityType === 'organization').length,
    totalBudget: budgets.filter(b => b.entityType === 'organization').reduce((sum, b) => sum + b.maxBudgetUsd, 0),
    totalSpent: budgets.filter(b => b.entityType === 'organization').reduce((sum, b) => sum + b.spentUsd, 0),
  },
  {
    type: 'Team',
    count: budgets.filter(b => b.entityType === 'team').length,
    totalBudget: budgets.filter(b => b.entityType === 'team').reduce((sum, b) => sum + b.maxBudgetUsd, 0),
    totalSpent: budgets.filter(b => b.entityType === 'team').reduce((sum, b) => sum + b.spentUsd, 0),
  },
  {
    type: 'User',
    count: budgets.filter(b => b.entityType === 'user').length,
    totalBudget: budgets.filter(b => b.entityType === 'user').reduce((sum, b) => sum + b.maxBudgetUsd, 0),
    totalSpent: budgets.filter(b => b.entityType === 'user').reduce((sum, b) => sum + b.spentUsd, 0),
  },
  {
    type: 'Key',
    count: budgets.filter(b => b.entityType === 'key').length,
    totalBudget: budgets.filter(b => b.entityType === 'key').reduce((sum, b) => sum + b.maxBudgetUsd, 0),
    totalSpent: budgets.filter(b => b.entityType === 'key').reduce((sum, b) => sum + b.spentUsd, 0),
  },
];

// Budget utilization trend (last 30 days)
export function generateBudgetTrend(days: number = 30) {
  return Array.from({ length: days }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (days - 1 - i));
    const baseSpend = 1200;
    const variation = Math.random() * 400 - 200;
    const dailySpend = baseSpend + variation + (i * 20);
    return {
      date: date.toISOString().split('T')[0],
      dailySpend: Math.round(dailySpend * 100) / 100,
      cumulativeSpend: Math.round((dailySpend * (i + 1)) * 100) / 100,
      budgetLimit: 50000,
    };
  });
}

export const budgetTrend = generateBudgetTrend(30);
