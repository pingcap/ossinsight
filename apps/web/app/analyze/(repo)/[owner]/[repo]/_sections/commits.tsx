'use client';

import React, { useState, useTransition } from 'react';
import dynamic from 'next/dynamic';
import { useAnalyzeContext } from '@/components/Analyze/context';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { ScrollspySectionWrapper } from '@/components/Scrollspy/SectionWrapper';
import { HLSelect, type SelectParamOption } from '@/components/ui/components/Selector/Select';

const RepoChart = dynamic(
  () => import('@/components/Analyze/Section/RepoChart'),
  { ssr: false },
);

// --- Period / Zone selectors ---

const PERIOD_OPTIONS: SelectParamOption<string>[] = [
  { key: 'last_1_year', title: 'Last 1 year' },
  { key: 'last_3_year', title: 'Last 3 years' },
  { key: 'all_times', title: 'All times' },
];

const ZONE_OPTIONS: SelectParamOption<number>[] = [];
for (let i = -12; i <= 13; i++) {
  ZONE_OPTIONS.push({ key: i, title: `UTC${i > 0 ? '+' : ''}${i}` });
}

const DEFAULT_ZONE_INDEX = Math.max(
  Math.min(Math.round(12 - new Date().getTimezoneOffset() / 60), ZONE_OPTIONS.length - 1),
  0,
);

// --- Section ---

export function CommitsSection() {
  const { repoId, repoName, comparingRepoId, comparingRepoName } = useAnalyzeContext();
  const [period, setPeriod] = useState(PERIOD_OPTIONS[0]);
  const [zone, setZone] = useState(ZONE_OPTIONS[DEFAULT_ZONE_INDEX]);
  const [isPending, startTransition] = useTransition();

  return (
    <ScrollspySectionWrapper anchor="commits" className="pt-8 pb-8">
      <SectionHeading>Commits</SectionHeading>

      <p className="pb-4 text-[16px] leading-7 text-[#7c7c7c]">
        The trend of the total number of commits/pushes per month in a repository since it was created.
        <br />
        * Note: A push action can include multiple commit actions.
      </p>
      <RepoChart
        title="Commits & Pushes History"
        name="@ossinsight/widget-analyze-repo-pushes-and-commits-per-month"
        visualizer={() => import('@/charts/analyze/repo/pushes-and-commits-per-month/visualization')}
        repoId={repoId!}
        repoName={repoName}
        vsRepoId={comparingRepoId}
        vsRepoName={comparingRepoName}
        style={{ height: 400 }}
      />

      <p className="pb-4 text-[16px] leading-7 text-[#7c7c7c]">
        The bars show the additions or deletions of code in Pull Requests monthly.
        <br />
        The line chart demonstrates the total lines of code in Pull Requests (additions + deletions).
      </p>
      <RepoChart
        title="Lines of code changed"
        name="@ossinsight/widget-analyze-repo-loc-per-month"
        visualizer={() => import('@/charts/analyze/repo/loc-per-month/visualization')}
        repoId={repoId!}
        repoName={repoName}
        vsRepoId={comparingRepoId}
        vsRepoName={comparingRepoName}
        style={{ height: 400 }}
      />

      <p className="pb-4 text-[16px] leading-7 text-[#7c7c7c]">
        The Heat Maps below describe the number of commit events that occur at a particular point of time.
      </p>
      <div className="flex gap-2 pb-6">
        <HLSelect<string>
          value={period}
          onChange={(v) => startTransition(() => setPeriod(v))}
          options={PERIOD_OPTIONS}
        />
        <HLSelect<number>
          value={zone}
          onChange={(v) => startTransition(() => setZone(v))}
          options={ZONE_OPTIONS}
        />
      </div>
      <RepoChart
        title="Commits Time Distribution"
        name="@ossinsight/widget-analyze-repo-commits-time-distribution"
        visualizer={() => import('@/charts/analyze/repo/commits-time-distribution/visualization')}
        repoId={repoId!}
        repoName={repoName}
        vsRepoId={comparingRepoId}
        vsRepoName={comparingRepoName}
        params={{ period: period.key, zone: zone.key }}
        style={{ height: comparingRepoId != null ? 300 : 250 }}
      />
    </ScrollspySectionWrapper>
  );
}
