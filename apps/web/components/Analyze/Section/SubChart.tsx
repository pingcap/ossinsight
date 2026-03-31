'use client';

import { createVisualizationContext, createWidgetContext } from '@/lib/charts-core/utils/context';
import dynamic from 'next/dynamic';
import React, { useEffect, useMemo, useRef, useState } from 'react';

const LazyECharts = dynamic(() => import('@/components/Analyze/EChartsWrapper'), { ssr: false });
const dpr = typeof devicePixelRatio === 'number' ? devicePixelRatio : 2;

interface SubChartProps {
  vizModule: any;
  data: any;
  params?: Record<string, any>;
  linkedData?: any;
  className?: string;
  style?: React.CSSProperties;
}

export default function SubChart({ vizModule, data, params = {}, linkedData, className, style }: SubChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setSize({ width: entry.contentRect.width, height: entry.contentRect.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const ctx = useMemo(() => {
    if (size.width === 0 || size.height === 0) return null;
    return {
      ...createVisualizationContext({ width: size.width, height: size.height, dpr, colorScheme: 'dark' }),
      ...createWidgetContext('client', params, linkedData ?? { repos: {}, users: {}, collections: {}, orgs: {} }),
    };
  }, [size.width, size.height, params, linkedData]);

  return (
    <div ref={containerRef} className={className} style={{ width: '100%', height: '100%', ...style }}>
      {ctx && vizModule.type === 'echarts' && <EChartsSubChart vizModule={vizModule} data={data} ctx={ctx} />}
      {ctx && vizModule.type === 'react-svg' && <SvgSubChart vizModule={vizModule} data={data} ctx={ctx} />}
    </div>
  );
}

function EChartsSubChart({ vizModule, data, ctx }: { vizModule: any; data: any; ctx: any }) {
  const option = useMemo(() => {
    const opt = vizModule.default(data, ctx);
    opt.backgroundColor = 'transparent';
    return opt;
  }, [vizModule, data, ctx]);

  return <LazyECharts option={option} style={{ width: '100%', height: '100%' }} notMerge lazyUpdate theme="dark" />;
}

function SvgSubChart({ vizModule, data, ctx }: { vizModule: any; data: any; ctx: any }) {
  if (vizModule.asyncComponent) {
    return <AsyncSvgSubChart vizModule={vizModule} data={data} ctx={ctx} />;
  }
  return <>{vizModule.default(data, ctx)}</>;
}

function AsyncSvgSubChart({ vizModule, data, ctx }: { vizModule: any; data: any; ctx: any }) {
  const [el, setEl] = useState<React.ReactElement | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    Promise.resolve(vizModule.default(data, ctx, controller.signal))
      .then((result: any) => { if (!controller.signal.aborted) setEl(result); })
      .catch((err: unknown) => { if (!controller.signal.aborted) console.error('[AsyncSvgSubChart] render error:', err); });
    return () => controller.abort();
  }, [data, ctx, vizModule]);

  return <>{el ?? <svg className="w-full h-full" />}</>;
}
