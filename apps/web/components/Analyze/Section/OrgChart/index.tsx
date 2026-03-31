'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { createVisualizationContext, createWidgetContext } from '@/lib/charts-core/utils/context';
import dynamic from 'next/dynamic';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { fetchChartData } from './endpoints';
import { useChartContainer } from '@/components/Analyze/hooks/useChartContainer';

const LazyECharts = dynamic(() => import('@/components/Analyze/EChartsWrapper'), { ssr: false });

const dpr = typeof devicePixelRatio === 'number' ? devicePixelRatio : 2;

interface VisualizerModule {
  type: 'echarts' | 'react-svg' | 'react';
  default: (...args: any[]) => any;
  asyncComponent?: boolean;
}

interface OrgChartProps {
  name: string;
  visualizer: () => Promise<VisualizerModule>;
  params: Record<string, any>;
  className?: string;
  orgId?: number;
  orgLogin?: string;
  onSQLReady?: (sql: string, queryName?: string) => void;
}

export default function OrgChart({ name, visualizer, params, className, orgId, orgLogin, onSQLReady }: OrgChartProps) {
  const { containerRef, size } = useChartContainer();
  const [vizModule, setVizModule] = useState<VisualizerModule | null>(null);

  const paramsKey = useMemo(() => JSON.stringify(params), [params]);
  const dataQuery = useQuery({
    queryKey: ['org-chart', name, paramsKey],
    queryFn: ({ signal }) => fetchChartData(name, params, signal),
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000, // 5 minutes - chart data doesn't change frequently
  });
  const fetchResult = dataQuery.data ?? null;
  const data = fetchResult?.data ?? null;
  const loading = dataQuery.isPending && !dataQuery.data;

  useEffect(() => {
    if (fetchResult?.sql && onSQLReady) {
      onSQLReady(fetchResult.sql, fetchResult.queryName);
    }
  }, [fetchResult?.sql, fetchResult?.queryName, onSQLReady]);

  const visualizerRef = useRef(visualizer);
  useEffect(() => {
    let stale = false;
    visualizerRef.current()
      .then((mod) => { if (!stale) setVizModule(mod); })
      .catch(() => { /* visualizer load failed */ });
    return () => { stale = true; };
  }, []);

  const linkedData = useMemo(() => {
    const orgs: Record<string, any> = {};
    if (orgId != null && orgLogin) {
      orgs[String(orgId)] = { id: orgId, login: orgLogin };
    }
    return { repos: {}, users: {}, collections: {}, orgs };
  }, [orgId, orgLogin]);

  const ctx = useMemo(() => {
    if (size.width === 0 || size.height === 0) return null;
    return {
      ...createVisualizationContext({ width: size.width, height: size.height, dpr, colorScheme: 'dark' }),
      ...createWidgetContext('client', params, linkedData),
    };
  }, [size.width, size.height, params, linkedData]);

  const ready = !loading && !!data && !!vizModule && !!ctx;

  return (
    <div ref={containerRef} className={`w-full h-full ${className ?? ''}`}>
      {ready && <OrgChartContent vizModule={vizModule} data={data} ctx={ctx} linkedData={linkedData} />}
    </div>
  );
}

function OrgChartContent({ vizModule, data, ctx, linkedData }: {
  vizModule: VisualizerModule;
  data: any[];
  ctx: any;
  linkedData: any;
}) {
  const type = vizModule.type;

  if (type === 'echarts') {
    return <EChartsRenderer vizModule={vizModule} data={data} ctx={ctx} />;
  }

  if (type === 'react') {
    const Component = vizModule.default;
    return (
      <div className="w-full h-full flex flex-col">
        <Component data={data} ctx={ctx} linkedData={linkedData} />
      </div>
    );
  }

  if (type === 'react-svg') {
    return <ReactSvgRenderer vizModule={vizModule} data={data} ctx={ctx} />;
  }

  return null;
}

function EChartsRenderer({ vizModule, data, ctx }: {
  vizModule: VisualizerModule;
  data: any[];
  ctx: any;
}) {
  const option = useMemo(() => {
    const opt = vizModule.default(data, ctx);
    opt.backgroundColor = 'transparent';
    return opt;
  }, [vizModule, data, ctx]);

  return (
    <LazyECharts
      option={option}
      className="w-full h-full"
      notMerge
      lazyUpdate
      theme="dark"
    />
  );
}

function ReactSvgRenderer({ vizModule, data, ctx }: {
  vizModule: VisualizerModule;
  data: any[];
  ctx: any;
}) {
  if (vizModule.asyncComponent) {
    return <AsyncSvgTopLevel vizModule={vizModule} data={data} ctx={ctx} />;
  }

  const el = vizModule.default(data, ctx);
  return <>{el}</>;
}

function AsyncSvgTopLevel({ vizModule, data, ctx }: {
  vizModule: VisualizerModule;
  data: any[];
  ctx: any;
}) {
  const [el, setEl] = useState<React.ReactElement | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    Promise.resolve(vizModule.default(data, ctx, controller.signal))
      .then((result: any) => {
        if (!controller.signal.aborted) setEl(result);
      })
      .catch(() => {});
    return () => controller.abort();
  }, [data, ctx, vizModule]);

  return <>{el ?? <svg className="w-full h-full" />}</>;
}
