'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import {
  GitMergeIcon,
  IssueOpenedIcon,
  PersonIcon,
  StarIcon,
} from '@primer/octicons-react';
import Analyze from '@/components/Analyze/Analyze';
import { useAnalyzeChartContext, useAnalyzeContext } from '@/components/Analyze/context';
import { alpha2ToTitle } from '@/utils/geo';

const RepoChart = dynamic(
  () => import('@/components/Analyze/Section/RepoChart'),
  { ssr: false },
);

// --- Geo List ---

type LocationData = {
  country_or_area: string;
  count: number;
  percentage: string;
};

function formatPercent(value: unknown) {
  const num = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(num)) {
    return undefined;
  }
  return `${(num * 100).toFixed(1)}%`;
}

// --- Company List ---

type CompanyData = {
  company_name: string;
  stargazers?: number;
  issue_creators?: number;
  code_contributors?: number;
  proportion: string;
};

function CompareListHeader({
  left,
  right,
}: {
  left: string;
  right?: string;
}) {
  return (
    <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
      <div className="truncate px-2 text-[14px] text-[#c8c8c8]">
        <span className="mr-1 inline-block h-[10px] w-[10px] rounded-full bg-[#dd6b66]" />
        {left}
      </div>
      {right ? (
        <div className="truncate px-2 text-[14px] text-[#c8c8c8]">
          <span className="mr-1 inline-block h-[10px] w-[10px] rounded-full bg-[#759aa0]" />
          {right}
        </div>
      ) : null}
    </div>
  );
}

function DataListItem({
  name,
  percent,
  compact,
}: {
  name?: string;
  percent?: string;
  compact?: boolean;
}) {
  return (
    <div className="rounded-lg bg-[#1c1c1c]">
      <div className={`flex items-center justify-between ${compact ? 'px-2 py-2' : 'px-4 py-3'}`}>
        <div className="truncate pr-3 text-[12px] leading-4 text-[#e9eaee]">{name ?? '--'}</div>
        <div className="shrink-0 text-[12px] leading-4 text-[#8c8c8c]">{percent ?? ''}</div>
      </div>
    </div>
  );
}

function CompareDataList<T>({
  title,
  mainItems,
  vsItems,
  mainName,
  vsName,
  getName,
  getPercent,
  n = 10,
}: {
  title: string;
  mainItems: T[];
  vsItems: T[];
  mainName: string;
  vsName?: string;
  getName: (item: T) => string;
  getPercent: (item: T) => string | undefined;
  n?: number;
}) {
  const hasVs = Boolean(vsName);
  const rows = Array.from({ length: n });

  return (
    <div className="my-2 space-y-2">
      <div className="rounded-lg bg-[#2c2c2c] px-4 py-3">
        <div className="text-[14px] leading-4 text-[#c4c4c4]">Top {n} {title}</div>
      </div>
      {hasVs ? <CompareListHeader left={mainName} right={vsName} /> : null}
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        <div className="space-y-2">
          {rows.map((_, index) => {
            const item = mainItems[index];
            return (
              <DataListItem
                key={`main-${title}-${index}`}
                name={item ? getName(item) : undefined}
                percent={item ? getPercent(item) : undefined}
                compact={hasVs}
              />
            );
          })}
        </div>
        {hasVs ? (
          <div className="space-y-2">
            {rows.map((_, index) => {
              const item = vsItems[index];
              return (
                <DataListItem
                  key={`vs-${title}-${index}`}
                  name={item ? getName(item) : undefined}
                  percent={item ? getPercent(item) : undefined}
                  compact
                />
              );
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function GeoList({ n = 10 }: { n?: number }) {
  const { repoName, comparingRepoName } = useAnalyzeContext();
  const { data, compareData } = useAnalyzeChartContext<LocationData>();

  return (
    <CompareDataList
      title="Geo-Locations"
      n={n}
      mainItems={(data.data?.data ?? []).slice(0, n)}
      vsItems={(compareData.data?.data ?? []).slice(0, n)}
      mainName={repoName}
      vsName={comparingRepoName}
      getName={(item) => alpha2ToTitle(item.country_or_area)}
      getPercent={(item) => formatPercent(item.percentage)}
    />
  );
}

function CompanyList({ n = 10 }: { n?: number }) {
  const { repoName, comparingRepoName } = useAnalyzeContext();
  const { data, compareData } = useAnalyzeChartContext<CompanyData>();

  return (
    <CompareDataList
      title="Companies"
      n={n}
      mainItems={(data.data?.data ?? []).slice(0, n)}
      vsItems={(compareData.data?.data ?? []).slice(0, n)}
      mainName={repoName}
      vsName={comparingRepoName}
      getName={(item) => item.company_name}
      getPercent={(item) => formatPercent(item.proportion)}
    />
  );
}

// --- Tabs ---

const MAP_TABS = [
  { key: 'stars', label: 'Stargazers', extraParams: { period: 'all_times' } },
  { key: 'issue-creators', label: 'Issue Creators', extraParams: {} },
  { key: 'pull-request-creators', label: 'PR Creators', extraParams: {} },
] as const;

const COMPANY_TABS = [
  { key: 'stars', label: 'Stargazers', valueIndex: 'stargazers', queryKey: 'analyze-stars-company' },
  { key: 'issue-creators', label: 'Issue Creators', valueIndex: 'issue_creators', queryKey: 'analyze-issue-creators-company' },
  { key: 'pull-request-creators', label: 'PR Creators', valueIndex: 'code_contributors', queryKey: 'analyze-pull-request-creators-company' },
] as const;

// --- Section ---

export function PeopleSection() {
  const { repoId, repoName, comparingRepoName, comparingRepoId: vs } = useAnalyzeContext();
  const [mapTab, setMapTab] = useState(0);
  const [companyTab, setCompanyTab] = useState(0);

  const currentMapTab = MAP_TABS[mapTab];
  const currentCompanyTab = COMPANY_TABS[companyTab];

  return (
    <section id="people" className="pt-8 pb-8">
      <h2 className="text-2xl font-semibold text-white pb-3" style={{ scrollMarginTop: '140px' }}>
        People
      </h2>

      {/* Geographical Distribution */}
      <h3
        id="geo-distribution"
        className="mt-6 pb-2 text-[24px] font-semibold text-[#e9eaee]"
        style={{ scrollMarginTop: '140px' }}
      >
        Geographical Distribution
      </h3>
      <p className="pb-4 text-[16px] leading-7 text-[#7c7c7c]">
        Stargazers, Issue creators, and Pull Request creators&apos; geographical distribution around
        the world (analyzed with the public GitHub information).
      </p>
      <div className="mb-4 flex gap-1 border-b border-[#3a3a3a]">
        {MAP_TABS.map((tab, i) => (
          <button
            key={`map-${tab.key}`}
            className={`inline-flex items-center gap-2 px-4 py-2 text-sm transition-colors ${
              i === mapTab
                ? 'border-b-2 border-[var(--color-primary)] text-white'
                : 'text-[#8c8c8c] hover:text-[#d8d8d8]'
            }`}
            onClick={() => setMapTab(i)}
          >
            {tab.key === 'stars' ? <StarIcon size={18} /> : null}
            {tab.key === 'issue-creators' ? (
              <span className="relative inline-flex">
                <PersonIcon size={18} />
                <IssueOpenedIcon size={8} className="absolute -bottom-0.5 -right-0.5" />
              </span>
            ) : null}
            {tab.key === 'pull-request-creators' ? (
              <span className="relative inline-flex">
                <PersonIcon size={18} />
                <GitMergeIcon size={8} className="absolute -bottom-0.5 -right-0.5" />
              </span>
            ) : null}
            {tab.label}
          </button>
        ))}
      </div>
      <div key={`map-${currentMapTab.key}`} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
        <div className={vs != null ? 'md:col-span-8' : 'md:col-span-9'}>
          <RepoChart
            name="@ossinsight/widget-analyze-repo-stars-map"
            visualizer={() => import('@/charts/analyze/repo/stars-map/visualization')}
            repoId={repoId!}
            repoName={repoName}
            vsRepoId={vs}
            vsRepoName={comparingRepoName}
            params={{ activity: currentMapTab.key, ...currentMapTab.extraParams }}
            style={{ height: 500 }}
          />
        </div>
        <div className={vs != null ? 'md:col-span-4' : 'md:col-span-3'}>
          <Analyze
            query={`analyze-${currentMapTab.key}-map`}
            params={currentMapTab.extraParams as any}
            key={`geo-list-${currentMapTab.key}`}
          >
            <GeoList n={10} />
          </Analyze>
        </div>
      </div>

      {/* Companies */}
      <h3
        id="companies"
        className="mt-6 pb-2 text-[24px] font-semibold text-[#e9eaee]"
        style={{ scrollMarginTop: '140px' }}
      >
        Companies
      </h3>
      <p className="pb-4 text-[16px] leading-7 text-[#7c7c7c]">
        Company information about Stargazers, Issue creators, and Pull Request creators (analyzed
        with the public GitHub information).
      </p>
      <div className="mb-4 flex gap-1 border-b border-[#3a3a3a]">
        {COMPANY_TABS.map((tab, i) => (
          <button
            key={`company-${tab.key}`}
            className={`inline-flex items-center gap-2 px-4 py-2 text-sm transition-colors ${
              i === companyTab
                ? 'border-b-2 border-[var(--color-primary)] text-white'
                : 'text-[#8c8c8c] hover:text-[#d8d8d8]'
            }`}
            onClick={() => setCompanyTab(i)}
          >
            {tab.key === 'stars' ? <StarIcon size={18} /> : null}
            {tab.key === 'issue-creators' ? (
              <span className="relative inline-flex">
                <PersonIcon size={18} />
                <IssueOpenedIcon size={8} className="absolute -bottom-0.5 -right-0.5" />
              </span>
            ) : null}
            {tab.key === 'pull-request-creators' ? (
              <span className="relative inline-flex">
                <PersonIcon size={18} />
                <GitMergeIcon size={8} className="absolute -bottom-0.5 -right-0.5" />
              </span>
            ) : null}
            {tab.label}
          </button>
        ))}
      </div>
      <div key={`company-${currentCompanyTab.key}`} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
        <div className={vs != null ? 'md:col-span-8' : 'md:col-span-9'}>
          <RepoChart
            name="@ossinsight/widget-analyze-repo-company"
            visualizer={() => import('@/charts/analyze/repo/company/visualization')}
            repoId={repoId!}
            repoName={repoName}
            vsRepoId={vs}
            vsRepoName={comparingRepoName}
            params={{ activity: currentCompanyTab.key, limit: comparingRepoName ? 25 : 50 }}
            style={{ height: 500 }}
          />
        </div>
        <div className={vs != null ? 'md:col-span-4' : 'md:col-span-3'}>
          <Analyze
            query={currentCompanyTab.queryKey}
            params={{ limit: comparingRepoName ? 25 : 50 }}
            key={`company-list-${currentCompanyTab.key}`}
          >
            <CompanyList n={10} />
          </Analyze>
        </div>
      </div>
    </section>
  );
}
