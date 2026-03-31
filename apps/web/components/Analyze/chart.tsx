'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import type { EChartsOption } from 'echarts';
import {
  AnalyzeChartContextProps,
  isNoData,
  useAnalyzeChartContext,
  useAnalyzeContext,
} from './context';
import { DangerousCtx, dangerousSetCtx } from './options/utils/analyze';
import { ShowSQLButton } from './ShowSQL';

const LazyECharts = dynamic(() => import('./EChartsWrapper'), { ssr: false });

export interface ChartComponentProps {
  aspectRatio?: number;
  className?: string;
  style?: React.CSSProperties;
  spec?: any;
}

// --- withChart HOC ---

export function withChart<T = unknown, P = void>(
  buildOption: (props: DangerousCtx<T>, chartProps: P) => EChartsOption,
  defaultProps: { aspectRatio?: number } = {},
) {
  return function ChartComponent(props: ChartComponentProps & (P extends void ? {} : { spec: P })) {
    const { aspectRatio = defaultProps.aspectRatio ?? 16 / 9, className, style } = props;
    const context = useAnalyzeContext();
    const chartContext = useAnalyzeChartContext<T>();

    const containerRef = useRef<HTMLDivElement>(null);
    const [width, setWidth] = useState(640);
    const [height, setHeight] = useState(480);
    const [isSmall, setIsSmall] = useState(false);

    useEffect(() => {
      const el = containerRef.current;
      if (!el) return;
      const observer = new ResizeObserver((entries) => {
        const entry = entries[0];
        if (entry) {
          setWidth(entry.contentRect.width);
          setHeight(entry.contentRect.height);
          setIsSmall(entry.contentRect.width < 768);
        }
      });
      observer.observe(el);
      return () => observer.disconnect();
    }, []);

    const option = useMemo(() => {
      const ctx: DangerousCtx<T> = {
        ...context,
        ...chartContext,
        context: {},
        width: width || 640,
        height: height || 480,
        isSmall,
      };
      dangerousSetCtx(ctx);
      const opt = buildOption(ctx, (props as any).spec);

      if (isNoData(ctx as AnalyzeChartContextProps)) {
        opt.graphic = {
          id: 'no-data',
          type: 'text',
          left: 'center',
          top: 'middle',
          style: {
            fontSize: 16,
            fontWeight: 'bold',
            text: 'No relevant data yet',
            fill: '#7c7c7c',
          },
        };
      } else {
        opt.graphic = { id: 'no-data', invisible: true, type: 'text' };
      }

      opt.backgroundColor = 'transparent';
      dangerousSetCtx(undefined);
      return opt;
    }, [context, chartContext, width, height, isSmall, props]);

    const showLoading = chartContext.data.loading || chartContext.compareData.loading;
    const sql = chartContext.data.data?.sql;
    const queryName = chartContext.query;
    const queryParams = useMemo(() => ({ repoId: context.repoId }), [context.repoId]);

    return (
      <div>
        <ShowSQLButton sql={sql} queryName={queryName} queryParams={queryParams} />
        <div
          ref={containerRef}
          className={className}
          style={{ position: 'relative', width: '100%', ...style }}
        >
        <LazyECharts
          option={option}
          style={{ width: '100%', ...(style?.height ? { height: style.height } : { aspectRatio: String(aspectRatio) }) }}
          notMerge
          lazyUpdate
          showLoading={showLoading}
          loadingOption={{
            color: 'rgb(255, 255, 255)',
            textColor: 'rgb(255, 255, 255)',
            maskColor: 'rgba(0, 0, 0, 0.3)',
          }}
          theme="dark"
        />
        </div>
      </div>
    );
  };
}
