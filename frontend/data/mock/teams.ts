// Mock data for teams - matching mockup Team View

export const teams = [
  {
    id: 'team-1',
    name: 'Engineering - AI Platform Team',
    description: 'Core AI infrastructure and platform development',
    memberCount: 8,
    budget: 5000,
    totalSpend: 4256.8,
    successRate: 96.8,
    tokenEfficiency: 1315,
    activeMembers: 12,
  },
  {
    id: 'team-2',
    name: 'Data Science',
    description: 'ML research and model development',
    memberCount: 5,
    budget: 8000,
    totalSpend: 5245.32,
    successRate: 97.2,
    tokenEfficiency: 1280,
    activeMembers: 8,
  },
  {
    id: 'team-3',
    name: 'Product Engineering',
    description: 'Customer-facing AI features',
    memberCount: 6,
    budget: 3000,
    totalSpend: 3372.45,
    successRate: 98.5,
    tokenEfficiency: 1420,
    activeMembers: 10,
  },
  {
    id: 'team-4',
    name: 'DevOps & Infrastructure',
    description: 'Platform reliability and automation',
    memberCount: 4,
    budget: 2000,
    totalSpend: 2248.68,
    successRate: 95.3,
    tokenEfficiency: 1180,
    activeMembers: 6,
  },
  {
    id: 'team-5',
    name: 'Customer Success',
    description: 'Customer support AI tools',
    memberCount: 3,
    budget: 1500,
    totalSpend: 1622.0,
    successRate: 99.1,
    tokenEfficiency: 1550,
    activeMembers: 4,
  },
];

export function getTeamById(teamId: string) {
  return teams.find(t => t.id === teamId);
}

// Generate daily spend data for team (7 days)
export function generateTeamDailySpend(teamId: string) {
  const team = getTeamById(teamId);
  const avgDaily = team ? team.totalSpend / 7 : 600;

  const data = [];
  const baseDate = new Date();
  baseDate.setDate(baseDate.getDate() - 7);

  for (let i = 0; i < 7; i++) {
    const date = new Date(baseDate);
    date.setDate(date.getDate() + i);

    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const multiplier = isWeekend ? 0.5 : 1 + Math.random() * 0.4;

    data.push({
      date: date.toISOString().split('T')[0],
      spend: Math.round(avgDaily * multiplier * 100) / 100,
      requests: Math.round(5000 * multiplier),
    });
  }

  return data;
}

// Generate cache metrics for team
export function generateTeamCacheMetrics(teamId: string) {
  const data = [];
  const baseDate = new Date();
  baseDate.setDate(baseDate.getDate() - 14);

  for (let i = 0; i < 14; i++) {
    const date = new Date(baseDate);
    date.setDate(date.getDate() + i);

    data.push({
      date: date.toISOString().split('T')[0],
      cache_read: Math.round(Math.random() * 5000),
      cache_creation: Math.round(Math.random() * 1000),
    });
  }

  return data;
}
