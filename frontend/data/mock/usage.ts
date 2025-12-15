// Mock data for Usage Analytics
export interface UsageSummary {
  totalSpend: number;
  totalRequests: number;
  totalTokens: number;
  inputTokens: number;
  outputTokens: number;
  successRate: number;
  avgLatencyMs: number;
  p95LatencyMs: number;
  cacheHitRate: number;
}

export interface DailyUsage {
  date: string;
  spend: number;
  requests: number;
  tokens: number;
  inputTokens: number;
  outputTokens: number;
  successRate: number;
  avgLatency: number;
}

export interface UsageByEntity {
  id: string;
  name: string;
  spend: number;
  requests: number;
  tokens: number;
  percentage: number;
  trend: number;
}

// Organization-wide summary
export const usageSummary: UsageSummary = {
  totalSpend: 38456.78,
  totalRequests: 1245670,
  totalTokens: 456789000,
  inputTokens: 312456000,
  outputTokens: 144333000,
  successRate: 98.7,
  avgLatencyMs: 1250,
  p95LatencyMs: 3200,
  cacheHitRate: 34.5,
};

// Generate daily usage data
export function generateDailyUsage(days: number = 30): DailyUsage[] {
  const data: DailyUsage[] = [];
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (days - 1 - i));
    const baseSpend = 1000 + Math.random() * 500;
    const trend = i * 15;
    data.push({
      date: date.toISOString().split('T')[0],
      spend: Math.round((baseSpend + trend + Math.sin(i / 3) * 200) * 100) / 100,
      requests: Math.floor(30000 + Math.random() * 20000 + i * 500),
      tokens: Math.floor(12000000 + Math.random() * 5000000),
      inputTokens: Math.floor(8000000 + Math.random() * 3000000),
      outputTokens: Math.floor(4000000 + Math.random() * 2000000),
      successRate: 97 + Math.random() * 2.5,
      avgLatency: 1000 + Math.random() * 500,
    });
  }
  return data;
}

export const dailyUsage = generateDailyUsage(30);

// Usage by team
export const usageByTeam: UsageByEntity[] = [
  { id: 'team-1', name: 'Engineering - AI Platform Team', spend: 15678.90, requests: 456000, tokens: 178000000, percentage: 40.8, trend: 12.5 },
  { id: 'team-2', name: 'Data Science', spend: 9876.54, requests: 234000, tokens: 98000000, percentage: 25.7, trend: 8.3 },
  { id: 'team-3', name: 'Product Engineering', spend: 6543.21, requests: 189000, tokens: 76000000, percentage: 17.0, trend: -3.2 },
  { id: 'team-5', name: 'Customer Success', spend: 4567.89, requests: 234000, tokens: 67000000, percentage: 11.9, trend: 15.7 },
  { id: 'team-4', name: 'DevOps & Infrastructure', spend: 1790.24, requests: 132670, tokens: 37789000, percentage: 4.6, trend: 2.1 },
];

// Usage by tag
export const usageByTag: UsageByEntity[] = [
  { id: 'tag-1', name: 'production', spend: 22456.78, requests: 789000, tokens: 289000000, percentage: 58.4, trend: 10.2 },
  { id: 'tag-3', name: 'ml-experiments', spend: 8756.23, requests: 234000, tokens: 98000000, percentage: 22.8, trend: 18.5 },
  { id: 'tag-2', name: 'development', spend: 3890.45, requests: 145000, tokens: 45000000, percentage: 10.1, trend: -5.3 },
  { id: 'tag-4', name: 'chatbot', spend: 2456.78, requests: 56000, tokens: 18000000, percentage: 6.4, trend: 22.1 },
  { id: 'tag-8', name: 'qa', spend: 896.54, requests: 21670, tokens: 6789000, percentage: 2.3, trend: 1.8 },
];

// Usage by customer/end-user
export const usageByCustomer: UsageByEntity[] = [
  { id: 'cust-1', name: 'Enterprise Client A', spend: 12456.78, requests: 345000, tokens: 134000000, percentage: 32.4, trend: 15.3 },
  { id: 'cust-2', name: 'Enterprise Client B', spend: 8976.54, requests: 256000, tokens: 98000000, percentage: 23.3, trend: 8.7 },
  { id: 'cust-3', name: 'SMB Client C', spend: 6543.21, requests: 189000, tokens: 72000000, percentage: 17.0, trend: -2.1 },
  { id: 'cust-4', name: 'Startup D', spend: 5678.90, requests: 234000, tokens: 89000000, percentage: 14.8, trend: 45.2 },
  { id: 'cust-5', name: 'Internal Usage', spend: 4801.35, requests: 221670, tokens: 63789000, percentage: 12.5, trend: 5.6 },
];

// Usage by model
export const usageByModel: UsageByEntity[] = [
  { id: 'gpt-4o', name: 'GPT-4o', spend: 12345.67, requests: 345000, tokens: 156000000, percentage: 32.1, trend: 25.4 },
  { id: 'claude-3-sonnet', name: 'Claude 3 Sonnet', spend: 9876.54, requests: 267000, tokens: 123000000, percentage: 25.7, trend: 18.2 },
  { id: 'gpt-4', name: 'GPT-4', spend: 7654.32, requests: 156000, tokens: 67000000, percentage: 19.9, trend: -8.5 },
  { id: 'claude-3-haiku', name: 'Claude 3 Haiku', spend: 4567.89, requests: 289000, tokens: 78000000, percentage: 11.9, trend: 32.1 },
  { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', spend: 2345.67, requests: 134000, tokens: 23000000, percentage: 6.1, trend: -15.3 },
  { id: 'bedrock-claude', name: 'Bedrock Claude', spend: 1666.69, requests: 54670, tokens: 9789000, percentage: 4.3, trend: 42.8 },
];

// Top spending keys
export const topSpendingKeys = [
  { keyAlias: 'Production API', keyId: 'key-1', spend: 8456.78, requests: 234000, tokens: 89000000 },
  { keyAlias: 'Data Science', keyId: 'key-3', spend: 6789.12, requests: 189000, tokens: 76000000 },
  { keyAlias: 'Customer Bot', keyId: 'key-4', spend: 4567.89, requests: 234000, tokens: 67000000 },
  { keyAlias: 'Mobile App Backend', keyId: 'key-8', spend: 3456.78, requests: 156000, tokens: 54000000 },
  { keyAlias: 'Bedrock Claude Key', keyId: 'key-7', spend: 2890.12, requests: 98000, tokens: 45000000 },
];

// Hourly usage pattern
export function generateHourlyPattern() {
  return Array.from({ length: 24 }, (_, hour) => {
    const baseRequests = 10000;
    // Simulate higher usage during business hours
    const hourFactor = hour >= 9 && hour <= 18 ? 2.5 : hour >= 6 && hour <= 22 ? 1.5 : 0.5;
    const requests = Math.floor(baseRequests * hourFactor * (1 + Math.random() * 0.3));
    return {
      hour: `${hour.toString().padStart(2, '0')}:00`,
      requests,
      tokens: requests * 400,
      avgLatency: 800 + Math.random() * 800,
    };
  });
}

export const hourlyPattern = generateHourlyPattern();

// Error breakdown for usage analytics
export const usageErrorBreakdown = [
  { type: 'rate_limit_exceeded', count: 2345, percentage: 45.2 },
  { type: 'context_length_exceeded', count: 1234, percentage: 23.8 },
  { type: 'timeout', count: 876, percentage: 16.9 },
  { type: 'invalid_request', count: 456, percentage: 8.8 },
  { type: 'server_error', count: 278, percentage: 5.3 },
];
