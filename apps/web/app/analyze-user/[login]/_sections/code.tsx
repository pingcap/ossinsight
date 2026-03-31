'use client';

import { ScrollspySectionWrapper } from '@/components/Scrollspy/SectionWrapper';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { AnalyzeOwnerContext } from '@/components/Context/Analyze/AnalyzeOwner';
import * as React from 'react';
import { useMemo } from 'react';
import PersonalChart from '../_charts/ChartWrapper';
import { green, lightGreen, purple, redColors } from '../_charts/colors';
import { createTimeSeriesOption } from '../_charts/createChartOption';
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
    <ScrollspySectionWrapper anchor="code" className="pt-8 pb-8">
      <SectionHeading>Code</SectionHeading>
      <div id="pushes-and-commits">
        <CodeSubmitHistory userId={userId} />
      </div>
      <div id="pull-requests">
        <PullRequestHistory userId={userId} />
      </div>
      <PullRequestSize userId={userId} />
      <LineOfCodes userId={userId} />
    </ScrollspySectionWrapper>
  );
}

function CodeSubmitHistory ({ userId }: { userId: number }) {
  const { data, sql, queryName, loading } = usePersonalData('personal-pushes-and-commits', userId);
  const option = useMemo(() => createTimeSeriesOption([
    { type: 'bar' as const, data: (data ?? []).map(r => [r.event_month, r.pushes]), name: 'push', color: green, barMaxWidth: 10 },
    { type: 'bar' as const, data: (data ?? []).map(r => [r.event_month, r.commits]), name: 'commit', color: lightGreen, barMaxWidth: 10 },
  ]), [data]);

  const queryParams = useMemo(() => ({ userId }), [userId]);

  return <PersonalChart title="Code Submit History" option={option} loading={loading} noData={!loading && (!data || data.length === 0)} sql={sql} queryName={queryName} queryParams={queryParams} />;
}

function PullRequestHistory ({ userId }: { userId: number }) {
  const { data, sql, queryName, loading } = usePersonalData('personal-pull-request-action-history', userId);
  const sorted = useMemo(() => [...(data ?? [])].sort((a, b) => String(a.event_month).localeCompare(String(b.event_month))), [data]);
  const option = useMemo(() => createTimeSeriesOption([
    { type: 'line' as const, data: sorted.map(r => [r.event_month, r.opened_prs]), name: 'Opened PRs', color: green, areaStyle: { opacity: 0.15 }, symbolSize: 0, lineStyle: { width: 1 } },
    { type: 'line' as const, data: sorted.map(r => [r.event_month, r.merged_prs]), name: 'Merged PRs', color: purple, areaStyle: { opacity: 0.15 }, symbolSize: 0, lineStyle: { width: 1 } },
  ]), [sorted]);

  const queryParams = useMemo(() => ({ userId }), [userId]);

  return <PersonalChart title="Pull Request History" option={option} loading={loading} noData={!loading && (!data || data.length === 0)} sql={sql} queryName={queryName} queryParams={queryParams} />;
}

function PullRequestSize ({ userId }: { userId: number }) {
  const { data, sql, queryName, loading } = usePersonalData('personal-pull-request-size-history', userId);
  const option = useMemo(() => createTimeSeriesOption(sizes.map((size, i) => ({
    type: 'bar' as const,
    data: (data ?? []).map(r => [r.event_month, (r as any)[size.name]]),
    name: `${size.name} (${size.description})`,
    stack: 'total',
    color: redColors.slice(0, 6)[i],
  }))), [data]);

  const queryParams = useMemo(() => ({ userId }), [userId]);

  return <PersonalChart title="Pull Request Size" option={option} loading={loading} noData={!loading && (!data || data.length === 0)} sql={sql} queryName={queryName} queryParams={queryParams} />;
}

function LineOfCodes ({ userId }: { userId: number }) {
  const { data, sql, queryName, loading } = usePersonalData('personal-pull-request-code-changes-history', userId);
  const option = useMemo(() => createTimeSeriesOption([
    { type: 'line' as const, data: (data ?? []).map(r => [r.event_month, r.additions]), name: 'Additions', color: '#57ab5a', areaStyle: {}, symbolSize: 0, lineStyle: { width: 0 } },
    { type: 'line' as const, data: (data ?? []).map(r => [r.event_month, -r.deletions]), name: 'Deletions', color: '#e5534b', areaStyle: {}, symbolSize: 0, lineStyle: { width: 0 } },
  ]), [data]);

  const queryParams = useMemo(() => ({ userId }), [userId]);

  return <PersonalChart title="Lines of changes in PRs" option={option} loading={loading} noData={!loading && (!data || data.length === 0)} sql={sql} queryName={queryName} queryParams={queryParams} />;
}
