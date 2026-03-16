'use client';

import SectionTemplate from '@/components/Analyze/Section';
import { AnalyzeOwnerContext } from '@/components/Context/Analyze/AnalyzeOwner';
import * as React from 'react';
import { useMemo } from 'react';
import PersonalChart from '../_charts/ChartWrapper';
import { orange, primary } from '../_charts/colors';
import { usePersonalData } from '../_hooks/usePersonal';

export default function CodeReviewSection () {
  const { id: userId } = React.useContext(AnalyzeOwnerContext);

  return (
    <SectionTemplate id="code-review" title="Code Review" level={2} className="pt-8"
      description="The history about the number of code review times and comments in pull requests since 2011."
    >
      <CodeReviewHistory userId={userId} />
    </SectionTemplate>
  );
}

function CodeReviewHistory ({ userId }: { userId: number }) {
  const { data, loading } = usePersonalData('personal-pull-request-reviews-history', userId);
  const option = useMemo(() => ({
    xAxis: { type: 'time' as const, min: '2011-01-01' },
    yAxis: { type: 'value' as const },
    series: [
      { type: 'bar' as const, data: (data ?? []).map(r => [r.event_month, r.reviews]), name: 'review', color: orange, barMaxWidth: 10 },
      { type: 'bar' as const, data: (data ?? []).map(r => [r.event_month, r.review_comments]), name: 'review comments', color: primary, barMaxWidth: 10 },
    ],
  }), [data]);

  return <PersonalChart title="Code Review History" option={option} loading={loading} noData={!loading && (!data || data.length === 0)} />;
}
