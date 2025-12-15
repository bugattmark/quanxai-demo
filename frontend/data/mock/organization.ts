// Mock data for organization dashboard - matching mockup exactly

export const organizationMetrics = {
  totalSpend: 18745.25,
  totalRequests: 283425,
  tokensProcessed: 185200000, // 185.2M
  avgCostPerRequest: 0.0904,
  successRate: 94.3,
  avgLatencyMs: 4800,
};

export const costByModel = [
  { name: 'GPT-4', value: 14230.5, percentage: 76 },
  { name: 'Claude-3', value: 2812.75, percentage: 15 },
  { name: 'Llama-3', value: 1248.5, percentage: 6.7 },
  { name: 'Others', value: 453.5, percentage: 2.3 },
];

// Generate 30 days of spend trend data
export const spendTrendData = (() => {
  const data = [];
  const baseDate = new Date();
  baseDate.setDate(baseDate.getDate() - 30);

  // Create realistic spend curve that reaches ~$18,745 total
  const dailyBase = 500;
  let cumulativeSpend = 0;

  for (let i = 0; i < 30; i++) {
    const date = new Date(baseDate);
    date.setDate(date.getDate() + i);

    // Weekday/weekend variation
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const multiplier = isWeekend ? 0.6 : 1.2;

    // Add some randomness and upward trend
    const dailySpend = dailyBase * multiplier * (1 + Math.random() * 0.3) + (i * 5);

    cumulativeSpend += dailySpend;

    data.push({
      date: date.toISOString().split('T')[0],
      spend: Math.round(dailySpend * 100) / 100,
    });
  }

  return data;
})();

// Normalize to match target total
const currentTotal = spendTrendData.reduce((sum, d) => sum + d.spend, 0);
const scaleFactor = 18745.25 / currentTotal;
spendTrendData.forEach(d => {
  d.spend = Math.round(d.spend * scaleFactor * 100) / 100;
});
