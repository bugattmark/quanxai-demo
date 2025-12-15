// Mock data for Tag Management
export interface Tag {
  id: string;
  name: string;
  description: string | null;
  color: string;
  keysCount: number;
  requestsCount: number;
  totalSpend: number;
  createdAt: string;
  updatedAt: string;
}

export interface TagUsage {
  tagId: string;
  tagName: string;
  date: string;
  requests: number;
  tokens: number;
  cost: number;
}

export const tags: Tag[] = [
  {
    id: 'tag-1',
    name: 'production',
    description: 'Production environment workloads',
    color: '#10B981',
    keysCount: 5,
    requestsCount: 145000,
    totalSpend: 12456.78,
    createdAt: '2024-06-01T00:00:00Z',
    updatedAt: '2024-12-14T12:00:00Z',
  },
  {
    id: 'tag-2',
    name: 'development',
    description: 'Development and testing environment',
    color: '#3B82F6',
    keysCount: 8,
    requestsCount: 23000,
    totalSpend: 890.45,
    createdAt: '2024-06-01T00:00:00Z',
    updatedAt: '2024-12-14T10:00:00Z',
  },
  {
    id: 'tag-3',
    name: 'ml-experiments',
    description: 'Machine learning experiments and research',
    color: '#8B5CF6',
    keysCount: 3,
    requestsCount: 67000,
    totalSpend: 8756.23,
    createdAt: '2024-07-15T00:00:00Z',
    updatedAt: '2024-12-14T11:00:00Z',
  },
  {
    id: 'tag-4',
    name: 'chatbot',
    description: 'Customer-facing chatbot applications',
    color: '#F59E0B',
    keysCount: 2,
    requestsCount: 89000,
    totalSpend: 3456.78,
    createdAt: '2024-08-01T00:00:00Z',
    updatedAt: '2024-12-14T09:00:00Z',
  },
  {
    id: 'tag-5',
    name: 'backend',
    description: 'Backend API integrations',
    color: '#EF4444',
    keysCount: 4,
    requestsCount: 56000,
    totalSpend: 4567.89,
    createdAt: '2024-08-15T00:00:00Z',
    updatedAt: '2024-12-14T08:00:00Z',
  },
  {
    id: 'tag-6',
    name: 'mobile',
    description: 'Mobile application features',
    color: '#06B6D4',
    keysCount: 2,
    requestsCount: 34000,
    totalSpend: 2890.12,
    createdAt: '2024-09-01T00:00:00Z',
    updatedAt: '2024-12-14T07:00:00Z',
  },
  {
    id: 'tag-7',
    name: 'research',
    description: 'Research and exploration projects',
    color: '#EC4899',
    keysCount: 2,
    requestsCount: 12000,
    totalSpend: 2345.67,
    createdAt: '2024-09-15T00:00:00Z',
    updatedAt: '2024-12-14T06:00:00Z',
  },
  {
    id: 'tag-8',
    name: 'qa',
    description: 'Quality assurance testing',
    color: '#14B8A6',
    keysCount: 3,
    requestsCount: 8000,
    totalSpend: 456.78,
    createdAt: '2024-10-01T00:00:00Z',
    updatedAt: '2024-12-14T05:00:00Z',
  },
  {
    id: 'tag-9',
    name: 'legacy',
    description: 'Legacy system integrations',
    color: '#6B7280',
    keysCount: 1,
    requestsCount: 2000,
    totalSpend: 98.50,
    createdAt: '2024-06-01T00:00:00Z',
    updatedAt: '2024-10-15T00:00:00Z',
  },
  {
    id: 'tag-10',
    name: 'aws',
    description: 'AWS Bedrock specific workloads',
    color: '#FF9900',
    keysCount: 2,
    requestsCount: 45000,
    totalSpend: 3986.59,
    createdAt: '2024-11-01T00:00:00Z',
    updatedAt: '2024-12-14T04:00:00Z',
  },
  {
    id: 'tag-11',
    name: 'bedrock',
    description: 'AWS Bedrock model usage',
    color: '#FF9900',
    keysCount: 2,
    requestsCount: 42000,
    totalSpend: 3786.59,
    createdAt: '2024-11-15T00:00:00Z',
    updatedAt: '2024-12-14T03:00:00Z',
  },
  {
    id: 'tag-12',
    name: 'testing',
    description: 'Test keys and environments',
    color: '#A855F7',
    keysCount: 4,
    requestsCount: 5000,
    totalSpend: 234.56,
    createdAt: '2024-11-20T00:00:00Z',
    updatedAt: '2024-12-14T02:00:00Z',
  },
];

// Tag metrics
export const tagMetrics = {
  totalTags: tags.length,
  totalTaggedRequests: tags.reduce((sum, t) => sum + t.requestsCount, 0),
  totalTaggedSpend: tags.reduce((sum, t) => sum + t.totalSpend, 0),
  mostUsedTag: tags.reduce((max, t) => t.requestsCount > max.requestsCount ? t : max, tags[0]),
  highestSpendTag: tags.reduce((max, t) => t.totalSpend > max.totalSpend ? t : max, tags[0]),
};

// Generate tag usage over time
export function generateTagUsage(days: number = 30): TagUsage[] {
  const usage: TagUsage[] = [];

  tags.slice(0, 5).forEach(tag => {
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (days - 1 - i));
      const baseRequests = tag.requestsCount / 30;
      const variation = Math.random() * 0.4 - 0.2;
      const requests = Math.floor(baseRequests * (1 + variation));
      const tokens = requests * (Math.floor(Math.random() * 500) + 200);
      const cost = (tag.totalSpend / 30) * (1 + variation);

      usage.push({
        tagId: tag.id,
        tagName: tag.name,
        date: date.toISOString().split('T')[0],
        requests,
        tokens,
        cost: Math.round(cost * 100) / 100,
      });
    }
  });

  return usage;
}

export const tagUsageOverTime = generateTagUsage(30);

// Spend by tag (for pie chart)
export const spendByTag = tags.map(t => ({
  name: t.name,
  value: t.totalSpend,
  color: t.color,
})).sort((a, b) => b.value - a.value);

// Requests by tag (for bar chart)
export const requestsByTag = tags.map(t => ({
  name: t.name,
  requests: t.requestsCount,
  color: t.color,
})).sort((a, b) => b.requests - a.requests);

// Available colors for new tags
export const availableColors = [
  '#3B82F6', // blue
  '#10B981', // emerald
  '#F59E0B', // amber
  '#EF4444', // red
  '#8B5CF6', // violet
  '#EC4899', // pink
  '#06B6D4', // cyan
  '#14B8A6', // teal
  '#6366F1', // indigo
  '#84CC16', // lime
  '#F97316', // orange
  '#6B7280', // gray
];
