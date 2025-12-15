// Mock data for models - matching mockup Model/Application View

export const models = [
  {
    id: 'gpt-4',
    name: 'GPT-4 Family',
    provider: 'OpenAI',
    totalSpend: 14230.5,
    percentage: 76,
    successRate: 95.2,
    avgLatency: 2800,
    cacheHitRate: 21.4,
    totalRequests: 142305,
  },
  {
    id: 'claude-3-sonnet',
    name: 'Claude 3 Sonnet',
    provider: 'Anthropic',
    totalSpend: 2812.75,
    percentage: 15,
    successRate: 97.8,
    avgLatency: 1850,
    cacheHitRate: 28.5,
    totalRequests: 48234,
  },
  {
    id: 'llama-3-70b',
    name: 'Llama 3 70B',
    provider: 'Meta',
    totalSpend: 1248.5,
    percentage: 6.7,
    successRate: 96.4,
    avgLatency: 1200,
    cacheHitRate: 32.1,
    totalRequests: 28456,
  },
  {
    id: 'gemini-pro',
    name: 'Gemini Pro',
    provider: 'Google',
    totalSpend: 453.5,
    percentage: 2.3,
    successRate: 98.1,
    avgLatency: 1650,
    cacheHitRate: 25.8,
    totalRequests: 12430,
  },
];

export function getModelById(modelId: string) {
  return models.find(m => m.id === modelId);
}

// Generate success vs failed data for model
export function generateModelSuccessData(modelId: string) {
  const model = getModelById(modelId);
  const avgDaily = model ? model.totalRequests / 30 : 5000;

  const data = [];
  const baseDate = new Date();
  baseDate.setDate(baseDate.getDate() - 14);

  for (let i = 0; i < 14; i++) {
    const date = new Date(baseDate);
    date.setDate(date.getDate() + i);

    const total = Math.round(avgDaily * (0.8 + Math.random() * 0.4));
    const successRate = model ? model.successRate / 100 : 0.95;
    const success = Math.round(total * successRate);
    const failed = total - success;

    data.push({
      date: date.toISOString().split('T')[0],
      success,
      failed,
    });
  }

  return data;
}

// Generate requests per day for model
export function generateModelRequestsData(modelId: string) {
  const model = getModelById(modelId);
  const avgDaily = model ? model.totalRequests / 30 : 5000;

  const data = [];
  const baseDate = new Date();
  baseDate.setDate(baseDate.getDate() - 7);

  for (let i = 0; i < 7; i++) {
    const date = new Date(baseDate);
    date.setDate(date.getDate() + i);

    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const multiplier = isWeekend ? 0.5 : 1 + Math.random() * 0.5;

    data.push({
      date: date.toISOString().split('T')[0],
      requests: Math.round(avgDaily * multiplier),
      spend: Math.round((model?.totalSpend || 500) / 30 * multiplier * 100) / 100,
    });
  }

  return data;
}
