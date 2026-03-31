'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import Analyze from '@/components/Analyze/Analyze';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { ScrollspySectionWrapper } from '@/components/Scrollspy/SectionWrapper';
import { useAnalyzeChartContext, useAnalyzeContext } from '@/components/Analyze/context';

const RepoChart = dynamic(
  () => import('@/components/Analyze/Section/RepoChart'),
  { ssr: false },
);

// --- Top Contributors ---

function TopContributors() {
  const { data } = useAnalyzeChartContext<{ actor_login: string }>();
  const contributors = data.data?.data ?? [];

  return (
    <div>
      <div className="font-bold mb-2">Top 5 Contributors</div>
      <div className="flex gap-2">
        {contributors.map(({ actor_login }) => (
          <a
            key={actor_login}
            href={`https://github.com/${actor_login}`}
            target="_blank"
            rel="noopener noreferrer"
            title={actor_login}
          >
            <img
              src={`https://github.com/${actor_login}.png`}
              alt={actor_login}
              className="w-10 h-10 rounded-full hover:ring-2 ring-yellow-500 transition-shadow"
            />
          </a>
        ))}
      </div>
    </div>
  );
}

// --- Geo Map card ---

function MapCard() {
  const { data } = useAnalyzeChartContext<{ country_or_area: string; count: number; percentage: string }>();
  const items = (data.data?.data ?? []).slice(0, 5);

  return (
    <div className="h-full">
      <div className="font-bold mb-2">Stars Geo (Last 28 days)</div>
      <div className="space-y-1">
        {items.map((item, i) => (
          <div key={item.country_or_area} className="flex justify-between text-sm">
            <span className="text-gray-300">{i + 1}. {item.country_or_area}</span>
            <span className="text-gray-400">{item.percentage}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Section ---

export function RepositorySection() {
  const { repoId, repoName } = useAnalyzeContext();

  return (
    <ScrollspySectionWrapper anchor="repository" className="pt-8 pb-8">
      <SectionHeading>Repository Statistics - Last 28 Days</SectionHeading>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RepoChart
          title="Stars"
          name="@ossinsight/widget-analyze-repo-recent-stars"
          visualizer={() => import('@/charts/analyze/repo/recent-stars/visualization')}
          repoId={repoId!}
          repoName={repoName}
          style={{ height: 150 }}
        />
        <RepoChart
          title="Issues"
          name="@ossinsight/widget-analyze-repo-recent-issues"
          visualizer={() => import('@/charts/analyze/repo/recent-issues/visualization')}
          repoId={repoId!}
          repoName={repoName}
          style={{ height: 150 }}
        />
        <RepoChart
          title="Pull Requests"
          name="@ossinsight/widget-analyze-repo-recent-pull-requests"
          visualizer={() => import('@/charts/analyze/repo/recent-pull-requests/visualization')}
          repoId={repoId!}
          repoName={repoName}
          style={{ height: 150 }}
        />
        <RepoChart
          title="Commits"
          name="@ossinsight/widget-analyze-repo-recent-commits"
          visualizer={() => import('@/charts/analyze/repo/recent-commits/visualization')}
          repoId={repoId!}
          repoName={repoName}
          style={{ height: 150 }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <Analyze query="analyze-stars-map" params={{ period: 'last_28_days' }} title="Stars Geo">
          <MapCard />
        </Analyze>
        <Analyze query="analyze-recent-top-contributors" title="Top Contributors">
          <TopContributors />
        </Analyze>
      </div>
    </ScrollspySectionWrapper>
  );
}
