'use client';

import SectionTemplate from '@/components/Analyze/Section';
import { AnalyzeOwnerContext } from '@/components/Context/Analyze/AnalyzeOwner';
import * as React from 'react';
import { useMemo } from 'react';
import PersonalChart from '../_charts/ChartWrapper';
import { green, lightGreen, purple, redColors } from '../_charts/colors';
import { usePersonalData } from '../_hooks/usePersonal';

const sizes = [
  { name: 'xxl', description: '1000+ lines' },
  { name: 'xl', description: '500-999 lines' },
  { name: 'l', description: '100-499 lines' },
  { name: 'm', description: '30-99 lines' },
  { name: 's', description: '10-29 lines' },
  { name: 'xs', description: '0-9 lines' },
];

export default function CodeSection () {
  const { id: userId } = React.useContext(AnalyzeOwnerContext);

  return (
    <SectionTemplate id="code" title="Code" level={2} className="pt-8"
      description="All contributions measured with code related events since 2011."
    >
      <CodeSubmitHistory userId={userId} />
      <PullRequestHistory userId={userId} />
      <PullRequestSize userId={userId} />
      <LineOfCodes userId={userId} />
    </SectionTemplate>
  );
}

function CodeSubmitHistory ({ userId }: { userId: number }) {
  const { data, loading } = usePersonalData('personal-pushes-and-commits', userId);
  const option = useMemo(() => ({
    xAxis: { type: 'time' as const, min: '2011-01-01' },
    yAxis: { type: 'value' as const },
    series: [
      { type: 'bar' as const, data: (data ?? []).map(r => [r.event_month, r.pushes]), name: 'push', color: green, barMaxWidth: 10 },
      { type: 'bar' as const, data: (data ?? []).map(r => [r.event_month, r.commits]), name: 'commit', color: lightGreen, barMaxWidth: 10 },
    ],
  }), [data]);

  return <PersonalChart title="Code Submit History" option={option} loading={loading} noData={!loading && (!data || data.length === 0)} />;
}

function PullRequestHistory ({ userId }: { userId: number }) {
  const { data, loading } = usePersonalData('personal-pull-request-action-history', userId);
  const sorted = useMemo(() => [...(data ?? [])].sort((a, b) => String(a.event_month).localeCompare(String(b.event_month))), [data]);
  const option = useMemo(() => ({
    xAxis: { type: 'time' as const, min: '2011-01-01' },
    yAxis: { type: 'value' as const },
    series: [
      { type: 'line' as const, data: sorted.map(r => [r.event_month, r.opened_prs]), name: 'Opened PRs', color: green, areaStyle: { opacity: 0.15 }, symbolSize: 0, lineStyle: { width: 1 } },
      { type: 'line' as const, data: sorted.map(r => [r.event_month, r.merged_prs]), name: 'Merged PRs', color: purple, areaStyle: { opacity: 0.15 }, symbolSize: 0, lineStyle: { width: 1 } },
    ],
  }), [sorted]);

  return <PersonalChart title="Pull Request History" option={option} loading={loading} noData={!loading && (!data || data.length === 0)} />;
}

function PullRequestSize ({ userId }: { userId: number }) {
  const { data, loading } = usePersonalData('personal-pull-request-size-history', userId);
  const option = useMemo(() => ({
    xAxis: { type: 'time' as const, min: '2011-01-01' },
    yAxis: { type: 'value' as const },
    series: sizes.map((size, i) => ({
      type: 'bar' as const,
      data: (data ?? []).map(r => [r.event_month, (r as any)[size.name]]),
      name: `${size.name} (${size.description})`,
      stack: 'total',
      color: redColors.slice(0, 6)[i],
    })),
  }), [data]);

  return <PersonalChart title="Pull Request Size" option={option} loading={loading} noData={!loading && (!data || data.length === 0)} />;
}

function LineOfCodes ({ userId }: { userId: number }) {
  const { data, loading } = usePersonalData('personal-pull-request-code-changes-history', userId);
  const option = useMemo(() => ({
    xAxis: { type: 'time' as const, min: '2011-01-01' },
    yAxis: { type: 'value' as const },
    series: [
      { type: 'line' as const, data: (data ?? []).map(r => [r.event_month, r.additions]), name: 'Additions', color: '#57ab5a', areaStyle: {}, symbolSize: 0, lineStyle: { width: 0 } },
      { type: 'line' as const, data: (data ?? []).map(r => [r.event_month, -r.deletions]), name: 'Deletions', color: '#e5534b', areaStyle: {}, symbolSize: 0, lineStyle: { width: 0 } },
    ],
  }), [data]);

  return <PersonalChart title="Lines of changes in PRs" option={option} loading={loading} noData={!loading && (!data || data.length === 0)} />;
}
