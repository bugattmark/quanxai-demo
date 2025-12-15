// Mock data for Guardrails
export interface Guardrail {
  id: string;
  name: string;
  type: 'openai_moderation' | 'presidio' | 'prompt_injection' | 'bedrock' | 'custom_regex';
  description: string;
  enabled: boolean;
  mode: 'pre_call' | 'post_call' | 'during_call';
  config: Record<string, unknown>;
  modelsApplied: string[];
  violationsLast24h: number;
  violationsLast7d: number;
  createdAt: string;
  updatedAt: string;
}

export interface GuardrailViolation {
  id: string;
  guardrailId: string;
  guardrailName: string;
  requestId: string;
  model: string;
  keyAlias: string;
  userId: string | null;
  userName: string | null;
  violationType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  blockedContent: string;
  action: 'blocked' | 'flagged' | 'modified';
  timestamp: string;
}

export const guardrails: Guardrail[] = [
  {
    id: 'gr-1',
    name: 'OpenAI Content Moderation',
    type: 'openai_moderation',
    description: 'Uses OpenAI moderation API to detect harmful content including hate speech, harassment, and violence',
    enabled: true,
    mode: 'pre_call',
    config: {
      categories: ['hate', 'harassment', 'self-harm', 'sexual', 'violence'],
      threshold: 0.7,
      blockOnViolation: true,
    },
    modelsApplied: ['gpt-4', 'gpt-4o', 'gpt-3.5-turbo', 'claude-3-sonnet', 'claude-3-haiku'],
    violationsLast24h: 12,
    violationsLast7d: 67,
    createdAt: '2024-10-01T10:00:00Z',
    updatedAt: '2024-12-10T14:00:00Z',
  },
  {
    id: 'gr-2',
    name: 'PII Detection (Presidio)',
    type: 'presidio',
    description: 'Detects and redacts personally identifiable information using Microsoft Presidio',
    enabled: true,
    mode: 'pre_call',
    config: {
      entities: ['PERSON', 'EMAIL_ADDRESS', 'PHONE_NUMBER', 'CREDIT_CARD', 'US_SSN', 'IP_ADDRESS'],
      action: 'redact',
      minScore: 0.6,
    },
    modelsApplied: ['gpt-4', 'gpt-4o', 'gpt-3.5-turbo', 'claude-3-sonnet', 'claude-3-haiku', 'claude-3-opus'],
    violationsLast24h: 34,
    violationsLast7d: 189,
    createdAt: '2024-10-15T09:00:00Z',
    updatedAt: '2024-12-12T11:00:00Z',
  },
  {
    id: 'gr-3',
    name: 'Prompt Injection Detection',
    type: 'prompt_injection',
    description: 'Detects attempts to manipulate or inject malicious prompts into the system',
    enabled: true,
    mode: 'pre_call',
    config: {
      model: 'deberta-v3-base-prompt-injection',
      threshold: 0.85,
      blockOnDetection: true,
    },
    modelsApplied: ['gpt-4', 'gpt-4o', 'gpt-3.5-turbo', 'claude-3-sonnet'],
    violationsLast24h: 5,
    violationsLast7d: 23,
    createdAt: '2024-11-01T08:00:00Z',
    updatedAt: '2024-12-08T16:00:00Z',
  },
  {
    id: 'gr-4',
    name: 'AWS Bedrock Guardrails',
    type: 'bedrock',
    description: 'Native AWS Bedrock guardrails for content filtering on Bedrock models',
    enabled: true,
    mode: 'during_call',
    config: {
      guardrailId: 'arn:aws:bedrock:us-east-1:123456789:guardrail/abc123',
      version: '1',
      contentFilters: ['HATE', 'INSULTS', 'SEXUAL', 'VIOLENCE', 'MISCONDUCT'],
      deniedTopics: ['illegal_activities', 'weapons'],
    },
    modelsApplied: ['bedrock/claude-3-sonnet', 'bedrock/claude-3-haiku'],
    violationsLast24h: 8,
    violationsLast7d: 45,
    createdAt: '2024-11-15T12:00:00Z',
    updatedAt: '2024-12-14T09:00:00Z',
  },
  {
    id: 'gr-5',
    name: 'Custom Regex - Sensitive Keywords',
    type: 'custom_regex',
    description: 'Blocks requests containing internal project codenames and sensitive terms',
    enabled: true,
    mode: 'pre_call',
    config: {
      patterns: [
        { pattern: 'PROJECT[_-]?(ALPHA|BETA|GAMMA)', flags: 'i', action: 'block' },
        { pattern: 'INTERNAL[_-]?USE[_-]?ONLY', flags: 'i', action: 'block' },
        { pattern: 'CONFIDENTIAL', flags: 'i', action: 'flag' },
      ],
    },
    modelsApplied: ['gpt-4', 'gpt-4o', 'claude-3-sonnet', 'claude-3-opus'],
    violationsLast24h: 2,
    violationsLast7d: 11,
    createdAt: '2024-12-01T14:00:00Z',
    updatedAt: '2024-12-13T10:00:00Z',
  },
  {
    id: 'gr-6',
    name: 'Output Safety Filter',
    type: 'openai_moderation',
    description: 'Scans model outputs for harmful or inappropriate content before returning to users',
    enabled: false,
    mode: 'post_call',
    config: {
      categories: ['hate', 'harassment', 'violence'],
      threshold: 0.8,
      blockOnViolation: false,
      logOnly: true,
    },
    modelsApplied: ['gpt-4', 'gpt-3.5-turbo'],
    violationsLast24h: 0,
    violationsLast7d: 0,
    createdAt: '2024-12-05T11:00:00Z',
    updatedAt: '2024-12-05T11:00:00Z',
  },
];

// Generate violations
function generateViolations(count: number): GuardrailViolation[] {
  const violations: GuardrailViolation[] = [];
  const models = ['gpt-4', 'gpt-4o', 'claude-3-sonnet', 'bedrock/claude-3-sonnet', 'gpt-3.5-turbo'];
  const keys = [
    { alias: 'Production API', userId: 'user-1', userName: 'Sarah Chen' },
    { alias: 'Development Key', userId: 'user-2', userName: 'Marcus Johnson' },
    { alias: 'Data Science', userId: 'user-3', userName: 'Emily Rodriguez' },
    { alias: 'Customer Bot', userId: null, userName: null },
  ];
  const violationTypes = [
    { type: 'hate_speech', severity: 'high' as const, guardrail: guardrails[0] },
    { type: 'pii_detected', severity: 'medium' as const, guardrail: guardrails[1] },
    { type: 'prompt_injection', severity: 'critical' as const, guardrail: guardrails[2] },
    { type: 'content_filter', severity: 'medium' as const, guardrail: guardrails[3] },
    { type: 'keyword_match', severity: 'low' as const, guardrail: guardrails[4] },
  ];

  for (let i = 0; i < count; i++) {
    const model = models[Math.floor(Math.random() * models.length)];
    const key = keys[Math.floor(Math.random() * keys.length)];
    const violation = violationTypes[Math.floor(Math.random() * violationTypes.length)];
    const timestamp = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000);

    violations.push({
      id: `vio-${i + 1}`,
      guardrailId: violation.guardrail.id,
      guardrailName: violation.guardrail.name,
      requestId: `req-${Math.random().toString(36).substring(2, 15)}`,
      model,
      keyAlias: key.alias,
      userId: key.userId,
      userName: key.userName,
      violationType: violation.type,
      severity: violation.severity,
      blockedContent: generateBlockedContent(violation.type),
      action: Math.random() > 0.2 ? 'blocked' : Math.random() > 0.5 ? 'flagged' : 'modified',
      timestamp: timestamp.toISOString(),
    });
  }

  return violations.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

function generateBlockedContent(type: string): string {
  switch (type) {
    case 'pii_detected':
      return 'Email: j***@example.com, Phone: ***-***-1234';
    case 'prompt_injection':
      return 'Ignore previous instructions and...';
    case 'hate_speech':
      return '[Content redacted due to policy violation]';
    case 'keyword_match':
      return 'Text containing PROJECT_ALPHA reference';
    case 'content_filter':
      return '[AWS Bedrock content filter triggered]';
    default:
      return '[Blocked content]';
  }
}

export const guardrailViolations = generateViolations(200);

// Guardrail metrics
export const guardrailMetrics = {
  totalGuardrails: guardrails.length,
  enabledGuardrails: guardrails.filter(g => g.enabled).length,
  totalViolations24h: guardrails.reduce((sum, g) => sum + g.violationsLast24h, 0),
  totalViolations7d: guardrails.reduce((sum, g) => sum + g.violationsLast7d, 0),
  blockedRequests24h: Math.floor(guardrailViolations.filter(v => {
    const timestamp = new Date(v.timestamp);
    return timestamp > new Date(Date.now() - 24 * 60 * 60 * 1000) && v.action === 'blocked';
  }).length),
  criticalViolations: guardrailViolations.filter(v => v.severity === 'critical').length,
};

// Violations by type breakdown
export const violationsByType = [
  { type: 'PII Detection', count: guardrailViolations.filter(v => v.violationType === 'pii_detected').length, color: '#3B82F6' },
  { type: 'Prompt Injection', count: guardrailViolations.filter(v => v.violationType === 'prompt_injection').length, color: '#EF4444' },
  { type: 'Content Filter', count: guardrailViolations.filter(v => v.violationType === 'content_filter').length, color: '#F59E0B' },
  { type: 'Hate Speech', count: guardrailViolations.filter(v => v.violationType === 'hate_speech').length, color: '#8B5CF6' },
  { type: 'Keyword Match', count: guardrailViolations.filter(v => v.violationType === 'keyword_match').length, color: '#10B981' },
];

// Violations by severity
export const violationsBySeverity = [
  { severity: 'Critical', count: guardrailViolations.filter(v => v.severity === 'critical').length },
  { severity: 'High', count: guardrailViolations.filter(v => v.severity === 'high').length },
  { severity: 'Medium', count: guardrailViolations.filter(v => v.severity === 'medium').length },
  { severity: 'Low', count: guardrailViolations.filter(v => v.severity === 'low').length },
];
