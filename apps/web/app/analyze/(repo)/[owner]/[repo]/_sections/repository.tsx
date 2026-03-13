'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import Analyze from '@/components/Analyze/Analyze';
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
              className="w-10 h-10 rounded-full hover:ring-2 ring-yellow-500 transition-all"
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

// --- Card wrapper ---

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`p-3 bg-gray-800/50 rounded-lg border border-gray-700/50 ${className}`}>{children}</div>;
}

// --- Section ---

export function RepositorySection() {
  const { repoId, repoName } = useAnalyzeContext();

  return (
    <section id="repository" className="pt-8 pb-8">
      <h2 className="text-2xl font-semibold text-white pb-3" style={{ scrollMarginTop: '140px' }}>
        Repository Statistics - Last 28 Days
      </h2>

      {/* 2x2 chart grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <Card>
          <div className="font-bold mb-1">Stars</div>
          <RepoChart
            name="@ossinsight/widget-analyze-repo-recent-stars"
            visualizer={() => import('@/charts/analyze/repo/recent-stars/visualization')}
            repoId={repoId!}
            repoName={repoName}
            style={{ height: 150 }}
          />
        </Card>

        <Card>
          <div className="font-bold mb-1">Issues</div>
          <RepoChart
            name="@ossinsight/widget-analyze-repo-recent-issues"
            visualizer={() => import('@/charts/analyze/repo/recent-issues/visualization')}
            repoId={repoId!}
            repoName={repoName}
            style={{ height: 150 }}
          />
        </Card>

        <Card>
          <div className="font-bold mb-1">Pull Requests</div>
          <RepoChart
            name="@ossinsight/widget-analyze-repo-recent-pull-requests"
            visualizer={() => import('@/charts/analyze/repo/recent-pull-requests/visualization')}
            repoId={repoId!}
            repoName={repoName}
            style={{ height: 150 }}
          />
        </Card>

        <Card>
          <div className="font-bold mb-1">Commits</div>
          <RepoChart
            name="@ossinsight/widget-analyze-repo-recent-commits"
            visualizer={() => import('@/charts/analyze/repo/recent-commits/visualization')}
            repoId={repoId!}
            repoName={repoName}
            style={{ height: 150 }}
          />
        </Card>
      </div>

      {/* Bottom row: Geo + Contributors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mt-3">
        <Analyze query="analyze-stars-map" params={{ period: 'last_28_days' }}>
          <Card>
            <MapCard />
          </Card>
        </Analyze>

        <Analyze query="analyze-recent-top-contributors">
          <Card>
            <TopContributors />
          </Card>
        </Analyze>
      </div>
    </section>
  );
}
