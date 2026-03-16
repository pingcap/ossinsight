'use client';

import SectionTemplate from '@/components/Analyze/Section';
import { AnalyzeOwnerContext } from '@/components/Context/Analyze/AnalyzeOwner';
import * as React from 'react';
import { useCallback, useMemo, useState } from 'react';
import PersonalChart from '../_charts/ChartWrapper';
import { primary } from '../_charts/colors';
import { useDimension } from '../_hooks/useDimension';
import {
  ContributionActivityRange,
  contributionActivityRanges,
  ContributionActivityType,
  contributionActivityTypes,
  usePersonalContributionActivities,
  useRange,
} from '../_hooks/usePersonal';

export default function ActivitiesSection () {
  const { id: userId } = React.useContext(AnalyzeOwnerContext);

  return (
    <SectionTemplate id="activities" title="Contribution Activities" level={2} className="pt-8"
      description="All personal activities happened on all public repositories in GitHub since 2011. You can check each specific activity type by type with a timeline."
    >
      <ActivityChart userId={userId} />
    </SectionTemplate>
  );
}

function ActivityChart ({ userId }: { userId: number }) {
  const [type, setType] = useState<ContributionActivityType>('all');
  const [period, setPeriod] = useState<ContributionActivityRange>('last_28_days');

  const { data, loading } = usePersonalContributionActivities(userId, type, period);
  const repoNames = useDimension(data ?? [], 'repo_name');

  const [min, max] = useRange(period);

  const typeString = useMemo(() => contributionActivityTypes.find(({ key }) => type === key)?.label, [type]);
  const periodString = useMemo(() => contributionActivityRanges.find(({ key }) => period === key)?.label, [period]);
  const title = `${typeString ?? ''} in ${periodString ?? ''}`;

  const tooltipFormatter = useCallback((params: any) => {
    const v = params.value ?? params.data;
    if (!v) return '';
    return `${v[0]} ${v[2]} ${typeString} on ${v[1]}`;
  }, [typeString]);

  const chartData = useMemo(() => (data ?? []).map(r => [r.event_period, r.repo_name, r.cnt]), [data]);

  const option = useMemo(() => ({
    legend: { type: 'scroll' as const, orient: 'horizontal' as const, top: 32, textStyle: { color: '#aaa' } },
    grid: { top: 64, left: 8, right: 8, bottom: 8, containLabel: true },
    tooltip: { trigger: 'item' as const },
    dataZoom: undefined as any,
    xAxis: { type: 'time' as const, min, max },
    yAxis: { type: 'category' as const, data: repoNames, axisTick: { show: false }, axisLine: { show: false }, triggerEvent: true },
    series: [{
      type: 'scatter' as const,
      data: chartData,
      symbolSize: (val: any) => Math.min((val?.[2] ?? 1) * 5, 60),
      tooltip: { formatter: tooltipFormatter },
      color: primary,
    }],
  }), [chartData, repoNames, min, max, tooltipFormatter]);

  const chartHeight = 240 + 30 * repoNames.length;

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-4">
        <label className="flex flex-col gap-1 text-xs text-[#8c8c8c]">
          Contribution type
          <select value={type} onChange={e => setType(e.target.value as ContributionActivityType)} className="rounded border border-[#363638] bg-[#2e2e2f] px-2 py-1 text-sm text-[#e0e0e0] outline-none focus:border-[#fbe593]">
            {contributionActivityTypes.map(({ key, label }) => <option key={key} value={key}>{label}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs text-[#8c8c8c]">
          Period
          <select value={period} onChange={e => setPeriod(e.target.value as ContributionActivityRange)} className="rounded border border-[#363638] bg-[#2e2e2f] px-2 py-1 text-sm text-[#e0e0e0] outline-none focus:border-[#fbe593]">
            {contributionActivityRanges.map(({ key, label }) => <option key={key} value={key}>{label}</option>)}
          </select>
        </label>
      </div>
      <PersonalChart title={title} option={option} height={chartHeight} loading={loading} noData={!loading && (!data || data.length === 0)} />
    </div>
  );
}
