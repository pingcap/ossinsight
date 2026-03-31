'use client';

import { ScrollspySectionWrapper } from '@/components/Scrollspy/SectionWrapper';
import { AnalyzeOwnerContext } from '@/components/Context/Analyze/AnalyzeOwner';
import * as React from 'react';
import { useMemo } from 'react';
import PersonalChart from '../_charts/ChartWrapper';
import { chartColors } from '../_charts/colors';
import { usePersonalData } from '../_hooks/usePersonal';

export default function StarSection () {
  const { id: userId } = React.useContext(AnalyzeOwnerContext);

  return (
    <ScrollspySectionWrapper anchor="star" className="pt-8 pb-8">
      <h2 className="text-[22px] font-semibold text-[#e9eaee] pb-4" style={{ scrollMarginTop: '140px' }}>Star</h2>
      <p className="text-sm text-[#8c8c8c] mb-4">The total number of starred repositories since 2011, which ignores developers&apos; unstarring or restarring behavior.</p>
      <StarChart userId={userId} />
    </ScrollspySectionWrapper>
  );
}

function StarChart ({ userId }: { userId: number }) {
  const { data, sql, queryName, loading } = usePersonalData('personal-star-history', userId);

  const chartData = useMemo(() => {
    const map = new Map<string, number>();
    for (const row of data ?? []) {
      map.set(row.star_month, (map.get(row.star_month) ?? 0) + row.cnt);
    }
    return Array.from(map.entries()).map(([month, cnt]) => [month, cnt]);
  }, [data]);

  const option = useMemo(() => ({
    xAxis: { type: 'time' as const, min: '2011-01-01' },
    yAxis: { type: 'value' as const },
    series: [{ type: 'bar' as const, data: chartData, color: chartColors[0], barMaxWidth: 10 }],
  }), [chartData]);

  const queryParams = useMemo(() => ({ userId }), [userId]);

  return <PersonalChart title="Star History" option={option} loading={loading} noData={!loading && chartData.length === 0} sql={sql} queryName={queryName} queryParams={queryParams} />;
}
