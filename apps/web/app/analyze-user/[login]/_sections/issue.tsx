'use client';

import SectionTemplate from '@/components/Analyze/Section';
import { AnalyzeOwnerContext } from '@/components/Context/Analyze/AnalyzeOwner';
import * as React from 'react';
import { useMemo } from 'react';
import PersonalChart from '../_charts/ChartWrapper';
import { blue, lightBlue } from '../_charts/colors';
import { usePersonalData } from '../_hooks/usePersonal';

export default function IssueSection () {
  const { id: userId } = React.useContext(AnalyzeOwnerContext);

  return (
    <SectionTemplate id="issue" title="Issue" level={2} className="pt-8"
      description="The history about the total number of issues and issue comments since 2011."
    >
      <IssueHistory userId={userId} />
    </SectionTemplate>
  );
}

function IssueHistory ({ userId }: { userId: number }) {
  const { data, loading } = usePersonalData('personal-issues-history', userId);
  const option = useMemo(() => ({
    xAxis: { type: 'time' as const, min: '2011-01-01' },
    yAxis: { type: 'value' as const },
    series: [
      { type: 'bar' as const, data: (data ?? []).map(r => [r.event_month, r.issues]), name: 'issue', color: blue, barMaxWidth: 10 },
      { type: 'bar' as const, data: (data ?? []).map(r => [r.event_month, r.issue_comments]), name: 'issue comments', color: lightBlue, barMaxWidth: 10 },
    ],
  }), [data]);

  return <PersonalChart title="Issue History" option={option} loading={loading} noData={!loading && (!data || data.length === 0)} />;
}
