/**
 * API Client for QuanXAI Backend
 */

const API_BASE = '/api';

interface FetchOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

async function fetchAPI<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { params, ...fetchOptions } = options;

  let url = `${API_BASE}${endpoint}`;

  // Add trailing slash if not present (FastAPI redirect issue)
  if (!url.endsWith('/') && !url.includes('?')) {
    url += '/';
  }

  // Add query params
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  const response = await fetch(url, {
    ...fetchOptions,
    headers: {
      'Content-Type': 'application/json',
      ...fetchOptions.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// Keys API
export interface APIKey {
  id: string;
  alias: string;
  key_prefix: string;
  team_id: string | null;
  team_name: string | null;
  user_id: string | null;
  user_name: string | null;
  models: string[];
  rate_limit_rpm: number;
  rate_limit_tpm: number;
  max_budget_usd: number;
  spent_usd: number;
  status: 'active' | 'blocked' | 'expired';
  created_at: string;
  last_used_at: string | null;
  expires_at: string | null;
  tags: string[];
}

export interface KeyMetrics {
  total_keys: number;
  active_keys: number;
  total_spend: number;
  expiring_soon: number;
}

export const keysAPI = {
  list: (params?: { team_id?: string; status?: string }) =>
    fetchAPI<APIKey[]>('/keys', { params }),

  metrics: () =>
    fetchAPI<KeyMetrics>('/keys/metrics'),

  create: (data: Partial<APIKey>) =>
    fetchAPI<{ key: APIKey; raw_key: string }>('/keys/generate', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<APIKey>) =>
    fetchAPI<APIKey>(`/keys/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    fetchAPI<{ message: string }>(`/keys/${id}`, { method: 'DELETE' }),

  block: (id: string, blocked: boolean) =>
    fetchAPI<APIKey>(`/keys/${id}/block`, {
      method: 'POST',
      body: JSON.stringify({ blocked }),
    }),

  regenerate: (id: string) =>
    fetchAPI<{ key: APIKey; raw_key: string }>(`/keys/${id}/regenerate`, {
      method: 'POST',
    }),
};

// Usage API
export interface UsageSummary {
  total_spend: number;
  total_requests: number;
  total_input_tokens: number;
  total_output_tokens: number;
  total_tokens: number;
  error_rate: number;
  avg_latency_ms: number;
  p95_latency_ms: number;
  cache_hit_rate: number;
}

export interface DailyUsage {
  date: string;
  requests: number;
  tokens: number;
  cost: number;
  error_rate: number;
}

export const usageAPI = {
  summary: (range?: string) =>
    fetchAPI<UsageSummary>('/usage/summary', { params: { range } }),

  daily: (range?: string) =>
    fetchAPI<DailyUsage[]>('/usage/daily', { params: { range } }),

  byTeam: () =>
    fetchAPI<Array<{ team_id: string; team_name: string; requests: number; tokens: number; cost: number }>>('/usage/by-team'),

  byModel: () =>
    fetchAPI<Array<{ model: string; requests: number; tokens: number; cost: number }>>('/usage/by-model'),

  byTag: () =>
    fetchAPI<Array<{ tag_id: string; tag_name: string; requests: number; cost: number }>>('/usage/by-tag'),

  topKeys: (limit?: number) =>
    fetchAPI<Array<{ key_id: string; alias: string; requests: number; cost: number }>>('/usage/top-keys', { params: { limit } }),
};

// Logs API
export interface LogEntry {
  id: string;
  request_id: string;
  api_key_id: string;
  key_alias: string;
  team_id: string | null;
  team_name: string | null;
  user_id: string | null;
  user_name: string | null;
  model_requested: string;
  model_used: string;
  provider: string;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  total_cost_usd: number;
  latency_ms: number;
  is_streaming: boolean;
  is_success: boolean;
  status_code: number;
  error_type: string | null;
  error_message: string | null;
  created_at: string;
  tags: string[];
}

export const logsAPI = {
  list: (params?: {
    limit?: number;
    offset?: number;
    model?: string;
    status?: string;
    team_id?: string;
    start_date?: string;
    end_date?: string;
  }) => fetchAPI<LogEntry[]>('/logs', { params }),

  get: (id: string) =>
    fetchAPI<LogEntry & { request_payload: string; response_payload: string }>(`/logs/${id}`),

  errors: (limit?: number) =>
    fetchAPI<LogEntry[]>('/logs/errors', { params: { limit } }),
};

// Products API
export interface AWSProduct {
  id: string;
  model_id: string;
  display_name: string;
  provider: string;
  region: string;
  regions_available: string[];
  pricing_tier: string;
  input_cost_per_1k: number;
  output_cost_per_1k: number;
  max_tokens: number;
  supports_streaming: boolean;
  supports_vision: boolean;
  supports_function_calling: boolean;
  is_active: boolean;
  total_requests: number;
  total_tokens: number;
  total_cost: number;
  avg_latency_ms: number;
}

export const productsAPI = {
  bedrockModels: () =>
    fetchAPI<AWSProduct[]>('/products/bedrock/models'),

  sagemakerEndpoints: () =>
    fetchAPI<AWSProduct[]>('/products/sagemaker/endpoints'),

  bedrockUsage: (range?: string) =>
    fetchAPI<{ total_cost: number; total_requests: number; by_model: Record<string, number>; by_region: Record<string, number> }>('/products/bedrock/usage', { params: { range } }),

  regionalUsage: () =>
    fetchAPI<Array<{ region: string; requests: number; tokens: number; cost: number }>>('/products/bedrock/regions'),
};

// Guardrails API
export interface Guardrail {
  id: string;
  name: string;
  description: string | null;
  type: string;
  config: Record<string, unknown>;
  enabled: boolean;
  mode: string;
  apply_to_models: string[] | null;
  organization_id: string;
  created_at: string;
  updated_at: string;
  violations_count: number;
  blocked_count: number;
}

export const guardrailsAPI = {
  list: () =>
    fetchAPI<Guardrail[]>('/guardrails'),

  create: (data: Partial<Guardrail>) =>
    fetchAPI<Guardrail>('/guardrails', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<Guardrail>) =>
    fetchAPI<Guardrail>(`/guardrails/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    fetchAPI<{ message: string }>(`/guardrails/${id}`, { method: 'DELETE' }),

  violations: (params?: { guardrail_id?: string; limit?: number }) =>
    fetchAPI<Array<{ id: string; guardrail_name: string; violation_type: string; severity: string; blocked: boolean; created_at: string }>>('/guardrails/violations', { params }),

  metrics: () =>
    fetchAPI<{ total_violations: number; blocked_count: number; violations_by_type: Record<string, number> }>('/guardrails/metrics'),
};

// Budgets API
export interface Budget {
  id: string;
  name: string;
  description: string | null;
  max_budget_usd: number;
  spent_usd: number;
  period: string;
  alert_threshold: number;
  entity_type: string;
  entity_id: string;
  entity_name: string;
  status: string;
  period_start: string;
  reset_date: string;
  alerts_triggered: string[];
  organization_id: string;
  created_at: string;
  is_active: boolean;
}

export const budgetsAPI = {
  list: () =>
    fetchAPI<Budget[]>('/budgets'),

  create: (data: Partial<Budget>) =>
    fetchAPI<Budget>('/budgets', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<Budget>) =>
    fetchAPI<Budget>(`/budgets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    fetchAPI<{ message: string }>(`/budgets/${id}`, { method: 'DELETE' }),

  metrics: () =>
    fetchAPI<{ total_budget: number; total_spent: number; utilization: number; budgets_over_threshold: number }>('/budgets/metrics'),
};

// Tags API
export interface Tag {
  id: string;
  name: string;
  description: string | null;
  color: string;
  organization_id: string;
  keys_count: number;
  requests_count: number;
  total_spend: number;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export const tagsAPI = {
  list: () =>
    fetchAPI<Tag[]>('/tags'),

  create: (data: Partial<Tag>) =>
    fetchAPI<Tag>('/tags', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<Tag>) =>
    fetchAPI<Tag>(`/tags/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    fetchAPI<{ message: string }>(`/tags/${id}`, { method: 'DELETE' }),

  spend: () =>
    fetchAPI<Array<{ tag_id: string; tag_name: string; color: string; total_spend: number }>>('/tags/spend'),
};

// Audit API
export interface AuditEntry {
  id: string;
  actor_id: string;
  actor_type: string;
  actor_email: string | null;
  action: string;
  entity_type: string;
  entity_id: string;
  entity_name: string | null;
  old_value: Record<string, unknown> | null;
  new_value: Record<string, unknown> | null;
  details: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  organization_id: string;
  created_at: string;
}

export const auditAPI = {
  list: (params?: {
    actor_id?: string;
    action?: string;
    entity_type?: string;
    limit?: number;
    offset?: number;
  }) => fetchAPI<AuditEntry[]>('/audit', { params }),

  get: (id: string) =>
    fetchAPI<AuditEntry>(`/audit/${id}`),

  timeline: (days?: number) =>
    fetchAPI<Array<{ date: string; count: number }>>('/audit/timeline', { params: { days } }),
};

// Cache API
export interface CacheMetrics {
  hit_rate: number;
  total_hits: number;
  total_misses: number;
  total_tokens_saved: number;
  total_cost_saved: number;
  cache_size: number;
  max_cache_size: number;
  entries_count: number;
}

export interface CacheConfig {
  enabled: boolean;
  default_ttl: number;
  max_cache_size: number;
  eviction_policy: string;
  semantic_caching: boolean;
  similarity_threshold: number;
}

export const cacheAPI = {
  config: () =>
    fetchAPI<CacheConfig>('/cache/config'),

  updateConfig: (config: Partial<CacheConfig>) =>
    fetchAPI<CacheConfig>('/cache/config', {
      method: 'PUT',
      body: JSON.stringify(config),
    }),

  metrics: (range?: string) =>
    fetchAPI<CacheMetrics>('/cache/metrics', { params: { range } }),

  hitsTrend: (range?: string) =>
    fetchAPI<Array<{ hour: string; hits: number; misses: number }>>('/cache/hits-trend', { params: { range } }),

  byModel: () =>
    fetchAPI<Array<{ model: string; entries: number; hits: number; tokens_saved: number; cost_saved: number }>>('/cache/by-model'),

  dailySavings: (range?: string) =>
    fetchAPI<Array<{ date: string; cost_saved: number; tokens_saved: number }>>('/cache/daily-savings', { params: { range } }),

  topPrompts: (limit?: number) =>
    fetchAPI<Array<{ id: string; prompt_preview: string; model: string; hit_count: number; tokens_saved: number; cost_saved: number; last_hit: string | null }>>('/cache/top-prompts', { params: { limit } }),

  clear: () =>
    fetchAPI<{ message: string; entries_deleted: number }>('/cache/clear', { method: 'DELETE' }),
};

// Organizations API
export interface Organization {
  id: string;
  name: string;
  description: string | null;
  monthly_budget_usd: number;
  total_budget_usd: number;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export const organizationsAPI = {
  list: () =>
    fetchAPI<Organization[]>('/organizations'),

  get: (id: string) =>
    fetchAPI<Organization>(`/organizations/${id}`),
};

// Teams API
export interface Team {
  id: string;
  organization_id: string;
  name: string;
  description: string | null;
  monthly_budget_usd: number;
  total_budget_usd: number;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export const teamsAPI = {
  list: () =>
    fetchAPI<Team[]>('/teams'),

  get: (id: string) =>
    fetchAPI<Team>(`/teams/${id}`),
};

// Users API
export interface User {
  id: string;
  team_id: string;
  email: string;
  name: string;
  role: string | null;
  avatar_url: string | null;
  monthly_budget_usd: number;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export const usersAPI = {
  list: () =>
    fetchAPI<User[]>('/users'),

  get: (id: string) =>
    fetchAPI<User>(`/users/${id}`),
};

// Analytics API
export const analyticsAPI = {
  overview: () =>
    fetchAPI<{
      total_spend: number;
      total_requests: number;
      avg_response_time: number;
      cache_hit_rate: number;
      active_keys: number;
      active_users: number;
    }>('/analytics/overview'),

  spending: (range?: string) =>
    fetchAPI<Array<{ date: string; spend: number }>>('/analytics/spending', { params: { range } }),

  topModels: () =>
    fetchAPI<Array<{ model: string; requests: number; cost: number }>>('/analytics/top-models'),
};
