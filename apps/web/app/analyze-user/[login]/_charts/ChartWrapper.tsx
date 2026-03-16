'use client';

import dynamic from 'next/dynamic';
import React, { useMemo } from 'react';
import type { EChartsOption } from 'echarts';

const EChartsWrapper = dynamic(() => import('@/components/Analyze/EChartsWrapper'), { ssr: false });

interface PersonalChartProps {
  title: string;
  option: EChartsOption;
  height?: number;
  loading?: boolean;
  noData?: boolean;
}

export default function PersonalChart ({ title, option, height = 400, loading, noData }: PersonalChartProps) {
  const mergedOption = useMemo<EChartsOption>(() => ({
    backgroundColor: 'transparent',
    title: { text: title, left: 'center', textStyle: { color: '#dadada', fontSize: 14, fontWeight: 'bold' } },
    legend: { type: 'scroll', orient: 'horizontal', top: 32, textStyle: { color: '#aaa' } },
    grid: { top: 64, left: 8, right: 8, bottom: 48, containLabel: true },
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    dataZoom: [{ type: 'slider', showDataShadow: false }],
    ...(noData
      ? {
          graphic: [{ type: 'text', left: 'center', top: 'middle', style: { fontSize: 16, fontWeight: 'bold' as const, text: 'No relevant data yet', fill: '#7c7c7c' } }],
          xAxis: { type: 'time' },
          yAxis: { type: 'value' },
          series: [],
        }
      : option),
  }), [title, option, noData]);

  if (loading) {
    return (
      <div className="mb-4 flex items-center justify-center rounded-2xl overflow-hidden" style={{ height, background: 'rgb(36, 35, 49)', boxShadow: '0px 4px 4px 0px rgba(36, 39, 56, 0.25)' }}>
        <div className="text-[#fbe593] text-sm animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="mb-4 rounded-2xl overflow-hidden" style={{ background: 'rgb(36, 35, 49)', boxShadow: '0px 4px 4px 0px rgba(36, 39, 56, 0.25)' }}>
      <EChartsWrapper
        option={mergedOption}
        notMerge
        lazyUpdate
        style={{ width: '100%', height }}
        theme="dark"
      />
    </div>
  );
}
