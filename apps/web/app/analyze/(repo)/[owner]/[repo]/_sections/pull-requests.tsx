'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import {
  GitPullRequestIcon,
  EyeIcon,
  PeopleIcon,
  PersonIcon,
} from '@primer/octicons-react';
import Analyze from '@/components/Analyze/Analyze';
import { useAnalyzeChartContext, useAnalyzeContext } from '@/components/Analyze/context';

const RepoChart = dynamic(
  () => import('@/components/Analyze/Section/RepoChart'),
  { ssr: false },
);

// --- PR Summary ---

type PrOverviewData = {
  pull_requests: number;
  pull_request_creators: number;
  pull_request_reviews: number;
  pull_request_reviewers: number;
};

function PrSummaryTable() {
  const { repoName, comparingRepoName, comparingRepoId } = useAnalyzeContext();
  const { data, compareData } = useAnalyzeChartContext<PrOverviewData>();
  const mainData = data.data?.data?.[0];
  const vsData = compareData.data?.data?.[0];
  const hasVs = comparingRepoId != null;
  const loading = data.loading;

  const items = [
    { label: 'Total PRs', value: mainData?.pull_requests, vsValue: vsData?.pull_requests, icon: <GitPullRequestIcon fill="#4ea1f3" size={16} /> },
    { label: 'Creators', value: mainData?.pull_request_creators, vsValue: vsData?.pull_request_creators, icon: <PeopleIcon fill="#f77c00" size={16} /> },
    { label: 'Reviews', value: mainData?.pull_request_reviews, vsValue: vsData?.pull_request_reviews, icon: <EyeIcon fill="#95a4fc" size={16} /> },
    { label: 'Reviewers', value: mainData?.pull_request_reviewers, vsValue: vsData?.pull_request_reviewers, icon: <PersonIcon fill="#7cc8ff" size={16} /> },
  ];

  return (
    <table className="w-full border-collapse">
      <thead>
        <tr className="border-b border-[#323234]">
          <th className="pb-2 text-left text-[12px] font-normal text-[#8c8c8c]" />
          <th className="pb-2 text-right text-[12px] font-normal text-[#8c8c8c]">{repoName}</th>
          {hasVs && <th className="pb-2 pl-4 text-right text-[12px] font-normal text-[#8c8c8c]">{comparingRepoName}</th>}
        </tr>
      </thead>
      <tbody>
        {items.map((item) => (
          <tr key={item.label} className="border-b border-[#2a2a2c] last:border-0">
            <td className="py-3 pr-4 text-[14px] text-[#d8d8d8] whitespace-nowrap">
              <span className="inline-flex items-center gap-2">
                <span className="inline-flex h-4 w-4 items-center justify-center">{item.icon}</span>
                <span>{item.label}</span>
              </span>
            </td>
            <td className="py-3 text-right text-[28px] font-semibold leading-none text-[#e9eaee] tabular-nums">
              {loading ? <span className="inline-block h-6 w-16 animate-pulse rounded bg-[#343436]" /> : (item.value?.toLocaleString() ?? '-')}
            </td>
            {hasVs && (
              <td className="py-3 pl-4 text-right text-[28px] font-semibold leading-none text-[#e9eaee] tabular-nums">
                {loading ? <span className="inline-block h-6 w-16 animate-pulse rounded bg-[#343436]" /> : (item.vsValue?.toLocaleString() ?? '-')}
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// --- Section ---

export function PullRequestsSection() {
  const { repoId, repoName, comparingRepoId, comparingRepoName } = useAnalyzeContext();
  const hasVs = comparingRepoId != null;

  return (
    <section id="pull-requests" className="pt-8 pb-8">
      <h2 className="text-2xl font-semibold text-white pb-3" style={{ scrollMarginTop: '140px' }}>
        Pull Requests
      </h2>

      <div className={hasVs ? 'max-w-[720px]' : 'max-w-[560px]'}>
        <Analyze query="analyze-repo-pr-overview">
          <PrSummaryTable />
        </Analyze>
      </div>

      <h3
        id="pr-history"
        className="mt-6 pb-2 text-[24px] font-semibold text-[#e9eaee]"
        style={{ scrollMarginTop: '140px' }}
      >
        Pull Request History
      </h3>
      <p className="pb-4 text-[16px] leading-7 text-[#7c7c7c]">
        We divide the size of Pull Request into six intervals, from xs to xxl (based on the changes of code lines).
        Learn more about{' '}
        <a
          href="https://github.com/kubernetes/kubernetes/labels?q=size"
          target="_blank"
          rel="noopener noreferrer"
          className="site-link"
        >
          PR size
        </a>.
      </p>
      <RepoChart
        name="@ossinsight/widget-analyze-repo-pull-requests-size"
        visualizer={() => import('@/charts/analyze/repo/pull-requests-size/visualization')}
        repoId={repoId!}
        repoName={repoName}
        vsRepoId={comparingRepoId}
        vsRepoName={comparingRepoName}
        style={{ height: 400 }}
      />

      <h3
        id="pr-time-cost"
        className="mt-6 pb-2 text-[24px] font-semibold text-[#e9eaee]"
        style={{ scrollMarginTop: '140px' }}
      >
        Pull Request Time Cost
      </h3>
      <p className="pb-4 text-[16px] leading-7 text-[#7c7c7c]">
        The time of a Pull Request from submitting to merging.
        <br />
        p25/p75: 25%/75% Pull Requests are merged within X minute/hour/day.
        <br />
        e.g. p25: 1h means 25% Pull Requests are merged within 1 hour.
      </p>
      <RepoChart
        name="@ossinsight/widget-analyze-repo-pull-request-open-to-merged"
        visualizer={() => import('@/charts/analyze/repo/pull-request-open-to-merged/visualization')}
        repoId={repoId!}
        repoName={repoName}
        vsRepoId={comparingRepoId}
        vsRepoName={comparingRepoName}
        style={{ height: 400 }}
      />
    </section>
  );
}
