'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import {
  IssueOpenedIcon,
  CommentDiscussionIcon,
  PeopleIcon,
  PersonIcon,
} from '@primer/octicons-react';
import Analyze from '@/components/Analyze/Analyze';
import { ScrollspySectionWrapper } from '@/components/Scrollspy/SectionWrapper';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { useAnalyzeChartContext, useAnalyzeContext } from '@/components/Analyze/context';

const RepoChart = dynamic(
  () => import('@/components/Analyze/Section/RepoChart'),
  { ssr: false },
);

// --- Issue Summary ---

type IssueOverviewData = {
  issues: number;
  issue_creators: number;
  issue_comments: number;
  issue_commenters: number;
};

function IssueSummaryTable() {
  const { repoName, comparingRepoName, comparingRepoId } = useAnalyzeContext();
  const { data, compareData } = useAnalyzeChartContext<IssueOverviewData>();
  const mainData = data.data?.data?.[0];
  const vsData = compareData.data?.data?.[0];
  const hasVs = comparingRepoId != null;
  const loading = data.loading;

  const items = [
    { label: 'Total Issues', value: mainData?.issues, vsValue: vsData?.issues, icon: <IssueOpenedIcon fill="#FDE494" size={16} /> },
    { label: 'Creators', value: mainData?.issue_creators, vsValue: vsData?.issue_creators, icon: <PeopleIcon fill="#f77c00" size={16} /> },
    { label: 'Comments', value: mainData?.issue_comments, vsValue: vsData?.issue_comments, icon: <CommentDiscussionIcon fill="#95a4fc" size={16} /> },
    { label: 'Commenters', value: mainData?.issue_commenters, vsValue: vsData?.issue_commenters, icon: <PersonIcon fill="#7cc8ff" size={16} /> },
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
            <td className="py-3 text-right text-[15px] font-medium leading-none text-[#e9eaee] tabular-nums">
              {loading ? <span className="inline-block h-6 w-16 animate-pulse rounded bg-[#343436]" /> : (item.value?.toLocaleString() ?? '-')}
            </td>
            {hasVs && (
              <td className="py-3 pl-4 text-right text-[15px] font-medium leading-none text-[#e9eaee] tabular-nums">
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

export function IssuesSection() {
  const { repoId, repoName, comparingRepoId, comparingRepoName } = useAnalyzeContext();
  const hasVs = comparingRepoId != null;

  return (
    <ScrollspySectionWrapper anchor="issues" className="pt-8 pb-8">
      <SectionHeading>Issues</SectionHeading>

      <div className={hasVs ? 'max-w-[720px]' : 'max-w-[560px]'}>
        <Analyze query="analyze-repo-issue-overview">
          <IssueSummaryTable />
        </Analyze>
      </div>

      <p className="pb-4 text-[16px] leading-7 text-[#7c7c7c]">
        The time of an issue from open to first-responded (exclude bots).
        <br />
        p25/p75: 25%/75% issues are responded within X minute/hour/day.
        <br />
        e.g. p25: 1h means 25% issues are responded within 1 hour.
      </p>
      <RepoChart
        title="Issue First Responded Time"
        name="@ossinsight/widget-analyze-repo-issue-open-to-first-responded"
        visualizer={() => import('@/charts/analyze/repo/issue-open-to-first-responded/visualization')}
        repoId={repoId!}
        repoName={repoName}
        vsRepoId={comparingRepoId}
        vsRepoName={comparingRepoName}
        style={{ height: 400 }}
      />

      <p className="pb-4 text-[16px] leading-7 text-[#7c7c7c]">
        Monthly opened/closed issues and the historical totals.
      </p>
      <RepoChart
        title="Issue History"
        name="@ossinsight/widget-analyze-repo-issue-opened-and-closed"
        visualizer={() => import('@/charts/analyze/repo/issue-opened-and-closed/visualization')}
        repoId={repoId!}
        repoName={repoName}
        vsRepoId={comparingRepoId}
        vsRepoName={comparingRepoName}
        style={{ height: 400 }}
      />
    </ScrollspySectionWrapper>
  );
}
