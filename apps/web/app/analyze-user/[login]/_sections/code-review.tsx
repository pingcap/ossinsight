'use client';

import { ScrollspySectionWrapper } from '@/components/Scrollspy/SectionWrapper';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { AnalyzeOwnerContext } from '@/components/Context/Analyze/AnalyzeOwner';
import * as React from 'react';
import { useMemo } from 'react';
import PersonalChart from '../_charts/ChartWrapper';
import { orange, primary } from '../_charts/colors';
import { createTimeSeriesOption } from '../_charts/createChartOption';
import { usePersonalData } from '../_hooks/usePersonal';

export default function CodeReviewSection () {
  const { id: userId } = React.useContext(AnalyzeOwnerContext);

  return (
    <ScrollspySectionWrapper anchor="code-review" className="pt-8 pb-8">
      <SectionHeading>Code Review</SectionHeading>
      <CodeReviewHistory userId={userId} />
    </ScrollspySectionWrapper>
  );
}

function CodeReviewHistory ({ userId }: { userId: number }) {
  const { data, sql, queryName, loading } = usePersonalData('personal-pull-request-reviews-history', userId);
  const option = useMemo(() => createTimeSeriesOption([
    { type: 'bar' as const, data: (data ?? []).map(r => [r.event_month, r.reviews]), name: 'review', color: orange, barMaxWidth: 10 },
    { type: 'bar' as const, data: (data ?? []).map(r => [r.event_month, r.review_comments]), name: 'review comments', color: primary, barMaxWidth: 10 },
  ]), [data]);

  const queryParams = useMemo(() => ({ userId }), [userId]);

  return <PersonalChart title="Code Review History" option={option} loading={loading} noData={!loading && (!data || data.length === 0)} sql={sql} queryName={queryName} queryParams={queryParams} />;
}
