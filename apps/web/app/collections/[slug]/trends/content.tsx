'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Gauge as GaugeIcon, Pencil as PencilIcon } from 'lucide-react';

// Cast to avoid JSX type errors from @types/react version mismatch
const Gauge = GaugeIcon as React.ComponentType<any>;
const Pencil = PencilIcon as React.ComponentType<any>;
import type { EChartsOption } from 'echarts';
import { ShowSQLInline } from '@/components/Analyze/ShowSQL';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  collectionHistoryDimensions,
  COLLECTION_CONFIGS_REPO_URL,
  getCollectionHistoryExplainPath,
  getCollectionHistoryPath,
  type CollectionMetric,
} from '@/lib/collections';
import { type CollectionQueryResponse, useCollectionApi } from '@/lib/collections-client';
import type { Collection } from '@/utils/api';

// @ts-expect-error - dynamic import type mismatch with Next.js types
const LazyECharts = dynamic(() => import('@/components/Analyze/EChartsWrapper'), { ssr: false }) as React.ComponentType<any>;
const monthFormatter = new Intl.DateTimeFormat(['en-US'], {
  month: 'short',
  year: 'numeric',
});

type HistoryRow = {
  repo_id: number;
  repo_name: string;
  event_month: string;
  total: number;
};

const COLORS = [
  '#f7df83',
  '#5f92ff',
  '#73b9bc',
  '#e69d87',
  '#91ca8c',
  '#f49f42',
  '#b6a2de',
  '#dd6b66',
  '#5ab1ef',
  '#eedd78',
];

function formatCompactNumber(value: number | undefined) {
  if (value == null) {
    return '0';
  }

  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
}

function formatMonth(value: string | undefined) {
  if (!value) {
    return '';
  }

  try {
    return monthFormatter.format(new Date(value));
  } catch {
    return '--';
  }
}

function MetricTabs({
  metric,
  onChange,
}: {
  metric: CollectionMetric;
  onChange: (metric: CollectionMetric) => void;
}) {
  return (
    <Tabs value={metric} onValueChange={(value) => onChange(value as CollectionMetric)}>
      <TabsList className="gap-7">
        {collectionHistoryDimensions.map((option) => (
          <TabsTrigger key={option.key} value={option.key}>
            {option.title}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}

function CollectionPageHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <header>
      <a
        href={COLLECTION_CONFIGS_REPO_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="site-link inline-flex items-center gap-1.5 text-sm"
      >
        <Pencil className="h-4 w-4" />
        Edit This Collection
      </a>
      <h1 className="mt-4 text-[2.3rem] font-semibold leading-tight text-[#f7df83] sm:text-[2.7rem]">
        {title}
      </h1>
      <p className="mt-4 max-w-4xl text-[16px] leading-7 text-[#7c7c7c]">{description}</p>
    </header>
  );
}

function LoadingSkeleton({ className, ...props }: React.ComponentProps<typeof Skeleton>) {
  return <Skeleton className={['bg-white/[0.08]', className].filter(Boolean).join(' ')} {...props} />;
}

function TrendChartSkeleton({
  height,
  showControls = false,
}: {
  height: number;
  showControls?: boolean;
}) {
  return (
    <div className="mt-4">
      <div className="mb-4 flex flex-wrap gap-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <LoadingSkeleton key={index} className="h-5 w-28 rounded-full" />
        ))}
      </div>
      <LoadingSkeleton className="w-full rounded-2xl" style={{ height }} />
      {showControls && (
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <LoadingSkeleton className="h-8 w-16 rounded-md" />
          <LoadingSkeleton className="h-4 w-24" />
          <LoadingSkeleton className="h-4 flex-1" />
        </div>
      )}
    </div>
  );
}

function BarChartRaceSection({ collectionId, collectionName }: { collectionId: number; collectionName: string }) {
  const [metric, setMetric] = useMetricFromUrl('bar-chart-race');
  const [playing, setPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval>>();
  const dataPath = getCollectionHistoryPath(collectionId, metric);
  const explainPath = getCollectionHistoryExplainPath(collectionId, metric);
  const { data, loading, hasLoaded, error } = useCollectionApi<CollectionQueryResponse<HistoryRow>>(dataPath);
  const rows = data?.data ?? [];

  const timeline = useMemo(() => {
    if (rows.length === 0) {
      return {
        months: [] as string[],
        frames: [] as Array<{ month: string; items: Array<{ repo: string; total: number }> }>,
        repoNames: [] as string[],
      };
    }

    const months = [...new Set(rows.map((row) => row.event_month))].sort();
    const repoNames = [...new Set(rows.map((row) => row.repo_name))];
    const frames = months.map((month) => ({
      month,
      items: repoNames
        .map((repo) => {
          const row = rows.find((item) => item.repo_name === repo && item.event_month === month);
          return { repo, total: row?.total ?? 0 };
        })
        .sort((left, right) => right.total - left.total),
    }));

    return { months, frames, repoNames };
  }, [rows]);

  useEffect(() => {
    if (timeline.months.length > 0) {
      setCurrentIndex(timeline.months.length - 1);
    } else {
      setCurrentIndex(0);
    }
    setPlaying(false);
  }, [timeline.months.length, metric]);

  useEffect(() => {
    if (!playing || timeline.frames.length === 0) {
      return;
    }

    timerRef.current = setInterval(() => {
      setCurrentIndex((previous) => {
        if (previous >= timeline.frames.length - 1) {
          setPlaying(false);
          return previous;
        }

        return previous + 1;
      });
    }, 280);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [playing, timeline.frames.length]);

  const option = useMemo<EChartsOption>(() => {
    if (timeline.frames.length === 0 || currentIndex >= timeline.frames.length) {
      return {} as EChartsOption;
    }

    const frame = timeline.frames[currentIndex];
    const topItems = frame.items.filter((item) => item.total > 0).slice(0, 10).reverse();
    const colorByRepo = Object.fromEntries(
      timeline.repoNames.map((repo, index) => [repo, COLORS[index % COLORS.length]]),
    );

    return {
      animationDurationUpdate: 220,
      animationEasingUpdate: 'linear',
      backgroundColor: 'transparent',
      grid: { left: 180, right: 60, top: 54, bottom: 36 },
      xAxis: {
        type: 'value',
        axisLabel: { color: '#98a1b3', formatter: (value: number) => formatCompactNumber(value) },
        splitLine: { lineStyle: { color: 'rgba(255,255,255,0.08)' } },
      },
      yAxis: {
        type: 'category',
        data: topItems.map((item) => item.repo),
        axisLabel: { color: '#d0d5dd', fontSize: 11 },
      },
      title: {
        text: `${collectionName} · ${collectionHistoryDimensions.find((item) => item.key === metric)?.title}`,
        subtext: formatMonth(frame.month),
        left: 'center',
        top: 6,
        textStyle: { color: '#f8fafc', fontSize: 14, fontWeight: 600 },
        subtextStyle: { color: '#98a1b3', fontSize: 12 },
      },
      series: [
        {
          type: 'bar',
          barMaxWidth: 28,
          data: topItems.map((item) => ({
            value: item.total,
            itemStyle: { color: colorByRepo[item.repo] ?? '#98a1b3' },
          })),
          label: {
            show: true,
            position: 'right',
            color: '#d0d5dd',
            formatter: (params: any) => formatCompactNumber(Number(params.value ?? 0)),
          },
        },
      ],
    } as EChartsOption;
  }, [collectionName, currentIndex, metric, timeline.frames, timeline.repoNames]);

  return (
    <section>
      <h2 className="text-[2rem] font-semibold leading-tight text-[#f7df83] sm:text-[2.15rem]">
        Bar Chart Race
      </h2>
      <p className="mt-4 max-w-4xl text-[15px] leading-8 text-[#c6c6d0]">
        The animated bar chart shows how repository popularity changes over time for the selected metric.
      </p>

      <div className="mt-6">
        <MetricTabs metric={metric} onChange={setMetric} />
      </div>

      <div className="mt-4 flex justify-end">
        {data?.sql ? <ShowSQLInline sql={data.sql} explainUrl={explainPath} /> : loading ? <LoadingSkeleton className="h-8 w-24 rounded-xl" /> : null}
      </div>

      {loading && <TrendChartSkeleton height={460} showControls />}
      {Boolean(error) && <div className="py-6 text-sm text-[#ffb1ab]">Unable to load trend data.</div>}

      {!loading && !error && timeline.frames.length > 0 && (
        <div className="mt-4">
          <LazyECharts option={option} style={{ width: '100%', height: 460 }} notMerge={false} lazyUpdate theme="dark" />
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={() => {
                if (playing) {
                  setPlaying(false);
                  return;
                }

                setCurrentIndex(0);
                setPlaying(true);
              }}
              className="inline-flex h-8 items-center rounded-md border border-white/10 px-3 text-sm text-[#c6c6d0] hover:bg-white/5 hover:text-white"
            >
              {playing ? 'Pause' : 'Play'}
            </button>
            <span className="text-sm text-[#7c7c7c]">{formatMonth(timeline.months[currentIndex])}</span>
            <input
              type="range"
              min={0}
              max={Math.max(0, timeline.months.length - 1)}
              value={currentIndex}
              onChange={(event) => {
                setPlaying(false);
                setCurrentIndex(Number(event.target.value));
              }}
              className="flex-1 accent-[#f7df83]"
            />
          </div>
        </div>
      )}

      {hasLoaded && !loading && !error && timeline.frames.length === 0 && <div className="py-10 text-center text-[#7c7c7c]">No data available.</div>}
    </section>
  );
}

function HistoricalTrendSection({ collectionId, collectionName }: { collectionId: number; collectionName: string }) {
  const [metric, setMetric] = useMetricFromUrl('historical-trending');
  const dataPath = getCollectionHistoryPath(collectionId, metric);
  const explainPath = getCollectionHistoryExplainPath(collectionId, metric);
  const { data, loading, hasLoaded, error } = useCollectionApi<CollectionQueryResponse<HistoryRow>>(dataPath);
  const rows = data?.data ?? [];

  const topSeries = useMemo(() => {
    if (rows.length === 0) {
      return { months: [] as string[], repoNames: [] as string[], entries: [] as HistoryRow[] };
    }

    const latestMonth = rows.reduce((latest, row) => (row.event_month > latest ? row.event_month : latest), '');
    const topNames = rows
      .filter((row) => row.event_month === latestMonth)
      .sort((left, right) => right.total - left.total)
      .slice(0, 10)
      .map((row) => row.repo_name);
    const topNameSet = new Set(topNames);

    return {
      months: [...new Set(rows.map((row) => row.event_month))].sort(),
      repoNames: topNames,
      entries: rows.filter((row) => topNameSet.has(row.repo_name)),
    };
  }, [rows]);

  const option = useMemo<EChartsOption>(() => {
    if (topSeries.entries.length === 0) {
      return {} as EChartsOption;
    }

    return {
      backgroundColor: 'transparent',
      grid: { left: 60, right: 24, top: 54, bottom: 44 },
      xAxis: {
        type: 'category',
        data: topSeries.months.map((month) => formatMonth(month)),
        axisLabel: { color: '#98a1b3', rotate: 45 },
        axisLine: { lineStyle: { color: '#475067' } },
      },
      yAxis: {
        type: 'value',
        axisLabel: { color: '#98a1b3', formatter: (value: number) => formatCompactNumber(value) },
        splitLine: { lineStyle: { color: 'rgba(255,255,255,0.08)' } },
      },
      legend: {
        type: 'scroll',
        top: 0,
        textStyle: { color: '#d0d5dd', fontSize: 11 },
        data: topSeries.repoNames,
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#1f2230',
        borderColor: 'rgba(255,255,255,0.08)',
        textStyle: { color: '#f8fafc' },
      },
      series: topSeries.repoNames.map((repoName, index) => ({
        name: repoName,
        type: 'line',
        showSymbol: false,
        smooth: false,
        lineStyle: { width: 2, color: COLORS[index % COLORS.length] },
        itemStyle: { color: COLORS[index % COLORS.length] },
        data: topSeries.months.map((month) => {
          const row = topSeries.entries.find((entry) => entry.repo_name === repoName && entry.event_month === month);
          return row ? row.total : null;
        }),
      })),
      title: {
        text: `${collectionName} · Current top repositories`,
        left: 'center',
        top: 12,
        textStyle: { color: '#f8fafc', fontSize: 14, fontWeight: 600 },
      },
    } as EChartsOption;
  }, [collectionName, topSeries.entries, topSeries.months, topSeries.repoNames]);

  return (
    <section>
      <h2 className="text-[2rem] font-semibold leading-tight text-[#f7df83] sm:text-[2.15rem]">
        Historical Trending of Top 10
      </h2>
      <p className="mt-4 max-w-4xl text-[15px] leading-8 text-[#c6c6d0]">
        The line chart compares the historical popularity of the current top repositories under the selected metric.
      </p>

      <div className="mt-6">
        <MetricTabs metric={metric} onChange={setMetric} />
      </div>

      <div className="mt-4 flex justify-end">
        {data?.sql ? <ShowSQLInline sql={data.sql} explainUrl={explainPath} /> : loading ? <LoadingSkeleton className="h-8 w-24 rounded-xl" /> : null}
      </div>

      {loading && <TrendChartSkeleton height={500} />}
      {Boolean(error) && <div className="py-6 text-sm text-[#ffb1ab]">Unable to load trendlines.</div>}

      {!loading && !error && topSeries.entries.length > 0 && (
        <div className="mt-4">
          <LazyECharts option={option} style={{ width: '100%', height: 500 }} notMerge lazyUpdate theme="dark" />
        </div>
      )}

      {hasLoaded && !loading && !error && topSeries.entries.length === 0 && <div className="py-10 text-center text-[#7c7c7c]">No data available.</div>}
    </section>
  );
}

// --- URL param <-> metric mapping ---
const URL_TO_METRIC: Record<string, CollectionMetric> = {
  stars: 'stars',
  prs: 'pull-requests',
  'pull-requests': 'pull-requests',
  'pr-creators': 'pull-request-creators',
  'pull-request-creators': 'pull-request-creators',
  issues: 'issues',
};

const METRIC_TO_URL: Record<CollectionMetric, string> = {
  stars: 'stars',
  'pull-requests': 'prs',
  'pull-request-creators': 'pr-creators',
  issues: 'issues',
};

function parseMetricParam(value: string | null): CollectionMetric {
  if (!value) return 'stars';
  return URL_TO_METRIC[value] ?? 'stars';
}

function useMetricFromUrl(paramName: string): [CollectionMetric, (m: CollectionMetric) => void] {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [metric, setMetricState] = useState<CollectionMetric>(() =>
    parseMetricParam(searchParams.get(paramName)),
  );

  const setMetric = useCallback(
    (m: CollectionMetric) => {
      setMetricState(m);
      const params = new URLSearchParams(searchParams.toString());
      params.set(paramName, METRIC_TO_URL[m]);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [paramName, pathname, router, searchParams],
  );

  return [metric, setMetric];
}

export function CollectionTrends({ collection }: { collection: Collection }) {
  return (
    <div className="mx-auto max-w-[1100px] px-6 py-8 sm:px-8">
      <CollectionPageHeader
        title={`${collection.name} - Popularity Trends`}
        description="The following dynamic charts show the popularity trends of GitHub repositories in this collection. You can display the popularity of repositories based on the number of stars, pull requests, pull request creators, and issues."
      />

      <div className="mt-6">
        <BarChartRaceSection collectionId={collection.id} collectionName={collection.name} />
        <HistoricalTrendSection collectionId={collection.id} collectionName={collection.name} />
      </div>
    </div>
  );
}
