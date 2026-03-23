'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import format from 'human-format';
import {
  ArrowDown,
  ArrowUp,
  BarChart3,
  CircleDot,
  GitPullRequest,
  Inbox,
  Pencil,
  Star,
  UserRound,
} from 'lucide-react';
import type { EChartsOption } from 'echarts';
import ShareButtons from '@/components/ShareButtons';
import { ShowSQLInline } from '@/components/Analyze/ShowSQL';
import { ExportButton, downloadCsv } from '@/components/ui/export-button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  collectionHistoryDimensions,
  collectionRankingDimensions,
  COLLECTION_CONFIGS_REPO_URL,
  getCollectionHistoryRankExplainPath,
  getCollectionHistoryRankPath,
  getCollectionRankingExplainPath,
  getCollectionRankingPath,
  toCollectionSlug,
  type CollectionMetric,
  type CollectionRankRange,
  type CollectionRankingMetric,
} from '@/lib/collections';
import { type CollectionQueryResponse, useCollectionApi } from '@/lib/collections-client';
import { cn } from '@/lib/utils';
import type { Collection } from '@/utils/api';

const LazyECharts = dynamic(() => import('@/components/Analyze/EChartsWrapper'), { ssr: false });
const monthFormatter = new Intl.DateTimeFormat(['en-US'], {
  month: 'short',
  year: 'numeric',
});

type RankingRow = {
  repo_id: number;
  repo_name: string;
  total: number;
  last_period_total?: number;
  last_period_rank?: number;
  last_2nd_period_total?: number;
  last_2nd_period_rank?: number;
  total_pop?: number;
  rank_pop?: number;
  current_month_total?: number;
  current_month_rank?: number;
  current_month?: string;
  last_month_total?: number;
  last_month_rank?: number;
  last_month?: string;
  total_mom?: number;
  rank_mom?: number;
};

type HistoryRankRow = {
  repo_name: string;
  event_year: number;
  rank: number;
};

const RANK_COLORS = [
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

function formatDiffNumber(value: number) {
  return Math.abs(value).toFixed(1).replace(/[.,]0$/, '');
}

function formatMetricNumber(value: number | undefined) {
  if (value == null) {
    return '--';
  }
  return new Intl.NumberFormat('en-US').format(value);
}

function formatLifetimeTotal(value: number | undefined) {
  if (value == null) {
    return '--';
  }
  return format(value, { separator: '' });
}

function formatTableTitle(range: CollectionRankRange) {
  return range === 'month' ? 'Month-to-Month' : 'Last 28 days';
}

function InlineDiff({
  value,
  suffix,
  reverse = false,
}: {
  value: number | undefined;
  suffix?: string;
  reverse?: boolean;
}) {
  if (!value) {
    return null;
  }

  const isPositive = reverse ? value < 0 : value > 0;
  const Icon = isPositive ? ArrowUp : ArrowDown;

  return (
    <span className={cn('ml-1 inline-flex items-center gap-0.5 text-[14px]', isPositive ? 'text-[#52ff52]' : 'text-[#e30c34]')}>
      <Icon className="h-3 w-3" />
      {formatDiffNumber(value)}
      {suffix}
    </span>
  );
}

const collectionMetricIcons: Record<CollectionMetric, React.ComponentType<{ className?: string }>> = {
  stars: Star,
  'pull-requests': GitPullRequest,
  'pull-request-creators': PullRequestCreatorsIcon,
  issues: CircleDot,
};

function CollectionPageHeader({
  title,
  description,
  collectionName,
}: {
  title: string;
  description: string;
  collectionName: string;
}) {
  const slug = toCollectionSlug(collectionName);

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
      <div className="mt-4 flex flex-wrap items-center gap-4">
        <h1 className="text-[2.3rem] font-semibold leading-tight text-[#f7df83] sm:text-[2.7rem]">
          {title}
        </h1>
        <ShareButtons
          url={`/collections/${slug}`}
          title={`Check out the ${collectionName} collection on OSSInsight — top open source projects ranked by stars, PRs, and issues`}
          hashtags={['opensource', 'github']}
        />
      </div>
      <p className="mt-4 max-w-4xl text-[16px] leading-7 text-[#7c7c7c]">{description}</p>
    </header>
  );
}

function CollectionMetricTabs<TMetric extends string>({
  value,
  options,
  onChange,
}: {
  value: TMetric;
  options: Array<{ key: TMetric; title: string }>;
  onChange: (metric: TMetric) => void;
}) {
  return (
    <Tabs value={value} onValueChange={(nextValue) => onChange(nextValue as TMetric)}>
      <TabsList className="gap-7">
        {options.map((option) => {
          const Icon = collectionMetricIcons[option.key as CollectionMetric];

          return (
            <TabsTrigger key={option.key} value={option.key}>
              <Icon className="h-4 w-4" />
              {option.title}
            </TabsTrigger>
          );
        })}
      </TabsList>
    </Tabs>
  );
}

function LoadingSkeleton({ className, ...props }: React.ComponentProps<typeof Skeleton>) {
  return <Skeleton className={cn('bg-white/[0.08]', className)} {...props} />;
}

function RankingTableSkeleton({ isMonthView }: { isMonthView: boolean }) {
  return (
    <div className="mt-4">
      <LoadingSkeleton className="mx-auto h-4 w-52" />

      <div className="mt-4 overflow-x-auto">
        <Table className="min-w-[860px] border-collapse">
          <TableHeader className="[&_tr]:border-b-[#222]">
            <TableRow className="border-b border-[#222] hover:bg-transparent">
              <TableHead className="h-12 px-4"><LoadingSkeleton className="h-6 w-28" /></TableHead>
              {isMonthView && (
                <TableHead className="h-12 px-4"><LoadingSkeleton className="h-6 w-28" /></TableHead>
              )}
              <TableHead className="h-12 px-4"><LoadingSkeleton className="h-6 w-32" /></TableHead>
              <TableHead className="h-12 px-4"><LoadingSkeleton className="h-6 w-24" /></TableHead>
              <TableHead className="h-12 px-4 text-right"><LoadingSkeleton className="ml-auto h-6 w-20" /></TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {Array.from({ length: 8 }).map((_, index) => (
              <TableRow key={index} className="border-b border-[#222] hover:bg-transparent">
                <TableCell className="px-4 py-3"><LoadingSkeleton className="h-5 w-12" /></TableCell>
                {isMonthView && (
                  <TableCell className="px-4 py-3"><LoadingSkeleton className="h-5 w-12" /></TableCell>
                )}
                <TableCell className="px-4 py-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <LoadingSkeleton className="size-5 rounded-full" />
                    <LoadingSkeleton className="h-5 w-56 max-w-full" />
                  </div>
                </TableCell>
                <TableCell className="px-4 py-3"><LoadingSkeleton className="h-5 w-24" /></TableCell>
                <TableCell className="px-4 py-3"><LoadingSkeleton className="ml-auto h-5 w-20" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function ChartSkeleton({ height }: { height: number }) {
  return (
    <div className="mt-4">
      <div className="mb-4 flex flex-wrap gap-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <LoadingSkeleton key={index} className="h-5 w-28 rounded-full" />
        ))}
      </div>
      <LoadingSkeleton className="w-full rounded-2xl" style={{ height }} />
    </div>
  );
}

function getCompactRankPosition(rows: HistoryRankRow[]) {
  const cache = new Map<number, number>();
  const ranks = new Set<number>();
  let maxRank = 0;

  rows.forEach((row) => {
    ranks.add(row.rank);
    maxRank = Math.max(maxRank, row.rank);
  });

  let length = 0;
  let offset = 0.2;

  for (let rank = 1; rank <= maxRank; rank += 1) {
    if (ranks.has(rank)) {
      length += 1;
      offset = 0.2;
    } else {
      length += offset;
      offset *= 0.5;
    }

    cache.set(rank, length);
  }

  return {
    position(rank: number) {
      return cache.get(rank) ?? rank;
    },
    max: length,
  };
}

function MonthlyRankingSection({ collectionId, initialRankingData }: { collectionId: number; initialRankingData?: CollectionQueryResponse<RankingRow> | null }) {
  const [metric, setMetric] = useState<CollectionRankingMetric>('stars');
  const [range, setRange] = useState<CollectionRankRange>('last-28-days');
  const dataPath = getCollectionRankingPath(collectionId, metric, range);
  const explainPath = getCollectionRankingExplainPath(collectionId, metric, range);
  // Use server-provided initial data for default tab (stars + last-28-days)
  const isDefaultTab = metric === 'stars' && range === 'last-28-days';
  const { data, loading, hasLoaded, error } = useCollectionApi<CollectionQueryResponse<RankingRow>>(
    dataPath,
    true,
    isDefaultTab && initialRankingData ? initialRankingData : undefined,
  );
  const rows = data?.data ?? [];
  const activeMetric = collectionRankingDimensions.find((item) => item.key === metric);
  const isMonthView = range === 'month';

  return (
    <section>
      <h2 className="text-[2rem] font-semibold leading-tight text-[#f7df83] sm:text-[2.15rem]">
        Last 28 Days / Month-to-Month Ranking
      </h2>
      <p className="mt-4 max-w-4xl text-[15px] leading-8 text-[#c6c6d0]">
        The following table ranks repositories using three metrics: stars, pull requests, and issues. The table compares last 28 days or the most recent two months of data and indicates whether repositories are moving up or down the rankings.
      </p>

      <div className="mt-6 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <CollectionMetricTabs value={metric} options={collectionRankingDimensions} onChange={setMetric} />

        <div className="inline-flex w-fit overflow-hidden rounded-md border border-[#8c7340] bg-[#121212]/70 p-0.5">
          {([
            ['last-28-days', 'Last 28 Days'],
            ['month', 'Month-to-Month'],
          ] as const).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setRange(value)}
              className={cn(
                'px-4 py-1.5 text-[13px] font-medium transition',
                range === value ? 'bg-[#f7df83] text-[#151515]' : 'text-[#f7df83] hover:bg-[#f7df83]/10',
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        {data?.sql ? <ShowSQLInline sql={data.sql} explainUrl={explainPath} /> : loading ? <LoadingSkeleton className="h-8 w-24 rounded-xl" /> : null}
      </div>

      {loading && <RankingTableSkeleton isMonthView={isMonthView} />}
      {Boolean(error) && <div className="py-6 text-sm text-[#ffb1ab]">Unable to load ranking data.</div>}

      {!loading && !error && rows.length > 0 && (
        <div className="mt-4">
          <div className="flex items-center justify-center gap-2">
            <h3 className="text-center text-[14px] font-semibold text-white">
              {formatTableTitle(range)} Ranking - {activeMetric?.title}
            </h3>
            <ExportButton
              options={[{
                label: 'Download as CSV',
                onClick: () => {
                  const headers = isMonthView
                    ? [formatMonth(rows[0]?.current_month), formatMonth(rows[0]?.last_month), 'Repository', activeMetric?.title ?? '', 'Total']
                    : ['Last 28 Days Rank', 'Repository', activeMetric?.title ?? '', 'Total'];
                  const csvRows = rows.map((row) => {
                    const currentTotal = isMonthView ? row.current_month_total : row.last_period_total;
                    const currentRank = isMonthView ? row.current_month_rank : row.last_period_rank;
                    const base = [String(currentRank ?? ''), row.repo_name, String(currentTotal ?? ''), String(row.total ?? '')];
                    if (isMonthView) {
                      const previousRank = row.last_month_rank;
                      return [String(currentRank ?? ''), String(previousRank ?? ''), row.repo_name, String(currentTotal ?? ''), String(row.total ?? '')];
                    }
                    return base;
                  });
                  downloadCsv(headers, csvRows, `collection-ranking-${metric}-${range}.csv`);
                },
              }]}
            />
          </div>

          <div className="mt-4 overflow-x-auto">
            <Table className="min-w-[860px] border-collapse">
              <TableHeader className="[&_tr]:border-b-[#222]">
                <TableRow className="border-b border-[#222] hover:bg-transparent">
                  <TableHead className="h-12 px-4 text-[20px] font-bold text-white">
                    {isMonthView ? formatMonth(rows[0]?.current_month) : 'Last 28 Days'}
                  </TableHead>
                  {isMonthView && (
                    <TableHead className="h-12 px-4 text-[20px] font-bold text-white">
                      {formatMonth(rows[0]?.last_month)}
                    </TableHead>
                  )}
                  <TableHead className="h-12 px-4 text-[20px] font-bold text-white">Repository</TableHead>
                  <TableHead className="h-12 px-4 text-[20px] font-bold text-white">
                    {activeMetric?.title}
                  </TableHead>
                  <TableHead className="h-12 px-4 text-right text-[20px] font-bold text-[#7c7c7c]">
                    Total
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {rows.map((row) => {
                  const currentTotal = isMonthView ? row.current_month_total : row.last_period_total;
                  const currentRank = isMonthView ? row.current_month_rank : row.last_period_rank;
                  const previousRank = isMonthView ? row.last_month_rank : row.last_2nd_period_rank;
                  const delta = isMonthView ? row.total_mom : row.total_pop;
                  const rankDelta = isMonthView ? row.rank_mom : row.rank_pop;
                  const owner = row.repo_name.split('/')[0] ?? row.repo_name;

                  return (
                    <TableRow key={row.repo_id} className="border-b border-[#222] hover:bg-transparent">
                      <TableCell className="px-4 py-2 text-[18px] font-bold text-white">
                        {currentRank ?? '--'}
                        <InlineDiff value={rankDelta} reverse />
                      </TableCell>
                      {isMonthView && (
                        <TableCell className="px-4 py-2 text-[18px] font-bold text-white">
                          {previousRank ?? '--'}
                        </TableCell>
                      )}
                      <TableCell className="px-4 py-2">
                        <div className="flex min-w-0 items-center gap-2">
                          <img
                            src={`https://github.com/${owner}.png`}
                            alt=""
                            aria-hidden="true"
                            width={20}
                            height={20}
                            loading="lazy"
                            className="h-5 w-5 rounded-full"
                          />
                          <Link
                            href={`/analyze/${row.repo_name}`}
                            className="site-link truncate text-[16px]"
                          >
                            {row.repo_name}
                          </Link>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-2 text-[18px] font-bold text-white">
                        {formatMetricNumber(currentTotal)}
                        <InlineDiff value={delta} suffix="%" />
                      </TableCell>
                      <TableCell className="px-4 py-2 text-right text-[18px] text-[#7c7c7c]">
                        {formatLifetimeTotal(row.total)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {hasLoaded && !loading && !error && rows.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <Inbox className="h-10 w-10 text-[#555]" />
          <h3 className="text-sm font-medium text-[#7c7c7c]">No ranking data yet</h3>
          <p className="max-w-sm text-sm text-[#555]">Ranking data for this collection will appear once repositories have enough activity to compare.</p>
        </div>
      )}
    </section>
  );
}

function HistoryRankSection({ collectionName, collectionId }: { collectionName: string; collectionId: number }) {
  const [metric, setMetric] = useState<CollectionMetric>('stars');
  const dataPath = getCollectionHistoryRankPath(collectionId, metric);
  const explainPath = getCollectionHistoryRankExplainPath(collectionId, metric);
  const { data, loading, hasLoaded, error } = useCollectionApi<CollectionQueryResponse<HistoryRankRow>>(dataPath);
  const rows = data?.data ?? [];

  const { option, height } = useMemo(() => {
    if (rows.length === 0) {
      return { option: {} as EChartsOption, height: 520 };
    }

    const repoNames = [...new Set(rows.map((row) => row.repo_name))];
    const years = [...new Set(rows.map((row) => row.event_year))].sort((left, right) => left - right);
    const compact = getCompactRankPosition(rows);

    return {
      height: Math.max(500, repoNames.length * 36 + 128),
      option: {
        animation: true,
        animationDuration: 1200,
        animationDurationUpdate: 900,
        animationEasing: 'cubicOut',
        animationEasingUpdate: 'cubicInOut',
        backgroundColor: 'transparent',
        grid: { left: 40, right: 210, top: 28, bottom: 26, containLabel: false },
        xAxis: {
          type: 'category',
          position: 'top',
          boundaryGap: ['8%', '6%'],
          data: years.map(String),
          axisLabel: {
            color: '#7c7c7c',
            fontSize: 13,
            interval: 0,
            hideOverlap: false,
            showMinLabel: true,
            showMaxLabel: true,
            margin: 8,
          },
          axisLine: {
            lineStyle: {
              color: 'rgba(255,255,255,0.18)',
            },
          },
          axisTick: { show: false },
          splitLine: { show: false },
        },
        yAxis: {
          type: 'value',
          reverse: true,
          min: 0.5,
          max: Math.max(compact.max + 0.5, 1.5),
          axisLabel: { show: false },
          axisLine: { show: false },
          axisTick: { show: false },
          splitLine: { show: false },
        },
        tooltip: {
          show: false,
        },
        series: repoNames.map((repoName, index) => {
          const repoRows = rows.filter((row) => row.repo_name === repoName);
          const color = RANK_COLORS[index % RANK_COLORS.length];

          return {
            type: 'line',
            name: repoName,
            animationDuration: 1100,
            animationDurationUpdate: 820,
            animationEasing: 'cubicOut',
            animationEasingUpdate: 'cubicInOut',
            animationDelay: index * 80,
            animationDelayUpdate: index * 24,
            data: years.map((year) => {
              const row = repoRows.find((item) => item.event_year === year);
              if (!row) {
                return null;
              }

              return {
                value: compact.position(row.rank),
                rawRank: row.rank,
              };
            }),
            connectNulls: true,
            lineStyle: {
              width: 5,
              color,
              cap: 'round',
              join: 'round',
            },
            itemStyle: {
              color,
              borderColor: `${color}80`,
              borderWidth: 4,
            },
            symbol: 'circle',
            symbolSize: 18,
            showSymbol: true,
            label: {
              show: true,
              position: 'inside',
              color: '#ffffff',
              fontSize: 10,
              fontWeight: 700,
              formatter: (params: any) => params.data?.rawRank ?? '',
            },
            endLabel: {
              show: true,
              formatter: '{a}',
              color,
              fontSize: 13,
              distance: 12,
            },
            labelLayout: {
              moveOverlap: 'shiftY',
            },
            emphasis: {
              focus: 'series',
            },
          };
        }),
      } as EChartsOption,
    };
  }, [rows]);

  return (
    <section className="mt-14 sm:mt-16">
      <h2 className="text-[2rem] font-semibold leading-tight text-[#f7df83] sm:text-[2.15rem]">
        Year-to-year Ranking
      </h2>
      <p className="mt-4 max-w-4xl text-[15px] leading-8 text-[#c6c6d0]">
        The following pipeline chart shows how repo rankings have changed year to year since 2011. Repos are ranked by stars, pull requests, pull request creators, and issues.
      </p>

      <div className="mt-6">
        <CollectionMetricTabs value={metric} options={collectionHistoryDimensions} onChange={setMetric} />
      </div>

      <div className="mt-4 flex justify-end">
        {data?.sql ? <ShowSQLInline sql={data.sql} explainUrl={explainPath} /> : loading ? <LoadingSkeleton className="h-8 w-24 rounded-xl" /> : null}
      </div>

      {loading && <ChartSkeleton height={520} />}
      {Boolean(error) && <div className="py-6 text-sm text-[#ffb1ab]">Unable to load ranking history.</div>}

      {!loading && !error && rows.length > 0 && (
        <div className="mt-4">
          <LazyECharts
            option={{
              ...option,
              title: {
                text: `${collectionName} - ${collectionHistoryDimensions.find((item) => item.key === metric)?.title ?? ''}`,
                left: 'center',
                top: 0,
                textStyle: {
                  color: 'transparent',
                  fontSize: 1,
                },
              },
            }}
            style={{ width: '100%', height }}
            notMerge
            lazyUpdate
            theme="dark"
          />
        </div>
      )}

      {hasLoaded && !loading && !error && rows.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <BarChart3 className="h-10 w-10 text-[#555]" />
          <h3 className="text-sm font-medium text-[#7c7c7c]">No historical ranking data</h3>
          <p className="max-w-sm text-sm text-[#555]">Year-to-year ranking history will appear as data accumulates over time.</p>
        </div>
      )}
    </section>
  );
}

export function CollectionDetail({ collection, initialRankingData }: { collection: Collection; initialRankingData?: CollectionQueryResponse<RankingRow> | null }) {
  return (
    <div className="mx-auto max-w-[1100px] px-6 py-8 sm:px-8">
      <CollectionPageHeader
        title={`${collection.name} - Ranking`}
        description="Last 28 days / Monthly ranking of repos in this collection by stars, pull requests, issues. Historical Ranking by Popularity."
        collectionName={collection.name}
      />

      <div className="mt-6">
        <MonthlyRankingSection collectionId={collection.id} initialRankingData={initialRankingData} />
        <HistoryRankSection collectionId={collection.id} collectionName={collection.name} />
      </div>

      <aside aria-label="Related pages" className="mt-12 border-t border-[#2a2a2a] pt-6">
        <nav className="flex flex-wrap items-center gap-4 text-sm text-[#7c7c7c]">
          <Link href="/trending" className="transition-colors hover:text-[#f7df83]">
            Trending Repos →
          </Link>
          <span className="text-[#333]">·</span>
          <Link href="/languages" className="transition-colors hover:text-[#f7df83]">
            Browse by Language →
          </Link>
          <span className="text-[#333]">·</span>
          <Link href="/collections" className="transition-colors hover:text-[#f7df83]">
            All Collections →
          </Link>
        </nav>
      </aside>
    </div>
  );
}
function PullRequestCreatorsIcon({ className }: { className?: string }) {
  return (
    <span className={cn('relative inline-flex', className)}>
      <UserRound className="h-4 w-4" />
      <GitPullRequest className="absolute -bottom-0.5 -right-1 h-2.5 w-2.5" />
    </span>
  );
}
