// Mock data for Audit Logs
export interface AuditLog {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  actorType: 'user' | 'system' | 'api';
  actorEmail: string | null;
  action: string;
  actionCategory: 'key' | 'team' | 'user' | 'model' | 'budget' | 'guardrail' | 'settings' | 'auth';
  entityType: string;
  entityId: string;
  entityName: string;
  details: Record<string, unknown>;
  ipAddress: string | null;
  userAgent: string | null;
  status: 'success' | 'failed';
}

const actors = [
  { id: 'user-1', name: 'Sarah Chen', email: 'sarah.chen@quanxai.com', type: 'user' as const },
  { id: 'user-2', name: 'Marcus Johnson', email: 'marcus.j@quanxai.com', type: 'user' as const },
  { id: 'user-3', name: 'Emily Rodriguez', email: 'emily.r@quanxai.com', type: 'user' as const },
  { id: 'user-4', name: 'David Kim', email: 'david.kim@quanxai.com', type: 'user' as const },
  { id: 'system', name: 'System', email: null, type: 'system' as const },
  { id: 'api', name: 'API Service', email: null, type: 'api' as const },
];

const auditActions = [
  // Key actions
  { action: 'key.created', category: 'key' as const, entity: 'VirtualKey', status: 'success' as const },
  { action: 'key.deleted', category: 'key' as const, entity: 'VirtualKey', status: 'success' as const },
  { action: 'key.regenerated', category: 'key' as const, entity: 'VirtualKey', status: 'success' as const },
  { action: 'key.blocked', category: 'key' as const, entity: 'VirtualKey', status: 'success' as const },
  { action: 'key.unblocked', category: 'key' as const, entity: 'VirtualKey', status: 'success' as const },
  { action: 'key.updated', category: 'key' as const, entity: 'VirtualKey', status: 'success' as const },
  { action: 'key.rate_limit_updated', category: 'key' as const, entity: 'VirtualKey', status: 'success' as const },

  // Team actions
  { action: 'team.created', category: 'team' as const, entity: 'Team', status: 'success' as const },
  { action: 'team.updated', category: 'team' as const, entity: 'Team', status: 'success' as const },
  { action: 'team.deleted', category: 'team' as const, entity: 'Team', status: 'success' as const },
  { action: 'team.member_added', category: 'team' as const, entity: 'Team', status: 'success' as const },
  { action: 'team.member_removed', category: 'team' as const, entity: 'Team', status: 'success' as const },

  // User actions
  { action: 'user.created', category: 'user' as const, entity: 'User', status: 'success' as const },
  { action: 'user.updated', category: 'user' as const, entity: 'User', status: 'success' as const },
  { action: 'user.deleted', category: 'user' as const, entity: 'User', status: 'success' as const },
  { action: 'user.role_changed', category: 'user' as const, entity: 'User', status: 'success' as const },

  // Model actions
  { action: 'model.added', category: 'model' as const, entity: 'Model', status: 'success' as const },
  { action: 'model.removed', category: 'model' as const, entity: 'Model', status: 'success' as const },
  { action: 'model.updated', category: 'model' as const, entity: 'Model', status: 'success' as const },

  // Budget actions
  { action: 'budget.created', category: 'budget' as const, entity: 'Budget', status: 'success' as const },
  { action: 'budget.updated', category: 'budget' as const, entity: 'Budget', status: 'success' as const },
  { action: 'budget.deleted', category: 'budget' as const, entity: 'Budget', status: 'success' as const },
  { action: 'budget.exceeded', category: 'budget' as const, entity: 'Budget', status: 'success' as const },
  { action: 'budget.alert_triggered', category: 'budget' as const, entity: 'Budget', status: 'success' as const },

  // Guardrail actions
  { action: 'guardrail.created', category: 'guardrail' as const, entity: 'Guardrail', status: 'success' as const },
  { action: 'guardrail.updated', category: 'guardrail' as const, entity: 'Guardrail', status: 'success' as const },
  { action: 'guardrail.deleted', category: 'guardrail' as const, entity: 'Guardrail', status: 'success' as const },
  { action: 'guardrail.enabled', category: 'guardrail' as const, entity: 'Guardrail', status: 'success' as const },
  { action: 'guardrail.disabled', category: 'guardrail' as const, entity: 'Guardrail', status: 'success' as const },

  // Settings actions
  { action: 'settings.updated', category: 'settings' as const, entity: 'Settings', status: 'success' as const },
  { action: 'settings.sso_configured', category: 'settings' as const, entity: 'Settings', status: 'success' as const },

  // Auth actions
  { action: 'auth.login', category: 'auth' as const, entity: 'Session', status: 'success' as const },
  { action: 'auth.logout', category: 'auth' as const, entity: 'Session', status: 'success' as const },
  { action: 'auth.login_failed', category: 'auth' as const, entity: 'Session', status: 'failed' as const },
  { action: 'auth.password_changed', category: 'auth' as const, entity: 'User', status: 'success' as const },
];

const entityNames: Record<string, string[]> = {
  VirtualKey: ['Production API', 'Development Key', 'Data Science', 'Customer Bot', 'Test Key', 'Mobile App Key'],
  Team: ['Engineering', 'Data Science', 'Product', 'DevOps', 'Customer Success'],
  User: ['Sarah Chen', 'Marcus Johnson', 'Emily Rodriguez', 'David Kim', 'Lisa Wang', 'James Wilson'],
  Model: ['gpt-4', 'gpt-4o', 'claude-3-sonnet', 'claude-3-haiku', 'llama-3-70b', 'bedrock/claude-3-sonnet'],
  Budget: ['Org Monthly', 'Engineering Budget', 'Data Science Budget', 'Daily Limit', 'Team Budget'],
  Guardrail: ['PII Detection', 'Content Moderation', 'Prompt Injection', 'Bedrock Guardrails'],
  Settings: ['Organization Settings'],
  Session: ['User Session'],
};

const ipAddresses = [
  '192.168.1.100',
  '10.0.0.45',
  '172.16.0.23',
  '203.0.113.50',
  '198.51.100.25',
  null,
];

const userAgents = [
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/120.0.0.0',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Firefox/121.0',
  'Mozilla/5.0 (Linux; Android 14) Chrome/120.0.0.0 Mobile',
  'QuanXAI-CLI/1.0.0',
  'Python-requests/2.31.0',
  null,
];

function generateAuditLogs(count: number): AuditLog[] {
  const logs: AuditLog[] = [];

  for (let i = 0; i < count; i++) {
    const actor = actors[Math.floor(Math.random() * actors.length)];
    const actionData = auditActions[Math.floor(Math.random() * auditActions.length)];
    const entityNameList = entityNames[actionData.entity] || ['Unknown'];
    const entityName = entityNameList[Math.floor(Math.random() * entityNameList.length)];
    const timestamp = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);

    logs.push({
      id: `audit-${i + 1}`,
      timestamp: timestamp.toISOString(),
      actorId: actor.id,
      actorName: actor.name,
      actorType: actor.type,
      actorEmail: actor.email,
      action: actionData.action,
      actionCategory: actionData.category,
      entityType: actionData.entity,
      entityId: `${actionData.entity.toLowerCase()}-${Math.floor(Math.random() * 10) + 1}`,
      entityName,
      details: generateDetails(actionData.action, entityName),
      ipAddress: ipAddresses[Math.floor(Math.random() * ipAddresses.length)],
      userAgent: userAgents[Math.floor(Math.random() * userAgents.length)],
      status: actionData.status,
    });
  }

  return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

function generateDetails(action: string, entityName: string): Record<string, unknown> {
  const details: Record<string, unknown> = {};

  switch (action) {
    case 'key.created':
      details.models = ['gpt-4', 'claude-3-sonnet'];
      details.rateLimitRpm = 100;
      details.maxBudget = 1000;
      break;
    case 'key.regenerated':
      details.reason = 'Security rotation';
      break;
    case 'key.blocked':
      details.reason = 'Budget exceeded';
      break;
    case 'key.rate_limit_updated':
      details.oldLimit = 50;
      details.newLimit = 100;
      break;
    case 'team.member_added':
      details.memberEmail = 'new.member@quanxai.com';
      details.role = 'member';
      break;
    case 'user.role_changed':
      details.oldRole = 'viewer';
      details.newRole = 'admin';
      break;
    case 'budget.exceeded':
      details.budgetLimit = 5000;
      details.currentSpend = 5123.45;
      break;
    case 'budget.alert_triggered':
      details.threshold = 90;
      details.currentPercent = 92.5;
      break;
    case 'guardrail.updated':
      details.field = 'threshold';
      details.oldValue = 0.7;
      details.newValue = 0.8;
      break;
    case 'auth.login_failed':
      details.reason = 'Invalid credentials';
      details.attempts = 3;
      break;
    default:
      details.entityName = entityName;
  }

  return details;
}

export const auditLogs = generateAuditLogs(500);

// Audit metrics
export const auditMetrics = {
  totalLogs: auditLogs.length,
  logsLast24h: auditLogs.filter(l => new Date(l.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)).length,
  logsLast7d: auditLogs.filter(l => new Date(l.timestamp) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length,
  failedActions: auditLogs.filter(l => l.status === 'failed').length,
  uniqueActors: new Set(auditLogs.map(l => l.actorId)).size,
};

// Actions by category
export const actionsByCategory = [
  { category: 'Key Management', count: auditLogs.filter(l => l.actionCategory === 'key').length, color: '#3B82F6' },
  { category: 'Team Management', count: auditLogs.filter(l => l.actionCategory === 'team').length, color: '#10B981' },
  { category: 'User Management', count: auditLogs.filter(l => l.actionCategory === 'user').length, color: '#F59E0B' },
  { category: 'Authentication', count: auditLogs.filter(l => l.actionCategory === 'auth').length, color: '#8B5CF6' },
  { category: 'Budget', count: auditLogs.filter(l => l.actionCategory === 'budget').length, color: '#EF4444' },
  { category: 'Guardrails', count: auditLogs.filter(l => l.actionCategory === 'guardrail').length, color: '#06B6D4' },
  { category: 'Settings', count: auditLogs.filter(l => l.actionCategory === 'settings').length, color: '#EC4899' },
  { category: 'Model', count: auditLogs.filter(l => l.actionCategory === 'model').length, color: '#14B8A6' },
];

// Activity by actor
export const activityByActor = actors
  .filter(a => a.type === 'user')
  .map(actor => ({
    name: actor.name,
    email: actor.email,
    actions: auditLogs.filter(l => l.actorId === actor.id).length,
  }))
  .sort((a, b) => b.actions - a.actions);

// Recent activity timeline (last 7 days)
export function generateActivityTimeline(days: number = 7) {
  return Array.from({ length: days }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (days - 1 - i));
    const dayStart = new Date(date.setHours(0, 0, 0, 0));
    const dayEnd = new Date(date.setHours(23, 59, 59, 999));

    return {
      date: dayStart.toISOString().split('T')[0],
      total: auditLogs.filter(l => {
        const ts = new Date(l.timestamp);
        return ts >= dayStart && ts <= dayEnd;
      }).length,
      success: auditLogs.filter(l => {
        const ts = new Date(l.timestamp);
        return ts >= dayStart && ts <= dayEnd && l.status === 'success';
      }).length,
      failed: auditLogs.filter(l => {
        const ts = new Date(l.timestamp);
        return ts >= dayStart && ts <= dayEnd && l.status === 'failed';
      }).length,
    };
  });
}

export const activityTimeline = generateActivityTimeline(7);
