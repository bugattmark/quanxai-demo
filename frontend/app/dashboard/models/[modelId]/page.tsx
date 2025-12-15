'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import KPICard from '@/components/ui/KPICard';
import ChartCard from '@/components/ui/ChartCard';
import DateRangeSelector from '@/components/ui/DateRangeSelector';
import SuccessFailedChart from '@/components/charts/SuccessFailedChart';
import DailyBarChart from '@/components/charts/DailyBarChart';
import { formatCurrency, formatPercent, formatLatency } from '@/lib/utils/formatters';
import { models, getModelById, generateModelSuccessData, generateModelRequestsData } from '@/data/mock/models';
import { DollarSign, CheckCircle, Clock, Zap } from 'lucide-react';

export default function ModelDashboard() {
  const params = useParams();
  const modelId = params.modelId as string;
  const [dateRange, setDateRange] = useState<'last7days' | 'last30days' | 'last90days'>('last30days');

  const model = getModelById(modelId) || models[0];
  const successData = generateModelSuccessData(modelId);
  const requestsData = generateModelRequestsData(modelId);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Model Analytics: {model.name}</h1>
          <p className="text-sm text-gray-500 mt-1">
            Deep dive into performance, cost and usage.
          </p>
        </div>
        <DateRangeSelector value={dateRange} onChange={setDateRange} />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KPICard
          title="Total Spend"
          value={formatCurrency(model.totalSpend)}
          icon={<DollarSign className="w-4 h-4" />}
          subtitle={`$${(model.totalSpend / model.totalRequests).toFixed(2)} avg cost/req`}
        />
        <KPICard
          title="Success Rate"
          value={formatPercent(model.successRate)}
          icon={<CheckCircle className="w-4 h-4" />}
          subtitle={`${model.totalRequests.toLocaleString()} requests`}
        />
        <KPICard
          title="Avg Latency"
          value={formatLatency(model.avgLatency)}
          icon={<Clock className="w-4 h-4" />}
          subtitle="P95: 5.4s"
        />
        <KPICard
          title="Cache Hit Rate"
          value={formatPercent(model.cacheHitRate)}
          icon={<Zap className="w-4 h-4" />}
          subtitle="Score: 87/100"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Success vs Failed Requests */}
        <ChartCard
          title="Success vs Failed Requests"
        >
          <SuccessFailedChart data={successData} height={280} />
        </ChartCard>

        {/* Requests per Day */}
        <ChartCard
          title="Requests per day"
        >
          <DailyBarChart data={requestsData} height={280} />
        </ChartCard>
      </div>
    </div>
  );
}
