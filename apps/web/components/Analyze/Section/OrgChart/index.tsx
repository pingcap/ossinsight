'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { createVisualizationContext, createWidgetContext } from '@/lib/charts-core/utils/context';
import dynamic from 'next/dynamic';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { fetchChartData } from './endpoints';

const LazyECharts = dynamic(() => import('@/components/Analyze/EChartsWrapper'), { ssr: false });

const dpr = typeof devicePixelRatio === 'number' ? devicePixelRatio : 2;

interface OrgChartProps {
  name: string;
  visualizer: () => Promise<any>;
  params: Record<string, any>;
  className?: string;
  orgId?: number;
  orgLogin?: string;
}

export default function OrgChart({ name, visualizer, params, className, orgId, orgLogin }: OrgChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [vizModule, setVizModule] = useState<any>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setSize({ width: entry.contentRect.width, height: entry.contentRect.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const paramsKey = useMemo(() => JSON.stringify(params), [params]);
  const dataQuery = useQuery({
    queryKey: ['org-chart', name, paramsKey],
    queryFn: ({ signal }) => fetchChartData(name, params, signal),
    placeholderData: keepPreviousData,
  });
  const data = dataQuery.data ?? null;
  const loading = dataQuery.isPending && !dataQuery.data;

  const visualizerRef = useRef(visualizer);
  useEffect(() => {
    let stale = false;
    visualizerRef.current()
      .then((mod: any) => { if (!stale) setVizModule(mod); })
      .catch((e: any) => { console.warn(`[OrgChart] Failed to load visualizer for: ${name}`, e); });
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
    <div ref={containerRef} className={className} style={{ width: '100%', height: '100%' }}>
      {ready && <OrgChartContent vizModule={vizModule} data={data} ctx={ctx} linkedData={linkedData} />}
    </div>
  );
}

function OrgChartContent({ vizModule, data, ctx, linkedData }: {
  vizModule: any;
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
      <div style={{
        width: '100%', height: '100%', borderRadius: 18, overflow: 'hidden',
        background: 'rgb(36, 35, 49)', boxShadow: '0px 4px 4px 0px rgba(36, 39, 56, 0.25)',
        display: 'flex', flexDirection: 'column',
      }}>
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
  vizModule: any;
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
      style={{ width: '100%', height: '100%' }}
      notMerge
      lazyUpdate
      theme="dark"
    />
  );
}

function ReactSvgRenderer({ vizModule, data, ctx }: {
  vizModule: any;
  data: any[];
  ctx: any;
}) {
  if (vizModule.asyncComponent) {
    return <AsyncSvgTopLevel vizModule={vizModule} data={data} ctx={ctx} />;
  }

  const input = data.length === 1 ? data[0] : data;
  const el = vizModule.default(input, ctx);
  return <>{el}</>;
}

function AsyncSvgTopLevel({ vizModule, data, ctx }: {
  vizModule: any;
  data: any[];
  ctx: any;
}) {
  const [el, setEl] = useState<React.ReactElement | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const input = data.length === 1 ? data[0] : data;
    Promise.resolve(vizModule.default(input, ctx, controller.signal))
      .then((result: any) => {
        if (!controller.signal.aborted) setEl(result);
      })
      .catch(() => {});
    return () => controller.abort();
  }, [data, ctx, vizModule]);

  return <>{el ?? <svg className="w-full h-full" />}</>;
}
