// Mock data for Caching
export interface CacheEntry {
  id: string;
  promptHash: string;
  model: string;
  createdAt: string;
  lastHitAt: string;
  hitCount: number;
  tokensSaved: number;
  costSaved: number;
  ttlSeconds: number;
  expiresAt: string;
  size: number;
  tags: string[];
}

export interface CacheMetrics {
  totalEntries: number;
  totalHits: number;
  totalMisses: number;
  hitRate: number;
  totalTokensSaved: number;
  totalCostSaved: number;
  avgTTL: number;
  cacheSize: number;
  maxCacheSize: number;
}

export interface CacheConfig {
  enabled: boolean;
  defaultTTL: number;
  maxCacheSize: number;
  evictionPolicy: 'lru' | 'lfu' | 'ttl';
  semanticCaching: boolean;
  similarityThreshold: number;
  excludedModels: string[];
  excludedTags: string[];
}

const models = ['gpt-4', 'gpt-4o', 'gpt-3.5-turbo', 'claude-3-sonnet', 'claude-3-haiku', 'bedrock/claude-3-sonnet'];

function generateCacheEntries(count: number): CacheEntry[] {
  const entries: CacheEntry[] = [];

  for (let i = 0; i < count; i++) {
    const model = models[Math.floor(Math.random() * models.length)];
    const createdAt = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000);
    const ttl = [300, 600, 1800, 3600, 7200, 86400][Math.floor(Math.random() * 6)];
    const expiresAt = new Date(createdAt.getTime() + ttl * 1000);
    const hitCount = Math.floor(Math.random() * 100) + 1;
    const tokensPerHit = Math.floor(Math.random() * 500) + 100;

    let costPerToken = 0.00003;
    if (model.includes('gpt-3.5')) costPerToken = 0.0000015;
    else if (model.includes('haiku')) costPerToken = 0.00000025;
    else if (model.includes('claude-3-sonnet')) costPerToken = 0.000003;

    entries.push({
      id: `cache-${i + 1}`,
      promptHash: Math.random().toString(36).substring(2, 18),
      model,
      createdAt: createdAt.toISOString(),
      lastHitAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
      hitCount,
      tokensSaved: hitCount * tokensPerHit,
      costSaved: hitCount * tokensPerHit * costPerToken,
      ttlSeconds: ttl,
      expiresAt: expiresAt.toISOString(),
      size: Math.floor(Math.random() * 5000) + 500,
      tags: ['production', 'chatbot', 'backend', 'api'][Math.floor(Math.random() * 4)] ?
        [['production', 'chatbot', 'backend', 'api'][Math.floor(Math.random() * 4)]] : [],
    });
  }

  return entries.sort((a, b) => b.hitCount - a.hitCount);
}

export const cacheEntries = generateCacheEntries(100);

// Calculate metrics
const totalHits = cacheEntries.reduce((sum, e) => sum + e.hitCount, 0);
const totalRequests = totalHits + Math.floor(totalHits * 0.35); // ~74% hit rate

export const cacheMetrics: CacheMetrics = {
  totalEntries: cacheEntries.length,
  totalHits,
  totalMisses: totalRequests - totalHits,
  hitRate: (totalHits / totalRequests) * 100,
  totalTokensSaved: cacheEntries.reduce((sum, e) => sum + e.tokensSaved, 0),
  totalCostSaved: cacheEntries.reduce((sum, e) => sum + e.costSaved, 0),
  avgTTL: Math.round(cacheEntries.reduce((sum, e) => sum + e.ttlSeconds, 0) / cacheEntries.length),
  cacheSize: cacheEntries.reduce((sum, e) => sum + e.size, 0),
  maxCacheSize: 100 * 1024 * 1024, // 100MB
};

export const cacheConfig: CacheConfig = {
  enabled: true,
  defaultTTL: 3600,
  maxCacheSize: 100 * 1024 * 1024,
  evictionPolicy: 'lru',
  semanticCaching: true,
  similarityThreshold: 0.95,
  excludedModels: [],
  excludedTags: ['development', 'testing'],
};

// Cache hits over time (last 24 hours, hourly)
export function generateCacheHitsTrend(hours: number = 24) {
  return Array.from({ length: hours }, (_, i) => {
    const date = new Date();
    date.setHours(date.getHours() - (hours - 1 - i), 0, 0, 0);
    const baseHits = 200 + Math.floor(Math.random() * 100);
    const baseMisses = 50 + Math.floor(Math.random() * 50);

    return {
      hour: date.toISOString(),
      hits: baseHits + Math.floor(i * 5),
      misses: baseMisses + Math.floor(Math.random() * 20),
      hitRate: ((baseHits + i * 5) / (baseHits + i * 5 + baseMisses + Math.random() * 20)) * 100,
    };
  });
}

export const cacheHitsTrend = generateCacheHitsTrend(24);

// Cache by model
export const cacheByModel = models.map(model => {
  const modelEntries = cacheEntries.filter(e => e.model === model);
  return {
    model,
    entries: modelEntries.length,
    hits: modelEntries.reduce((sum, e) => sum + e.hitCount, 0),
    tokensSaved: modelEntries.reduce((sum, e) => sum + e.tokensSaved, 0),
    costSaved: modelEntries.reduce((sum, e) => sum + e.costSaved, 0),
  };
}).sort((a, b) => b.costSaved - a.costSaved);

// Daily cache savings (last 30 days)
export function generateDailyCacheSavings(days: number = 30) {
  return Array.from({ length: days }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (days - 1 - i));
    const baseSavings = 50 + Math.random() * 30;
    const variation = Math.sin(i / 7 * Math.PI) * 20;

    return {
      date: date.toISOString().split('T')[0],
      tokensSaved: Math.floor((baseSavings + variation) * 10000),
      costSaved: Math.round((baseSavings + variation) * 100) / 100,
      hitRate: 70 + Math.random() * 10,
    };
  });
}

export const dailyCacheSavings = generateDailyCacheSavings(30);

// Top cached prompts
export const topCachedPrompts = cacheEntries.slice(0, 10).map(e => ({
  hash: e.promptHash,
  model: e.model,
  hitCount: e.hitCount,
  tokensSaved: e.tokensSaved,
  costSaved: e.costSaved,
  lastHit: e.lastHitAt,
}));

// Cache utilization
export const cacheUtilization = {
  used: cacheMetrics.cacheSize,
  available: cacheMetrics.maxCacheSize - cacheMetrics.cacheSize,
  percentUsed: (cacheMetrics.cacheSize / cacheMetrics.maxCacheSize) * 100,
};
