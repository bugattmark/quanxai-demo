// Mock data for AWS Products (Bedrock & SageMaker)

export interface BedrockModel {
  id: string;
  modelId: string;
  displayName: string;
  provider: string;
  region: string;
  regionsAvailable: string[];
  pricingTier: 'on_demand' | 'provisioned' | 'batch';
  inputCostPer1k: number;
  outputCostPer1k: number;
  maxTokens: number;
  supportsStreaming: boolean;
  supportsVision: boolean;
  status: 'active' | 'inactive';
  // Usage metrics
  requests: number;
  tokens: number;
  cost: number;
  avgLatencyMs: number;
  successRate: number;
}

export interface SageMakerEndpoint {
  id: string;
  endpointName: string;
  modelName: string;
  instanceType: string;
  instanceCount: number;
  region: string;
  status: 'InService' | 'Creating' | 'Updating' | 'Failed' | 'Deleting';
  createdAt: string;
  // Usage metrics
  requestsPerHour: number;
  costPerHour: number;
  avgLatencyMs: number;
  successRate: number;
}

export interface CostAllocation {
  tag: string;
  tagValue: string;
  cost: number;
  requests: number;
  tokens: number;
  percentage: number;
}

// Bedrock Models
export const bedrockModels: BedrockModel[] = [
  {
    id: 'bedrock-1',
    modelId: 'anthropic.claude-3-5-sonnet-20241022-v2:0',
    displayName: 'Claude 3.5 Sonnet v2',
    provider: 'Anthropic',
    region: 'us-east-1',
    regionsAvailable: ['us-east-1', 'us-west-2', 'eu-west-1'],
    pricingTier: 'on_demand',
    inputCostPer1k: 0.003,
    outputCostPer1k: 0.015,
    maxTokens: 200000,
    supportsStreaming: true,
    supportsVision: true,
    status: 'active',
    requests: 45230,
    tokens: 12300000,
    cost: 2456.78,
    avgLatencyMs: 1200,
    successRate: 99.2,
  },
  {
    id: 'bedrock-2',
    modelId: 'anthropic.claude-3-haiku-20240307-v1:0',
    displayName: 'Claude 3 Haiku',
    provider: 'Anthropic',
    region: 'us-west-2',
    regionsAvailable: ['us-east-1', 'us-west-2', 'eu-west-1', 'ap-northeast-1'],
    pricingTier: 'on_demand',
    inputCostPer1k: 0.00025,
    outputCostPer1k: 0.00125,
    maxTokens: 200000,
    supportsStreaming: true,
    supportsVision: true,
    status: 'active',
    requests: 89100,
    tokens: 45600000,
    cost: 890.45,
    avgLatencyMs: 800,
    successRate: 99.5,
  },
  {
    id: 'bedrock-3',
    modelId: 'meta.llama3-70b-instruct-v1:0',
    displayName: 'Llama 3 70B Instruct',
    provider: 'Meta',
    region: 'us-east-1',
    regionsAvailable: ['us-east-1', 'us-west-2'],
    pricingTier: 'on_demand',
    inputCostPer1k: 0.00265,
    outputCostPer1k: 0.0035,
    maxTokens: 8000,
    supportsStreaming: true,
    supportsVision: false,
    status: 'active',
    requests: 23400,
    tokens: 8900000,
    cost: 234.56,
    avgLatencyMs: 2100,
    successRate: 98.8,
  },
  {
    id: 'bedrock-4',
    modelId: 'amazon.titan-text-premier-v1:0',
    displayName: 'Amazon Titan Text Premier',
    provider: 'Amazon',
    region: 'us-east-1',
    regionsAvailable: ['us-east-1', 'us-west-2', 'eu-west-1'],
    pricingTier: 'on_demand',
    inputCostPer1k: 0.0005,
    outputCostPer1k: 0.0015,
    maxTokens: 32000,
    supportsStreaming: true,
    supportsVision: false,
    status: 'active',
    requests: 12300,
    tokens: 5600000,
    cost: 123.45,
    avgLatencyMs: 900,
    successRate: 99.1,
  },
  {
    id: 'bedrock-5',
    modelId: 'mistral.mixtral-8x7b-instruct-v0:1',
    displayName: 'Mixtral 8x7B Instruct',
    provider: 'Mistral AI',
    region: 'us-west-2',
    regionsAvailable: ['us-east-1', 'us-west-2'],
    pricingTier: 'on_demand',
    inputCostPer1k: 0.00045,
    outputCostPer1k: 0.0007,
    maxTokens: 32000,
    supportsStreaming: true,
    supportsVision: false,
    status: 'active',
    requests: 8500,
    tokens: 3200000,
    cost: 78.90,
    avgLatencyMs: 1100,
    successRate: 99.3,
  },
  {
    id: 'bedrock-6',
    modelId: 'cohere.command-r-plus-v1:0',
    displayName: 'Cohere Command R+',
    provider: 'Cohere',
    region: 'us-east-1',
    regionsAvailable: ['us-east-1', 'us-west-2'],
    pricingTier: 'on_demand',
    inputCostPer1k: 0.003,
    outputCostPer1k: 0.015,
    maxTokens: 128000,
    supportsStreaming: true,
    supportsVision: false,
    status: 'active',
    requests: 5600,
    tokens: 2100000,
    cost: 156.78,
    avgLatencyMs: 1500,
    successRate: 98.5,
  },
  {
    id: 'bedrock-7',
    modelId: 'amazon.nova-pro-v1:0',
    displayName: 'Amazon Nova Pro',
    provider: 'Amazon',
    region: 'us-east-1',
    regionsAvailable: ['us-east-1'],
    pricingTier: 'on_demand',
    inputCostPer1k: 0.0008,
    outputCostPer1k: 0.0032,
    maxTokens: 300000,
    supportsStreaming: true,
    supportsVision: true,
    status: 'active',
    requests: 3400,
    tokens: 1800000,
    cost: 45.67,
    avgLatencyMs: 1000,
    successRate: 99.0,
  },
];

// SageMaker Endpoints
export const sagemakerEndpoints: SageMakerEndpoint[] = [
  {
    id: 'sm-1',
    endpointName: 'custom-llama-finetune-prod',
    modelName: 'Llama 3 8B Fine-tuned',
    instanceType: 'ml.g5.2xlarge',
    instanceCount: 2,
    region: 'us-east-1',
    status: 'InService',
    createdAt: '2024-10-15T10:00:00Z',
    requestsPerHour: 1250,
    costPerHour: 2.45,
    avgLatencyMs: 350,
    successRate: 99.8,
  },
  {
    id: 'sm-2',
    endpointName: 'embedding-model-prod',
    modelName: 'Custom Embedding Model',
    instanceType: 'ml.g5.xlarge',
    instanceCount: 3,
    region: 'us-east-1',
    status: 'InService',
    createdAt: '2024-09-20T14:00:00Z',
    requestsPerHour: 5000,
    costPerHour: 3.67,
    avgLatencyMs: 45,
    successRate: 99.9,
  },
  {
    id: 'sm-3',
    endpointName: 'classification-model-staging',
    modelName: 'Text Classification v2',
    instanceType: 'ml.m5.xlarge',
    instanceCount: 1,
    region: 'us-west-2',
    status: 'InService',
    createdAt: '2024-11-01T09:00:00Z',
    requestsPerHour: 200,
    costPerHour: 0.35,
    avgLatencyMs: 120,
    successRate: 98.5,
  },
  {
    id: 'sm-4',
    endpointName: 'summarization-model-dev',
    modelName: 'BART Summarization',
    instanceType: 'ml.g5.xlarge',
    instanceCount: 1,
    region: 'us-east-1',
    status: 'Updating',
    createdAt: '2024-11-20T16:00:00Z',
    requestsPerHour: 50,
    costPerHour: 1.22,
    avgLatencyMs: 890,
    successRate: 97.2,
  },
  {
    id: 'sm-5',
    endpointName: 'sentiment-analysis-prod',
    modelName: 'RoBERTa Sentiment',
    instanceType: 'ml.m5.large',
    instanceCount: 2,
    region: 'eu-west-1',
    status: 'InService',
    createdAt: '2024-08-10T11:00:00Z',
    requestsPerHour: 3500,
    costPerHour: 0.46,
    avgLatencyMs: 25,
    successRate: 99.7,
  },
];

// Cost Allocation by Tag
export const costAllocationByTag: CostAllocation[] = [
  { tag: 'project', tagValue: 'customer-support', cost: 1245.67, requests: 45000, tokens: 18000000, percentage: 32.5 },
  { tag: 'project', tagValue: 'data-analytics', cost: 890.45, requests: 32000, tokens: 12500000, percentage: 23.2 },
  { tag: 'project', tagValue: 'mobile-app', cost: 678.90, requests: 28000, tokens: 9800000, percentage: 17.7 },
  { tag: 'project', tagValue: 'internal-tools', cost: 456.78, requests: 18000, tokens: 6700000, percentage: 11.9 },
  { tag: 'project', tagValue: 'research', cost: 345.67, requests: 12000, tokens: 4500000, percentage: 9.0 },
  { tag: 'project', tagValue: 'other', cost: 218.43, requests: 8000, tokens: 3200000, percentage: 5.7 },
];

export const costAllocationByTeam: CostAllocation[] = [
  { tag: 'team', tagValue: 'Engineering', cost: 1567.89, requests: 58000, tokens: 22000000, percentage: 40.9 },
  { tag: 'team', tagValue: 'Data Science', cost: 987.65, requests: 35000, tokens: 14500000, percentage: 25.8 },
  { tag: 'team', tagValue: 'Product', cost: 567.89, requests: 22000, tokens: 8900000, percentage: 14.8 },
  { tag: 'team', tagValue: 'Customer Success', cost: 456.78, requests: 18000, tokens: 6800000, percentage: 11.9 },
  { tag: 'team', tagValue: 'DevOps', cost: 255.69, requests: 10000, tokens: 3500000, percentage: 6.6 },
];

export const costAllocationByEnvironment: CostAllocation[] = [
  { tag: 'environment', tagValue: 'production', cost: 2890.12, requests: 105000, tokens: 42000000, percentage: 75.4 },
  { tag: 'environment', tagValue: 'staging', cost: 567.89, requests: 22000, tokens: 8500000, percentage: 14.8 },
  { tag: 'environment', tagValue: 'development', cost: 377.89, requests: 16000, tokens: 5200000, percentage: 9.8 },
];

// Regional breakdown
export const regionalBreakdown = [
  { region: 'us-east-1', cost: 2456.78, requests: 98000, percentage: 64.1 },
  { region: 'us-west-2', cost: 890.45, requests: 35000, percentage: 23.2 },
  { region: 'eu-west-1', cost: 345.67, requests: 12000, tokens: 9.0 },
  { region: 'ap-northeast-1', cost: 142.89, requests: 5600, percentage: 3.7 },
];

// Products metrics
export const bedrockMetrics = {
  totalSpend: bedrockModels.reduce((sum, m) => sum + m.cost, 0),
  totalRequests: bedrockModels.reduce((sum, m) => sum + m.requests, 0),
  totalTokens: bedrockModels.reduce((sum, m) => sum + m.tokens, 0),
  avgLatency: Math.round(bedrockModels.reduce((sum, m) => sum + m.avgLatencyMs, 0) / bedrockModels.length),
  activeModels: bedrockModels.filter(m => m.status === 'active').length,
  crossRegionCalls: 12340,
};

export const sagemakerMetrics = {
  totalEndpoints: sagemakerEndpoints.length,
  activeEndpoints: sagemakerEndpoints.filter(e => e.status === 'InService').length,
  totalCostPerHour: sagemakerEndpoints.reduce((sum, e) => sum + e.costPerHour, 0),
  totalRequestsPerHour: sagemakerEndpoints.reduce((sum, e) => sum + e.requestsPerHour, 0),
  customModels: sagemakerEndpoints.length,
};

// Generate daily trend data
export function generateBedrockDailyTrend(days: number = 30) {
  return Array.from({ length: days }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (days - 1 - i));
    return {
      date: date.toISOString().split('T')[0],
      cost: 100 + Math.random() * 150 + (i * 2),
      requests: 5000 + Math.floor(Math.random() * 3000) + (i * 100),
      tokens: 2000000 + Math.floor(Math.random() * 1000000),
    };
  });
}

export const bedrockDailyTrend = generateBedrockDailyTrend(30);
