'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
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

import { GHAvatar } from '@/components/ui/components/GHAvatar';
import Analyze from '@/components/Analyze/Analyze';
import { ScrollspySectionWrapper } from '@/components/Scrollspy/SectionWrapper';
import { SectionHeading } from '@/components/ui/SectionHeading';
import ShareButtons from '@/components/ShareButtons';
import SimilarReposRadial from './SimilarReposRadial';
import { useAnalyzeChartContext, useAnalyzeContext } from '@/components/Analyze/context';
import MetricTable from '@/components/ui/MetricTable';
import type { MetricItem } from '@/components/ui/MetricTable';
import { queryAPI } from '@/utils/api';
import { useDebouncedValue } from '@/utils/useDebouncedValue';
import {
  getRepoSearchQueryKey,
  REPO_SEARCH_STALE_TIME,
  searchRepo,
} from '@/components/ui/components/GHRepoSelector/utils';

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

  const items: MetricItem[] = useMemo(() => [
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
      value: repoInfo?.language ? (
        <Link href={`/languages/${encodeURIComponent(repoInfo.language)}`} className="hover:text-white transition-colors">
          {repoInfo.language}
        </Link>
      ) : undefined,
      vsValue: comparingRepoInfo?.language ? (
        <Link href={`/languages/${encodeURIComponent(comparingRepoInfo.language)}`} className="hover:text-white transition-colors">
          {comparingRepoInfo.language}
        </Link>
      ) : undefined,
      icon: <CodeIcon fill="#309CF2" size={16} />,
      isStatic: true,
    },
    {
      label: 'License',
      value: repoInfo?.license,
      vsValue: comparingRepoInfo?.license,
      icon: <LawIcon fill="#a78bfa" size={16} />,
      isStatic: true,
    },
  ], [mainData, vsData, repoInfo, comparingRepoInfo]);

  return (
    <MetricTable
      items={items}
      loading={loading}
      header={repoName}
      vsHeader={hasVs ? comparingRepoName : undefined}
    />
  );
}

function MonthlySummaryCard() {
  const { repoId } = useAnalyzeContext();

  return (
    <div className="h-full">
      <h3 className="text-[18px] font-semibold text-[#e9eaee]">Last 28 days Stats</h3>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <div className="rounded-[6px] bg-[#242526] px-3 py-3">
          <RepoChart
            name="@ossinsight/widget-analyze-repo-recent-stars"
            visualizer={() => import('@/charts/analyze/repo/recent-stars/visualization')}
            repoId={repoId!}
            repoName=""
            title="Stars"
            style={{ height: 100 }}
          />
        </div>
        <div className="rounded-[6px] bg-[#242526] px-3 py-3">
          <RepoChart
            name="@ossinsight/widget-analyze-repo-recent-pull-requests"
            visualizer={() => import('@/charts/analyze/repo/recent-pull-requests/visualization')}
            repoId={repoId!}
            repoName=""
            title="Pull Requests"
            style={{ height: 100 }}
          />
        </div>
        <div className="rounded-[6px] bg-[#242526] px-3 py-3">
          <RepoChart
            name="@ossinsight/widget-analyze-repo-recent-issues"
            visualizer={() => import('@/charts/analyze/repo/recent-issues/visualization')}
            repoId={repoId!}
            repoName=""
            title="Issues"
            style={{ height: 100 }}
          />
        </div>
        <div className="rounded-[6px] bg-[#242526] px-3 py-3">
          <RepoChart
            name="@ossinsight/widget-analyze-repo-recent-commits"
            visualizer={() => import('@/charts/analyze/repo/recent-commits/visualization')}
            repoId={repoId!}
            repoName=""
            title="Commits"
            style={{ height: 100 }}
          />
        </div>
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
    <ScrollspySectionWrapper anchor="overview" className="pb-8">
      <div id="overview-main">
        {repoInfo ? (
          <>
            <ShareButtons
              url={`/analyze/${repoName}`}
              title={`${repoName} — check the full analytics on OSSInsight`}
              stars={repoInfo.stars ?? undefined}
              forks={repoInfo.forks ?? undefined}
              language={repoInfo.language ?? undefined}
              hashtags={['opensource', 'github']}
            />
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center justify-center rounded-[4px] bg-white p-[2px]">
                <GHAvatar name={repoName} size={40} rounded={false} />
              </span>
              <h1 className="min-w-0 text-[28px] font-semibold leading-tight text-[#e9eaee]">
                <a
                  href={`https://github.com/${repoName}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white"
                >
                  {repoName}
                </a>
              </h1>
              <CompareAction repoInfo={repoInfo} />
            </div>

            {repoInfo.description ? (
              <p className="mt-3 text-[16px] leading-7 text-[#7c7c7c]">{repoInfo.description}</p>
            ) : null}

            {!vs && (
              <nav aria-label="Related pages" className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px]">
                {collections.length > 0 ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[#7c7c7c]">In:</span>
                    {collections.map((collection) => (
                      <a
                        key={collection.id}
                        href={`/collections/${toCollectionSlug(collection.name)}`}
                        className="text-[#a0a0a0] underline decoration-[#505050] underline-offset-2 transition hover:text-[#d8d8d8] hover:decoration-[#888]"
                      >
                        {collection.name}
                      </a>
                    ))}
                  </div>
                ) : (
                  <Link
                    href="/collections"
                    className="text-[#7c7c7c] transition-colors hover:text-white"
                  >
                    Browse Collections →
                  </Link>
                )}
                {repoInfo.language && (
                  <Link
                    href={`/languages/${encodeURIComponent(repoInfo.language)}`}
                    className="text-[#a0a0a0] transition-colors hover:text-[#d8d8d8]"
                  >
                    More {repoInfo.language} repositories →
                  </Link>
                )}
                <Link
                  href="/trending"
                  className="text-[#a0a0a0] transition-colors hover:text-[#d8d8d8]"
                >
                  Trending repos →
                </Link>
              </nav>
            )}
          </>
        ) : null}

        <SectionHeading>Overview</SectionHeading>

        <div className="mt-6 grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <div>
            <Analyze query="analyze-repo-overview" title="Metrics" titleLevel="h4">
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
                showSQL={false}
              />
            ) : (
              <MonthlySummaryCard />
            )}
          </div>
        </div>
      </div>

      <div id="stars-history">
      <p className="pb-4 text-[16px] leading-7 text-[#7c7c7c]">
        The growth trend and the specific number of stars since the repository was established.
      </p>
      <RepoChart
        title="Stars History"
        name="@ossinsight/widget-analyze-repo-stars-history"
        visualizer={() => import('@/charts/analyze/repo/stars-history/visualization')}
        repoId={repoId!}
        repoName={repoName}
        vsRepoId={comparingRepoId}
        vsRepoName={comparingRepoName}
        style={{ height: vs ? 400 : 300 }}
      />
      </div>

      {!vs && <SimilarReposRadial />}
    </ScrollspySectionWrapper>
  );
}

// --- Compare Action (inline in title row) ---

const RECOMMEND_KEYWORD = 'recommend-repo-list-2-keyword';

function CompareAction({ repoInfo }: { repoInfo: NonNullable<ReturnType<typeof useAnalyzeContext>['repoInfo']> }) {
  const { comparingRepoInfo } = useAnalyzeContext();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [searchText, setSearchText] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchActive, setSearchActive] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debouncedSearchText = useDebouncedValue(searchText.trim(), 300);

  useEffect(() => {
    void queryClient.prefetchQuery({
      queryKey: getRepoSearchQueryKey(RECOMMEND_KEYWORD),
      queryFn: ({ signal }) => searchRepo(RECOMMEND_KEYWORD, signal),
      staleTime: REPO_SEARCH_STALE_TIME,
    });
  }, [queryClient]);

  const recommendQuery = useQuery({
    queryKey: getRepoSearchQueryKey(RECOMMEND_KEYWORD),
    queryFn: ({ signal }) => searchRepo(RECOMMEND_KEYWORD, signal),
    staleTime: REPO_SEARCH_STALE_TIME,
    placeholderData: keepPreviousData,
  });

  const suggestionsQuery = useQuery({
    queryKey: getRepoSearchQueryKey(debouncedSearchText),
    queryFn: ({ signal }) => searchRepo(debouncedSearchText, signal),
    enabled: debouncedSearchText.length > 0,
    staleTime: REPO_SEARCH_STALE_TIME,
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
        if (!searchText.trim()) setSearchActive(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [searchText]);

  const handleSearch = useCallback((text: string) => {
    setSearchText(text);
    if (!text.trim()) {
      setShowDropdown((recommendQuery.data?.length ?? 0) > 0);
      return;
    }
    setShowDropdown(true);
  }, [recommendQuery.data]);

  const selectRepo = useCallback((fullName: string) => {
    setShowDropdown(false);
    setSearchText('');
    setSearchActive(false);
    router.push(`/compare/${repoInfo.full_name}/${fullName}`);
  }, [repoInfo.full_name, router]);

  const removeVs = useCallback(() => {
    router.push(`/analyze/${repoInfo.full_name}`);
  }, [repoInfo.full_name, router]);

  const handlePaste = useCallback((text: string) => {
    const match = text.match(/github\.com\/([^/]+\/[^/\s?#]+)/);
    if (match) selectRepo(match[1]);
  }, [selectRepo]);

  const activateSearch = useCallback(() => {
    setSearchActive(true);
    requestAnimationFrame(() => inputRef.current?.focus());
  }, []);

  const displayList = useMemo(
    () => (searchText.trim() ? suggestionsQuery.data ?? [] : recommendQuery.data ?? []),
    [recommendQuery.data, searchText, suggestionsQuery.data],
  );
  const searching = searchText.trim().length > 0
    ? suggestionsQuery.isPending && !suggestionsQuery.data
    : recommendQuery.isPending && !recommendQuery.data;

  if (comparingRepoInfo) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-[28px] font-semibold text-[#a3a3a3]">vs.</span>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center rounded-[4px] bg-white p-[2px]">
            <GHAvatar name={comparingRepoInfo.full_name} size={40} rounded={false} />
          </span>
          <a
            href={`https://github.com/${comparingRepoInfo.full_name}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[28px] font-semibold leading-tight text-[#e9eaee] hover:text-white"
          >
            {comparingRepoInfo.full_name}
          </a>
          <button
            onClick={removeVs}
            className="ml-1 text-[24px] leading-none text-[#9f9f9f] transition hover:text-white"
            title="Remove comparison"
          >
            ×
          </button>
        </div>
      </div>
    );
  }

  if (searchActive) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-[28px] font-semibold text-[#a3a3a3]">vs.</span>
        <div ref={dropdownRef} className="relative">
          <input
            ref={inputRef}
            type="text"
            value={searchText}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={() => {
              if (!searchText.trim() && (recommendQuery.data?.length ?? 0) > 0) setShowDropdown(true);
              else if ((suggestionsQuery.data?.length ?? 0) > 0) setShowDropdown(true);
            }}
            onPaste={(e) => {
              const text = e.clipboardData.getData('text');
              if (text.includes('github.com/')) {
                e.preventDefault();
                handlePaste(text);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setShowDropdown(false);
                setSearchActive(false);
                setSearchText('');
              }
            }}
            placeholder="Search repos..."
            className="h-9 w-[240px] rounded-md bg-[#3c3c3c] px-3 text-[14px] text-[#e9eaee] outline-none placeholder:text-[#8a8a8a]"
          />
          {showDropdown && displayList.length > 0 && (
            <div className="absolute left-0 top-full z-50 mt-1 max-h-80 w-[320px] overflow-y-auto rounded-md border border-[#4a4a4a] bg-[#212122] shadow-xl">
              {displayList.slice(0, 8).map((repo: any) => (
                <button
                  key={repo.id ?? repo.fullName}
                  onClick={() => selectRepo(repo.fullName)}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left transition hover:bg-white/[0.05]"
                >
                  <img
                    src={`https://github.com/${repo.fullName?.split('/')[0]}.png`}
                    alt=""
                    className="h-5 w-5 rounded"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm text-[#e9eaee]">{repo.fullName}</div>
                    {repo.description ? (
                      <div className="truncate text-xs text-[#8c8c8c]">{repo.description}</div>
                    ) : null}
                  </div>
                  {repo.stars != null ? (
                    <span className="shrink-0 text-xs text-[#8c8c8c]">{repo.stars.toLocaleString()}</span>
                  ) : null}
                </button>
              ))}
            </div>
          )}
          {searching ? (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="h-3 w-3 animate-spin rounded-full border border-[#8c8c8c] border-t-transparent" />
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={activateSearch}
      className="flex items-center gap-1.5 rounded border border-[#4d4d4f] px-3 py-1 text-[14px] text-[#7c7c7c] transition hover:border-[#7c7c7c] hover:text-[#d8d8d8]"
    >
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M1 8h6M11 8h4M8 1v6M8 11v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      Compare
    </button>
  );
}
