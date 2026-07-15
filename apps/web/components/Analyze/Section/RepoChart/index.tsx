'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { createVisualizationContext, createWidgetContext } from '@/lib/charts-core/utils/context';
import dynamic from 'next/dynamic';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { fetchRepoChartData, type FetchResult } from './endpoints';
import { ShowSQLInline } from '@/components/Analyze/ShowSQL';
import { ChartSkeleton } from '@/components/ui/skeletons';
import { useChartContainer } from '@/components/Analyze/hooks/useChartContainer';

const LazyECharts = dynamic(() => import('@/components/Analyze/EChartsWrapper'), { ssr: false });

const dpr = typeof devicePixelRatio === 'number' ? devicePixelRatio : 2;

interface VisualizerModule {
  type: 'echarts' | 'react-svg' | 'react';
  default: (...args: any[]) => any;
  asyncComponent?: boolean;
}

const TITLE_STYLES = {
  h2: 'text-[22px] font-semibold text-[#e9eaee]',
  h3: 'text-[18px] font-semibold text-[#e9eaee]',
  h4: 'text-[14px] font-medium text-[#e9eaee]',
} as const;

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
  visualizer: () => Promise<VisualizerModule>;
  /** Extra params for the API (period, zone, activity, limit, etc.) */
  params?: Record<string, any>;
  className?: string;
  /** Use aspectRatio instead of filling parent height */
  aspectRatio?: number;
  style?: React.CSSProperties;
  /** Chart title — renders a title row with ShowSQL on the right */
  title?: string;
  /** Heading level for title. Default: h4 */
  titleLevel?: 'h2' | 'h3' | 'h4';
  /** Show inline SHOW SQL button (only used when no title). Default: false */
  showSQL?: boolean;
  /** Render detailed chart axes when supported by the visualizer. */
  showAxes?: boolean;
  /** Callback when SQL becomes available (for rendering in parent title row) */
  onSQLReady?: (sql: string, queryName?: string) => void;
}

export default function RepoChart({
  name, repoId, repoName, vsRepoId, vsRepoName,
  visualizer, params = {}, className, aspectRatio, style,
  title, titleLevel = 'h4', showSQL = false, showAxes = false, onSQLReady,
}: RepoChartProps) {
  const { containerRef, size } = useChartContainer();
  const [vizModule, setVizModule] = useState<VisualizerModule | null>(null);

  // Fetch data
  const paramsKey = useMemo(() => JSON.stringify(params), [params]);
  const fetchResultQuery = useQuery({
    queryKey: ['repo-chart', name, repoId, vsRepoId ?? null, paramsKey],
    queryFn: ({ signal }) => fetchRepoChartData(name, repoId, params, vsRepoId, signal),
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000, // 5 minutes - chart data doesn't change frequently
  });
  const fetchResult = fetchResultQuery.data ?? null;
  const loading = fetchResultQuery.isPending && !fetchResultQuery.data;

  // Load visualization module (use ref to avoid re-triggering on every render)
  const visualizerRef = useRef(visualizer);
  useEffect(() => {
    let stale = false;
    visualizerRef.current().then((mod) => { if (!stale) setVizModule(mod); });
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
      options: {
        ...(params.options ?? {}),
        showAxes,
      },
    };
    if (vsRepoId != null) {
      widgetParams.vs_repo_id = String(vsRepoId);
    }
    return {
      ...createVisualizationContext({ width: size.width, height: size.height, dpr, colorScheme: 'dark' }),
      ...createWidgetContext('client', widgetParams, linkedData),
    };
  }, [size.width, size.height, params, repoId, vsRepoId, linkedData, showAxes]);

  const ready = !loading && !!fetchResult && !!vizModule && !!ctx;

  const axisDateRange = useMemo(() => {
    if (!showAxes || !fetchResult?.main) return null;
    const dates = fetchResult.main
      .flatMap((dataset) => dataset)
      .map((row) => row?.current_period_day)
      .filter((date): date is string => typeof date === 'string')
      .sort();
    if (dates.length === 0) return null;
    const formatDate = (date: string) => date.slice(5).replace('-', '/');
    return [formatDate(dates[0]), formatDate(dates[dates.length - 1])] as const;
  }, [fetchResult?.main, showAxes]);

  const containerStyle: React.CSSProperties = aspectRatio
    ? { aspectRatio: String(aspectRatio), ...style }
    : { ...style };

  // SQL info for SHOW SQL button
  const queryParams = useMemo(() => ({ repoId }), [repoId]);

  // Notify parent when SQL is available
  useEffect(() => {
    if (fetchResult?.sql && onSQLReady) {
      onSQLReady(fetchResult.sql, fetchResult.queryName);
    }
  }, [fetchResult?.sql, fetchResult?.queryName, onSQLReady]);

  const sqlButton = fetchResult?.sql
    ? <ShowSQLInline sql={fetchResult.sql} queryName={fetchResult.queryName} queryParams={queryParams} />
    : null;

  return (
    <div>
      {title ? (
        <div className="flex items-center justify-between gap-4 mb-3">
          {React.createElement(titleLevel, { className: TITLE_STYLES[titleLevel] }, title)}
          {sqlButton}
        </div>
      ) : showSQL ? (
        <div className="flex justify-end mb-1">{sqlButton}</div>
      ) : null}
      <div ref={containerRef} className={`relative w-full overflow-hidden ${className ?? ''}`} style={containerStyle}>
        {ready ? (
          <RepoChartContent vizModule={vizModule} data={fetchResult} ctx={ctx} />
        ) : loading ? (
          <ChartSkeleton />
        ) : null}
      </div>
      {axisDateRange && (
        <div className="mt-1 flex items-center justify-between pl-9 pr-2 text-[10px] leading-none text-[#8f8f96]">
          <span>{axisDateRange[0]}</span>
          <span className="uppercase tracking-[0.12em] text-[#707077]">Date</span>
          <span>{axisDateRange[1]}</span>
        </div>
      )}
    </div>
  );
}

// --- Content dispatcher ---

function RepoChartContent({ vizModule, data, ctx }: {
  vizModule: VisualizerModule;
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
  vizModule: VisualizerModule;
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
      className="w-full h-full"
      style={{ width: '100%', height: '100%' }}
      notMerge
      lazyUpdate
      theme="dark"
    />
  );
}

// --- React-SVG renderer ---

function ReactSvgRenderer({ vizModule, input, ctx }: {
  vizModule: VisualizerModule;
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
  vizModule: VisualizerModule;
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
