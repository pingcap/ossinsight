'use client';

import { ScrollspySectionWrapper } from '@/components/Scrollspy/SectionWrapper';
import { AnalyzeOwnerContext } from '@/components/Context/Analyze/AnalyzeOwner';
import * as React from 'react';
import { useMemo } from 'react';
import PersonalChart from '../_charts/ChartWrapper';
import { blue, lightBlue } from '../_charts/colors';
import { usePersonalData } from '../_hooks/usePersonal';

export default function IssueSection () {
  const { id: userId } = React.useContext(AnalyzeOwnerContext);

  return (
    <ScrollspySectionWrapper anchor="issue" className="pt-8 pb-8">
      <h2 className="text-[22px] font-semibold text-[#e9eaee] pb-4" style={{ scrollMarginTop: '140px' }}>Issue</h2>
      <p className="text-sm text-[#8c8c8c] mb-4">The history about the total number of issues and issue comments since 2011.</p>
      <IssueHistory userId={userId} />
    </ScrollspySectionWrapper>
  );
}

function IssueHistory ({ userId }: { userId: number }) {
  const { data, sql, queryName, loading } = usePersonalData('personal-issues-history', userId);
  const option = useMemo(() => ({
    xAxis: { type: 'time' as const, min: '2011-01-01' },
    yAxis: { type: 'value' as const },
    series: [
      { type: 'bar' as const, data: (data ?? []).map(r => [r.event_month, r.issues]), name: 'issue', color: blue, barMaxWidth: 10 },
      { type: 'bar' as const, data: (data ?? []).map(r => [r.event_month, r.issue_comments]), name: 'issue comments', color: lightBlue, barMaxWidth: 10 },
    ],
  }), [data]);

  const queryParams = useMemo(() => ({ userId }), [userId]);

  return <PersonalChart title="Issue History" option={option} loading={loading} noData={!loading && (!data || data.length === 0)} sql={sql} queryName={queryName} queryParams={queryParams} />;
}
