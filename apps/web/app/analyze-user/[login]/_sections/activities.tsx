'use client';

import { ScrollspySectionWrapper } from '@/components/Scrollspy/SectionWrapper';
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
    <ScrollspySectionWrapper anchor="activities" className="pt-8 pb-8">
      <h2 className="text-[22px] font-semibold text-[#e9eaee] pb-4" style={{ scrollMarginTop: '140px' }}>Contribution Activities</h2>
      <p className="text-sm text-[#8c8c8c] mb-4">All personal activities happened on all public repositories in GitHub since 2011. You can check each specific activity type by type with a timeline.</p>
      <ActivityChart userId={userId} />
    </ScrollspySectionWrapper>
  );
}

function ActivityChart ({ userId }: { userId: number }) {
  const [type, setType] = useState<ContributionActivityType>('all');
  const [period, setPeriod] = useState<ContributionActivityRange>('last_28_days');

  const { data, sql, queryName, loading } = usePersonalContributionActivities(userId, type, period);
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
    legend: { type: 'scroll' as const, orient: 'horizontal' as const, top: 8, textStyle: { color: '#aaa' } },
    grid: { top: 40, left: 8, right: 8, bottom: 8, containLabel: true },
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

  const queryParams = useMemo(() => ({ userId }), [userId]);
  const chartHeight = 240 + 30 * repoNames.length;

  return (
    <div>
      <div className="flex flex-wrap gap-6 mb-4">
        <div className="flex gap-1 border-b border-[#3a3a3a]">
          {contributionActivityTypes.map(({ key, label }) => (
            <button
              key={key}
              className={`px-3 py-2 text-sm transition-colors ${
                type === key
                  ? 'border-b-2 border-[var(--color-primary)] text-white'
                  : 'text-[#8c8c8c] hover:text-[#d8d8d8]'
              }`}
              onClick={() => setType(key)}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex gap-1 border-b border-[#3a3a3a]">
          {contributionActivityRanges.map(({ key, label }) => (
            <button
              key={key}
              className={`px-3 py-2 text-sm transition-colors ${
                period === key
                  ? 'border-b-2 border-[var(--color-primary)] text-white'
                  : 'text-[#8c8c8c] hover:text-[#d8d8d8]'
              }`}
              onClick={() => setPeriod(key)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <PersonalChart title={title} option={option} height={chartHeight} loading={loading} noData={!loading && (!data || data.length === 0)} sql={sql} queryName={queryName} queryParams={queryParams} />
    </div>
  );
}
