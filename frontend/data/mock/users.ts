// Mock data for users - matching mockup User View

export const users = [
  {
    id: 'user-1',
    name: 'Sarah Chen',
    email: 'sarah.chen@company.com',
    role: 'Senior ML Engineer',
    teamId: 'team-1',
    teamName: 'AI Platform Team',
    monthlySpend: 1240.5,
    costPerRequest: 0.1,
    successRate: 98.2,
    cacheHitRate: 24.5,
    totalRequests: 12405,
  },
  {
    id: 'user-2',
    name: 'Marcus Johnson',
    email: 'marcus.j@company.com',
    role: 'Staff Engineer',
    teamId: 'team-1',
    teamName: 'AI Platform Team',
    monthlySpend: 980.32,
    costPerRequest: 0.12,
    successRate: 97.8,
    cacheHitRate: 28.3,
    totalRequests: 8169,
  },
  {
    id: 'user-3',
    name: 'Emily Rodriguez',
    email: 'emily.r@company.com',
    role: 'Data Scientist',
    teamId: 'team-2',
    teamName: 'Data Science',
    monthlySpend: 1567.23,
    costPerRequest: 0.15,
    successRate: 96.5,
    cacheHitRate: 18.7,
    totalRequests: 10448,
  },
  {
    id: 'user-4',
    name: 'David Kim',
    email: 'david.kim@company.com',
    role: 'ML Engineer',
    teamId: 'team-2',
    teamName: 'Data Science',
    monthlySpend: 1423.89,
    costPerRequest: 0.11,
    successRate: 98.1,
    cacheHitRate: 22.4,
    totalRequests: 12944,
  },
  {
    id: 'user-5',
    name: 'Lisa Wang',
    email: 'lisa.w@company.com',
    role: 'Software Engineer',
    teamId: 'team-3',
    teamName: 'Product Engineering',
    monthlySpend: 567.45,
    costPerRequest: 0.08,
    successRate: 99.2,
    cacheHitRate: 32.1,
    totalRequests: 7093,
  },
  {
    id: 'user-6',
    name: 'James Wilson',
    email: 'james.w@company.com',
    role: 'Senior Developer',
    teamId: 'team-3',
    teamName: 'Product Engineering',
    monthlySpend: 423.12,
    costPerRequest: 0.09,
    successRate: 98.5,
    cacheHitRate: 29.8,
    totalRequests: 4701,
  },
  {
    id: 'user-7',
    name: 'Anna Kowalski',
    email: 'anna.k@company.com',
    role: 'DevOps Engineer',
    teamId: 'team-4',
    teamName: 'DevOps & Infrastructure',
    monthlySpend: 345.67,
    costPerRequest: 0.07,
    successRate: 97.3,
    cacheHitRate: 35.2,
    totalRequests: 4938,
  },
  {
    id: 'user-8',
    name: 'Michael Brown',
    email: 'michael.b@company.com',
    role: 'Platform Engineer',
    teamId: 'team-4',
    teamName: 'DevOps & Infrastructure',
    monthlySpend: 234.56,
    costPerRequest: 0.06,
    successRate: 96.8,
    cacheHitRate: 38.5,
    totalRequests: 3909,
  },
  {
    id: 'user-9',
    name: 'Sophie Martin',
    email: 'sophie.m@company.com',
    role: 'Support Engineer',
    teamId: 'team-5',
    teamName: 'Customer Success',
    monthlySpend: 89.34,
    costPerRequest: 0.05,
    successRate: 99.5,
    cacheHitRate: 42.1,
    totalRequests: 1787,
  },
  {
    id: 'user-10',
    name: 'Alex Thompson',
    email: 'alex.t@company.com',
    role: 'AI Specialist',
    teamId: 'team-1',
    teamName: 'AI Platform Team',
    monthlySpend: 2156.78,
    costPerRequest: 0.14,
    successRate: 97.5,
    cacheHitRate: 20.3,
    totalRequests: 15405,
  },
  {
    id: 'user-11',
    name: 'Rachel Lee',
    email: 'rachel.l@company.com',
    role: 'Junior Developer',
    teamId: 'team-3',
    teamName: 'Product Engineering',
    monthlySpend: 156.23,
    costPerRequest: 0.04,
    successRate: 98.9,
    cacheHitRate: 45.2,
    totalRequests: 3906,
  },
  {
    id: 'user-12',
    name: 'Daniel Garcia',
    email: 'daniel.g@company.com',
    role: 'Research Scientist',
    teamId: 'team-2',
    teamName: 'Data Science',
    monthlySpend: 1089.45,
    costPerRequest: 0.13,
    successRate: 96.2,
    cacheHitRate: 15.8,
    totalRequests: 8380,
  },
];

export function getUserById(userId: string) {
  return users.find(u => u.id === userId);
}

// Generate activity timeline for user (4 weeks)
export function generateUserActivity(userId: string) {
  const user = getUserById(userId);
  const weeklyAvg = user ? user.totalRequests / 4 : 3000;

  const data = [];
  const baseDate = new Date();
  baseDate.setDate(baseDate.getDate() - 28);

  for (let i = 0; i < 4; i++) {
    const weekStart = new Date(baseDate);
    weekStart.setDate(weekStart.getDate() + i * 7);

    const weekLabel = weekStart.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });

    data.push({
      week: weekLabel,
      requests: Math.round(weeklyAvg * (0.7 + Math.random() * 0.6)),
    });
  }

  return data;
}
