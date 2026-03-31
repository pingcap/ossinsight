'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import {
  GitMergeIcon,
  IssueOpenedIcon,
  PeopleIcon,
  PersonIcon,
  StarIcon,
} from '@primer/octicons-react';
import Analyze from '@/components/Analyze/Analyze';
import { ScrollspySectionWrapper } from '@/components/Scrollspy/SectionWrapper';
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

function RankTable<T>({
  headerLabel,
  headerValue,
  items,
  getName,
  getValue,
  n = 10,
}: {
  headerLabel: string;
  headerValue: string;
  items: T[];
  getName: (item: T) => string;
  getValue: (item: T) => string | undefined;
  n?: number;
}) {
  return (
    <table className="w-full border-collapse">
      <thead>
        <tr className="border-b border-[#323234]">
          <th className="pb-2 text-left text-[13px] font-medium text-[#d8d8d8] w-8">No.</th>
          <th className="pb-2 text-left text-[13px] font-medium text-[#d8d8d8]">{headerLabel}</th>
          <th className="pb-2 text-right text-[13px] font-medium text-[#d8d8d8]">{headerValue}</th>
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: n }).map((_, index) => {
          const item = items[index];
          return (
            <tr key={index} className="border-b border-[#2a2a2c] last:border-0">
              <td className="py-2.5 text-[14px] text-[#8c8c8c] tabular-nums">{index + 1}</td>
              <td className="py-2.5 text-[14px] text-[#d8d8d8]">{item ? getName(item) : '--'}</td>
              <td className="py-2.5 text-right text-[15px] font-medium text-[#e9eaee] tabular-nums">{item ? getValue(item) : ''}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function GeoList({ n = 10 }: { n?: number }) {
  const { data } = useAnalyzeChartContext<LocationData>();

  return (
    <RankTable
      headerLabel="Location"
      headerValue="Share"
      n={n}
      items={(data.data?.data ?? []).slice(0, n)}
      getName={(item) => alpha2ToTitle(item.country_or_area)}
      getValue={(item) => formatPercent(item.percentage)}
    />
  );
}

function CompanyList({ n = 10 }: { n?: number }) {
  const { data } = useAnalyzeChartContext<CompanyData>();

  return (
    <RankTable
      headerLabel="Company"
      headerValue="Share"
      n={n}
      items={(data.data?.data ?? []).slice(0, n)}
      getName={(item) => item.company_name}
      getValue={(item) => formatPercent(item.proportion)}
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
    <ScrollspySectionWrapper anchor="people" className="pt-8 pb-8">
      <h2 className="text-[22px] font-semibold text-[#e9eaee] pb-4" style={{ scrollMarginTop: '140px' }}>
        People
      </h2>

      {/* Geographical Distribution */}
      <div id="geo-distribution">
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
              title="Geographical Distribution"
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
              title="Top 10 Geo-Locations"
            >
              <GeoList n={10} />
            </Analyze>
          </div>
        </div>
      </div>

      {/* Companies */}
      <div id="companies">
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
              title="Companies"
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
              title="Top 10 Companies"
            >
              <CompanyList n={10} />
            </Analyze>
          </div>
        </div>
      </div>
    </ScrollspySectionWrapper>
  );
}
