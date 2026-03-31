'use client';

import dynamic from 'next/dynamic';
import React, { useMemo } from 'react';
import type { EChartsOption } from 'echarts';
import { ShowSQLInline } from '@/components/Analyze/ShowSQL';

const EChartsWrapper = dynamic(() => import('@/components/Analyze/EChartsWrapper'), { ssr: false });

interface PersonalChartProps {
  title: string;
  option: EChartsOption;
  height?: number;
  loading?: boolean;
  noData?: boolean;
  /** SQL string returned from the API, used for the SHOW SQL button */
  sql?: string;
  /** Query name for the SHOW SQL explain tab */
  queryName?: string;
  /** Query params for the SHOW SQL explain tab */
  queryParams?: Record<string, any>;
}

export default function PersonalChart ({ title, option, height = 400, loading, noData, sql, queryName, queryParams }: PersonalChartProps) {
  const mergedOption = useMemo<EChartsOption>(() => {
    const axisLine = { lineStyle: { color: '#2a2a2c' } };
    const splitLine = { show: true, lineStyle: { color: '#2a2a2c', type: 'dashed' as const } };
    const baseOption = noData
      ? {
          graphic: [{ type: 'text', left: 'center', top: 'middle', style: { fontSize: 16, fontWeight: 'bold' as const, text: 'No relevant data yet', fill: '#7c7c7c' } }],
          xAxis: { type: 'time' as const, splitLine, axisLine },
          yAxis: { type: 'value' as const, splitLine, axisLine },
          series: [],
        }
      : option;

    // Inject grid lines into existing axes
    const injectSplitLine = (axis: any) => {
      if (!axis) return axis;
      if (Array.isArray(axis)) return axis.map((a: any) => ({ ...a, splitLine: { ...splitLine, ...a?.splitLine }, axisLine: { ...axisLine, ...a?.axisLine } }));
      return { ...axis, splitLine: { ...splitLine, ...axis?.splitLine }, axisLine: { ...axisLine, ...axis?.axisLine } };
    };

    return {
      backgroundColor: 'transparent',
      legend: { type: 'scroll', orient: 'horizontal', top: 8, textStyle: { color: '#aaa' } },
      grid: { top: 40, left: 8, right: 8, bottom: 48, containLabel: true },
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      dataZoom: [{
        type: 'slider',
        showDataShadow: false,
        height: 16,
        borderColor: 'transparent',
        backgroundColor: '#1a1a1b',
        fillerColor: 'rgba(255,255,255,0.05)',
        handleSize: 16,
        handleStyle: { color: '#555', borderColor: '#555', borderWidth: 1 },
        moveHandleSize: 4,
        textStyle: { color: '#888', fontSize: 10 },
        dataBackground: { lineStyle: { color: 'transparent' }, areaStyle: { color: 'transparent' } },
        selectedDataBackground: { lineStyle: { color: 'transparent' }, areaStyle: { color: 'transparent' } },
      }],
      ...baseOption,
      xAxis: injectSplitLine((baseOption as any)?.xAxis),
      yAxis: injectSplitLine((baseOption as any)?.yAxis),
    };
  }, [option, noData]);

  if (loading) {
    return (
      <div className="mb-6">
        <div className="flex items-center justify-between gap-4 mb-3">
          <h4 className="text-[14px] font-medium text-[#e9eaee]">{title}</h4>
        </div>
        <div className="flex items-center justify-center" style={{ height }}>
          <div className="text-[#7c7c7c] text-sm animate-pulse">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between gap-4 mb-3">
        <h4 className="text-[14px] font-medium text-[#e9eaee]">{title}</h4>
        {sql && <ShowSQLInline sql={sql} queryName={queryName} queryParams={queryParams} />}
      </div>
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
