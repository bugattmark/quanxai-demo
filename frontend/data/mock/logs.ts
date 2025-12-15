// Mock data for Request Logs
export interface RequestLog {
  id: string;
  requestId: string;
  model: string;
  provider: string;
  keyAlias: string;
  keyId: string;
  userId: string | null;
  userName: string | null;
  teamId: string | null;
  teamName: string | null;
  status: 'success' | 'failed';
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  costUsd: number;
  latencyMs: number;
  errorType: string | null;
  errorMessage: string | null;
  statusCode: number;
  createdAt: string;
  isStreaming: boolean;
  cacheHit: boolean;
}

const models = [
  { name: 'gpt-4', provider: 'openai' },
  { name: 'gpt-4o', provider: 'openai' },
  { name: 'gpt-3.5-turbo', provider: 'openai' },
  { name: 'claude-3-sonnet', provider: 'anthropic' },
  { name: 'claude-3-haiku', provider: 'anthropic' },
  { name: 'claude-3-opus', provider: 'anthropic' },
  { name: 'llama-3-70b', provider: 'meta' },
  { name: 'bedrock/claude-3-sonnet', provider: 'aws' },
  { name: 'bedrock/claude-3-haiku', provider: 'aws' },
];

const errorTypes = [
  { type: 'rate_limit_exceeded', message: 'Rate limit exceeded. Please retry after 60 seconds.', code: 429 },
  { type: 'context_length_exceeded', message: 'Maximum context length exceeded for this model.', code: 400 },
  { type: 'invalid_api_key', message: 'Invalid API key provided.', code: 401 },
  { type: 'model_not_found', message: 'The requested model does not exist.', code: 404 },
  { type: 'server_error', message: 'Internal server error occurred.', code: 500 },
  { type: 'timeout', message: 'Request timed out after 30 seconds.', code: 504 },
];

const keys = [
  { id: 'key-1', alias: 'Production API', userId: 'user-1', userName: 'Sarah Chen', teamId: 'team-1', teamName: 'Engineering' },
  { id: 'key-2', alias: 'Development Key', userId: 'user-2', userName: 'Marcus Johnson', teamId: 'team-1', teamName: 'Engineering' },
  { id: 'key-3', alias: 'Data Science', userId: 'user-3', userName: 'Emily Rodriguez', teamId: 'team-2', teamName: 'Data Science' },
  { id: 'key-4', alias: 'Customer Bot', userId: null, userName: null, teamId: 'team-5', teamName: 'Customer Success' },
  { id: 'key-7', alias: 'Bedrock Key', userId: 'user-7', userName: 'Anna Kowalski', teamId: 'team-1', teamName: 'Engineering' },
];

function generateRandomLog(index: number): RequestLog {
  const model = models[Math.floor(Math.random() * models.length)];
  const key = keys[Math.floor(Math.random() * keys.length)];
  const isSuccess = Math.random() > 0.05; // 95% success rate
  const error = !isSuccess ? errorTypes[Math.floor(Math.random() * errorTypes.length)] : null;

  const promptTokens = Math.floor(Math.random() * 2000) + 100;
  const completionTokens = isSuccess ? Math.floor(Math.random() * 1000) + 50 : 0;

  // Calculate cost based on model
  let costPerInputToken = 0.00003;
  let costPerOutputToken = 0.00006;
  if (model.name.includes('gpt-4')) {
    costPerInputToken = 0.00003;
    costPerOutputToken = 0.00006;
  } else if (model.name.includes('gpt-3.5')) {
    costPerInputToken = 0.0000015;
    costPerOutputToken = 0.000002;
  } else if (model.name.includes('claude-3-opus')) {
    costPerInputToken = 0.000015;
    costPerOutputToken = 0.000075;
  } else if (model.name.includes('claude-3-sonnet')) {
    costPerInputToken = 0.000003;
    costPerOutputToken = 0.000015;
  } else if (model.name.includes('claude-3-haiku')) {
    costPerInputToken = 0.00000025;
    costPerOutputToken = 0.00000125;
  }

  const costUsd = (promptTokens * costPerInputToken) + (completionTokens * costPerOutputToken);

  // Random timestamp in the last 7 days
  const timestamp = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000);

  return {
    id: `log-${index}`,
    requestId: `req-${Math.random().toString(36).substring(2, 15)}`,
    model: model.name,
    provider: model.provider,
    keyAlias: key.alias,
    keyId: key.id,
    userId: key.userId,
    userName: key.userName,
    teamId: key.teamId,
    teamName: key.teamName,
    status: isSuccess ? 'success' : 'failed',
    promptTokens,
    completionTokens,
    totalTokens: promptTokens + completionTokens,
    costUsd: parseFloat(costUsd.toFixed(6)),
    latencyMs: isSuccess ? Math.floor(Math.random() * 5000) + 200 : Math.floor(Math.random() * 1000) + 100,
    errorType: error?.type || null,
    errorMessage: error?.message || null,
    statusCode: isSuccess ? 200 : error?.code || 500,
    createdAt: timestamp.toISOString(),
    isStreaming: Math.random() > 0.6,
    cacheHit: Math.random() > 0.7,
  };
}

// Generate 500 sample logs
export const requestLogs: RequestLog[] = Array.from({ length: 500 }, (_, i) => generateRandomLog(i));

// Sort by date descending
requestLogs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

// Log metrics
export const logMetrics = {
  totalRequests: requestLogs.length,
  successfulRequests: requestLogs.filter(l => l.status === 'success').length,
  failedRequests: requestLogs.filter(l => l.status === 'failed').length,
  successRate: (requestLogs.filter(l => l.status === 'success').length / requestLogs.length * 100).toFixed(1),
  totalTokens: requestLogs.reduce((sum, l) => sum + l.totalTokens, 0),
  totalCost: requestLogs.reduce((sum, l) => sum + l.costUsd, 0),
  avgLatency: Math.round(requestLogs.filter(l => l.status === 'success').reduce((sum, l) => sum + l.latencyMs, 0) / requestLogs.filter(l => l.status === 'success').length),
  cacheHitRate: (requestLogs.filter(l => l.cacheHit).length / requestLogs.length * 100).toFixed(1),
};

// Error breakdown for logs
export const logsErrorBreakdown = errorTypes.map(et => ({
  type: et.type,
  count: requestLogs.filter(l => l.errorType === et.type).length,
})).filter(e => e.count > 0);

// Requests by model
export const requestsByModel = models.map(m => ({
  model: m.name,
  provider: m.provider,
  count: requestLogs.filter(l => l.model === m.name).length,
  cost: requestLogs.filter(l => l.model === m.name).reduce((sum, l) => sum + l.costUsd, 0),
})).filter(m => m.count > 0);
