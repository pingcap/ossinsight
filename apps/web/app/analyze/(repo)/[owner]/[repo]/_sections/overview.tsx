'use client';

import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useQuery } from '@tanstack/react-query';
import {
  CodeIcon,
  GitCommitIcon,
  IssueOpenedIcon,
  LawIcon,
  LinkExternalIcon,
  PeopleIcon,
  RepoForkedIcon,
  StarIcon,
} from '@primer/octicons-react';

import Analyze from '@/components/Analyze/Analyze';
import { useAnalyzeChartContext, useAnalyzeContext } from '@/components/Analyze/context';
import { queryAPI } from '@/utils/api';

const RepoChart = dynamic(
  () => import('@/components/Analyze/Section/RepoChart'),
  { ssr: false },
);

type OverviewData = {
  stars: number;
  commits: number;
  issues: number;
  pull_request_creators: number;
};

type CollectionItem = {
  id: number;
  name: string;
};

function formatValue(value: unknown): string {
  if (value == null) {
    return '-';
  }
  if (typeof value === 'number') {
    return value.toLocaleString();
  }
  return String(value);
}

function toCollectionSlug(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function SummaryTable() {
  const { repoInfo, comparingRepoInfo, repoName, comparingRepoName, comparingRepoId } = useAnalyzeContext();
  const { data, compareData } = useAnalyzeChartContext<OverviewData>();

  const mainData = data.data?.data?.[0];
  const vsData = compareData.data?.data?.[0];
  const hasVs = comparingRepoId != null;
  const loading = data.loading;

  const items = useMemo(() => [
    {
      label: 'Stars',
      value: mainData?.stars,
      vsValue: vsData?.stars,
      icon: <StarIcon fill="#FAC858" size={16} />,
    },
    {
      label: 'Commits',
      value: mainData?.commits,
      vsValue: vsData?.commits,
      icon: <GitCommitIcon fill="#D54562" size={16} />,
    },
    {
      label: 'Issues',
      value: mainData?.issues,
      vsValue: vsData?.issues,
      icon: <IssueOpenedIcon fill="#FDE494" size={16} />,
    },
    {
      label: 'Forks',
      value: repoInfo?.forks,
      vsValue: comparingRepoInfo?.forks,
      icon: <RepoForkedIcon fill="#E30C34" size={16} />,
      isStatic: true,
    },
    {
      label: 'PR Creators',
      value: mainData?.pull_request_creators,
      vsValue: vsData?.pull_request_creators,
      icon: <PeopleIcon fill="#F77C00" size={16} />,
    },
    {
      label: 'Language',
      value: repoInfo?.language,
      vsValue: comparingRepoInfo?.language,
      icon: <CodeIcon fill="#309CF2" size={16} />,
      isStatic: true,
    },
  ], [mainData, vsData, repoInfo, comparingRepoInfo]);

  return (
    <div className="h-full">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-[#323234]">
            <th className="pb-2 text-left text-[12px] font-normal text-[#8c8c8c]" />
            <th className="pb-2 text-right text-[12px] font-normal text-[#8c8c8c]">{repoName}</th>
            {hasVs ? (
              <th className="pb-2 text-right text-[12px] font-normal text-[#8c8c8c]">{comparingRepoName}</th>
            ) : null}
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.label} className="border-b border-[#2a2a2c] last:border-0">
              <td className="py-3 pr-4 text-[14px] text-[#d8d8d8]">
                <span className="inline-flex items-center gap-2">
                  <span className="inline-flex h-4 w-4 items-center justify-center">{item.icon}</span>
                  <span>{item.label}</span>
                </span>
              </td>
              <td className="py-3 text-right text-[28px] font-semibold leading-none text-[#e9eaee] tabular-nums">
                {loading && !item.isStatic ? (
                  <span className="inline-block h-6 w-16 animate-pulse rounded bg-[#343436]" />
                ) : (
                  formatValue(item.value)
                )}
              </td>
              {hasVs ? (
                <td className="py-3 pl-4 text-right text-[28px] font-semibold leading-none text-[#e9eaee] tabular-nums">
                  {loading && !item.isStatic ? (
                    <span className="inline-block h-6 w-16 animate-pulse rounded bg-[#343436]" />
                  ) : (
                    formatValue(item.vsValue)
                  )}
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MiniCard({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[6px] bg-[#242526] px-3 py-3">
      <div className="pb-1 text-[12px] font-medium text-[#8c8c8c]">{label}</div>
      {children}
    </div>
  );
}

function MonthlySummaryCard() {
  const { repoId } = useAnalyzeContext();

  return (
    <div className="h-full">
      <div className="mt-0 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-[20px] font-bold text-[#e9eaee]">Last 28 days Stats</h3>
        <a href="#repository" className="site-link text-[16px] no-underline">
          Compare with the previous period
        </a>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <MiniCard label="Stars">
          <RepoChart
            name="@ossinsight/widget-analyze-repo-recent-stars"
            visualizer={() => import('@/charts/analyze/repo/recent-stars/visualization')}
            repoId={repoId!}
            repoName=""
            style={{ height: 100 }}
          />
        </MiniCard>
        <MiniCard label="Pull Requests">
          <RepoChart
            name="@ossinsight/widget-analyze-repo-recent-pull-requests"
            visualizer={() => import('@/charts/analyze/repo/recent-pull-requests/visualization')}
            repoId={repoId!}
            repoName=""
            style={{ height: 100 }}
          />
        </MiniCard>
        <MiniCard label="Issues">
          <RepoChart
            name="@ossinsight/widget-analyze-repo-recent-issues"
            visualizer={() => import('@/charts/analyze/repo/recent-issues/visualization')}
            repoId={repoId!}
            repoName=""
            style={{ height: 100 }}
          />
        </MiniCard>
        <MiniCard label="Commits">
          <RepoChart
            name="@ossinsight/widget-analyze-repo-recent-commits"
            visualizer={() => import('@/charts/analyze/repo/recent-commits/visualization')}
            repoId={repoId!}
            repoName=""
            style={{ height: 100 }}
          />
        </MiniCard>
      </div>
    </div>
  );
}

export function OverviewSection() {
  const { repoName, repoInfo, repoId, comparingRepoId: vs, comparingRepoName, comparingRepoId } = useAnalyzeContext();

  const collectionsQuery = useQuery({
    queryKey: ['analyze', 'repo-collections', repoId],
    queryFn: () => queryAPI<CollectionItem>('get-repo-collections', { repoId }),
    enabled: repoId != null && vs == null,
    staleTime: 10 * 60 * 1000,
  });

  const collections = collectionsQuery.data?.data ?? [];

  return (
    <section id="overview" className="pb-8 pt-8">
      <div id="overview-main">
        {!vs && repoInfo ? (
          <>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex min-w-0 items-center gap-3">
                <span className="inline-flex items-center justify-center rounded-[4px] bg-white p-[2px]">
                  <img
                    width={48}
                    height={48}
                    src={`https://github.com/${repoName.split('/')[0]}.png`}
                    alt={repoName}
                    className="rounded-[3px]"
                  />
                </span>
                <h1 className="min-w-0 text-[32px] font-semibold leading-tight text-[#e9eaee]">
                  <a
                    href={`https://github.com/${repoName}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 hover:text-[#fbe593]"
                  >
                    <span className="truncate">{repoName}</span>
                    <LinkExternalIcon size={24} />
                  </a>
                </h1>
              </div>
            </div>

            {repoInfo.description ? (
              <p className="mt-3 text-[16px] leading-7 text-[#7c7c7c]">{repoInfo.description}</p>
            ) : null}

            {repoInfo.license ? (
              <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-[#4d4d4f] px-3 py-1 text-[12px] text-[#d8d8d8]">
                <LawIcon size={14} />
                <span>{repoInfo.license}</span>
              </div>
            ) : null}

            {collections.length > 0 ? (
              <div className="mt-3 flex flex-wrap items-center gap-2 text-[14px] text-[#7c7c7c]">
                <span>In Collection:</span>
                {collections.map((collection) => (
                  <a
                    key={collection.id}
                    href={`/collections/${toCollectionSlug(collection.name)}`}
                    className="inline-flex items-center rounded-full border border-[#4d4d4f] px-3 py-1 text-[12px] text-[#fbe593] transition hover:border-[#fbe593]/60 hover:text-[#fceeb4]"
                  >
                    {collection.name}
                  </a>
                ))}
              </div>
            ) : null}
          </>
        ) : null}

        <div className="mt-6 grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <div>
            <Analyze query="analyze-repo-overview">
              <SummaryTable />
            </Analyze>
          </div>
          <div>
            {vs ? (
              <RepoChart
                name="@ossinsight/widget-analyze-repo-stars-history"
                visualizer={() => import('@/charts/analyze/repo/stars-history/visualization')}
                repoId={repoId!}
                repoName={repoName}
                vsRepoId={comparingRepoId}
                vsRepoName={comparingRepoName}
                style={{ height: 350 }}
              />
            ) : (
              <MonthlySummaryCard />
            )}
          </div>
        </div>
      </div>

      {!vs ? (
        <>
          <h3
            id="stars-history"
            className="pb-2 pt-8 text-[24px] font-semibold text-[#e9eaee]"
            style={{ scrollMarginTop: '140px' }}
          >
            Stars History
          </h3>
          <p className="pb-4 text-[16px] leading-7 text-[#7c7c7c]">
            The growth trend and the specific number of stars since the repository was established.
          </p>
        </>
      ) : (
        <>
          <h3
            id="stars-history"
            className="pb-2 pt-8 text-[24px] font-semibold text-[#e9eaee]"
            style={{ scrollMarginTop: '140px' }}
          >
            Stars History
          </h3>
          <p className="pb-4 text-[16px] leading-7 text-[#7c7c7c]">
            The growth trend and the specific number of stars since the repository was established.
          </p>
        </>
      )}
      <RepoChart
        name="@ossinsight/widget-analyze-repo-stars-history"
        visualizer={() => import('@/charts/analyze/repo/stars-history/visualization')}
        repoId={repoId!}
        repoName={repoName}
        vsRepoId={comparingRepoId}
        vsRepoName={comparingRepoName}
        style={{ height: vs ? 400 : 300 }}
      />
    </section>
  );
}
