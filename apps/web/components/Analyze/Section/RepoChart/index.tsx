'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { createVisualizationContext, createWidgetContext } from '@/lib/charts-core/utils/context';
import dynamic from 'next/dynamic';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { fetchRepoChartData, type FetchResult } from './endpoints';
import { ShowSQLButton } from '@/components/Analyze/ShowSQL';
import { ChartSkeleton } from '@/components/ui/skeletons';

const LazyECharts = dynamic(() => import('@/components/Analyze/EChartsWrapper'), { ssr: false });

const dpr = typeof devicePixelRatio === 'number' ? devicePixelRatio : 2;

interface RepoChartProps {
  /** Widget name, e.g. '@ossinsight/widget-analyze-repo-stars-history' */
  name: string;
  /** Main repo ID */
  repoId: number;
  /** Main repo full name (e.g. 'pingcap/tidb') */
  repoName: string;
  /** Comparison repo ID */
  vsRepoId?: number;
  /** Comparison repo full name */
  vsRepoName?: string;
  /** Lazy loader that returns the visualization module */
  visualizer: () => Promise<any>;
  /** Extra params for the API (period, zone, activity, limit, etc.) */
  params?: Record<string, any>;
  className?: string;
  /** Use aspectRatio instead of filling parent height */
  aspectRatio?: number;
  style?: React.CSSProperties;
}

export default function RepoChart({
  name, repoId, repoName, vsRepoId, vsRepoName,
  visualizer, params = {}, className, aspectRatio, style,
}: RepoChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [vizModule, setVizModule] = useState<any>(null);

  // Observe container size
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setSize({ width: entry.contentRect.width, height: entry.contentRect.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Fetch data
  const paramsKey = useMemo(() => JSON.stringify(params), [params]);
  const fetchResultQuery = useQuery({
    queryKey: ['repo-chart', name, repoId, vsRepoId ?? null, paramsKey],
    queryFn: ({ signal }) => fetchRepoChartData(name, repoId, params, vsRepoId, signal),
    placeholderData: keepPreviousData,
  });
  const fetchResult = fetchResultQuery.data ?? null;
  const loading = fetchResultQuery.isPending && !fetchResultQuery.data;

  // Load visualization module (use ref to avoid re-triggering on every render)
  const visualizerRef = useRef(visualizer);
  useEffect(() => {
    let stale = false;
    visualizerRef.current().then((mod: any) => { if (!stale) setVizModule(mod); });
    return () => { stale = true; };
  }, []);

  // Build linked data with repo info
  const linkedData = useMemo(() => {
    const repos: Record<string, any> = {};
    if (repoId != null && repoName) {
      repos[String(repoId)] = { id: repoId, fullName: repoName };
    }
    if (vsRepoId != null && vsRepoName) {
      repos[String(vsRepoId)] = { id: vsRepoId, fullName: vsRepoName };
    }
    return { repos, users: {}, collections: {}, orgs: {} };
  }, [repoId, repoName, vsRepoId, vsRepoName]);

  // Build visualization context
  const ctx = useMemo(() => {
    if (size.width === 0 || size.height === 0) return null;
    const widgetParams: Record<string, any> = {
      ...params,
      repo_id: String(repoId),
    };
    if (vsRepoId != null) {
      widgetParams.vs_repo_id = String(vsRepoId);
    }
    return {
      ...createVisualizationContext({ width: size.width, height: size.height, dpr, colorScheme: 'dark' }),
      ...createWidgetContext('client', widgetParams, linkedData),
    };
  }, [size.width, size.height, params, repoId, vsRepoId, linkedData]);

  const ready = !loading && !!fetchResult && !!vizModule && !!ctx;

  const containerStyle: React.CSSProperties = aspectRatio
    ? { position: 'relative', width: '100%', aspectRatio: String(aspectRatio), ...style }
    : { position: 'relative', width: '100%', height: '100%', ...style };

  // SQL info for SHOW SQL button
  const queryParams = useMemo(() => ({ repoId }), [repoId]);

  return (
    <div ref={containerRef} className={className} style={containerStyle}>
      <ShowSQLButton sql={fetchResult?.sql} queryName={fetchResult?.queryName} queryParams={queryParams} />
      {ready ? (
        <RepoChartContent vizModule={vizModule} data={fetchResult} ctx={ctx} />
      ) : loading ? (
        <ChartSkeleton />
      ) : null}
    </div>
  );
}

// --- Content dispatcher ---

function RepoChartContent({ vizModule, data, ctx }: {
  vizModule: any;
  data: FetchResult;
  ctx: any;
}) {
  const input = useMemo(() => {
    const mainData = data.main.length === 1 ? data.main[0] : data.main;
    const vsData = data.vs ? (data.vs.length === 1 ? data.vs[0] : data.vs) : undefined;
    return [mainData, vsData];
  }, [data]);

  const type = vizModule.type;

  if (type === 'echarts') {
    return <EChartsRenderer vizModule={vizModule} input={input} ctx={ctx} />;
  }

  if (type === 'react-svg') {
    return <ReactSvgRenderer vizModule={vizModule} input={input} ctx={ctx} />;
  }

  return null;
}

// --- ECharts renderer ---

function EChartsRenderer({ vizModule, input, ctx }: {
  vizModule: any;
  input: any[];
  ctx: any;
}) {
  const option = useMemo(() => {
    const opt = vizModule.default(input, ctx);
    opt.backgroundColor = 'transparent';
    return opt;
  }, [vizModule, input, ctx]);

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

// --- React-SVG renderer ---

function ReactSvgRenderer({ vizModule, input, ctx }: {
  vizModule: any;
  input: any[];
  ctx: any;
}) {
  if (vizModule.asyncComponent) {
    return <AsyncSvgRenderer vizModule={vizModule} input={input} ctx={ctx} />;
  }

  const el = vizModule.default(input, ctx);
  return <>{el}</>;
}

function AsyncSvgRenderer({ vizModule, input, ctx }: {
  vizModule: any;
  input: any[];
  ctx: any;
}) {
  const [el, setEl] = useState<React.ReactElement | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    Promise.resolve(vizModule.default(input, ctx, controller.signal))
      .then((result: any) => {
        if (!controller.signal.aborted) setEl(result);
      })
      .catch(() => {});
    return () => controller.abort();
  }, [input, ctx, vizModule]);

  return <>{el ?? <svg className="w-full h-full" />}</>;
}
