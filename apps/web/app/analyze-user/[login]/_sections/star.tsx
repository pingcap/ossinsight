'use client';

import SectionTemplate from '@/components/Analyze/Section';
import { AnalyzeOwnerContext } from '@/components/Context/Analyze/AnalyzeOwner';
import * as React from 'react';
import { useMemo } from 'react';
import PersonalChart from '../_charts/ChartWrapper';
import { chartColors } from '../_charts/colors';
import { usePersonalData } from '../_hooks/usePersonal';

export default function StarSection () {
  const { id: userId } = React.useContext(AnalyzeOwnerContext);

  return (
    <SectionTemplate id="star" title="Star" level={2} className="pt-8"
      description="The total number of starred repositories since 2011, which ignores developers' unstarring or restarring behavior."
    >
      <StarChart userId={userId} />
    </SectionTemplate>
  );
}

function StarChart ({ userId }: { userId: number }) {
  const { data, loading } = usePersonalData('personal-star-history', userId);

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

  return <PersonalChart title="Star History" option={option} loading={loading} noData={!loading && chartData.length === 0} />;
}
