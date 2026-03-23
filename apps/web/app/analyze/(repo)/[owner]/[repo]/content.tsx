'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query';
import { AnalyzeContext, RepoInfo } from '@/components/Analyze/context';
import { OverviewSection } from './_sections/overview';
import { PeopleSection } from './_sections/people';
import { CommitsSection } from './_sections/commits';
import { PullRequestsSection } from './_sections/pull-requests';
import { IssuesSection } from './_sections/issues';
import { RepositorySection } from './_sections/repository';
import { ContributorsSection } from './_sections/contributors';
import { useRouter } from 'next/navigation';
import { useDebouncedValue } from '@/utils/useDebouncedValue';
import {
  getRepoSearchQueryKey,
  REPO_SEARCH_STALE_TIME,
  searchRepo,
} from '@/components/ui/components/GHRepoSelector/utils';

interface RepoAnalyzePageProps {
  repoInfo: RepoInfo;
  vsRepoInfo?: RepoInfo | null;
  vsName?: string;
}

export default function RepoAnalyzePage({ repoInfo, vsRepoInfo, vsName }: RepoAnalyzePageProps) {
  const isComparing = vsRepoInfo != null;

  return (
    <AnalyzeContext.Provider
      value={{
        repoName: repoInfo.full_name,
        comparingRepoName: vsName,
        repoId: repoInfo.id,
        comparingRepoId: vsRepoInfo?.id,
        repoInfo: repoInfo,
        comparingRepoInfo: vsRepoInfo ?? undefined,
      }}
    >
      <CompareHeader repoInfo={repoInfo} vsRepoInfo={vsRepoInfo} />
      <OverviewSection />
      <PeopleSection />
      <CommitsSection />
      <PullRequestsSection />
      <IssuesSection />
      {/* Hide Repository & Contributors sections when comparing */}
      {!isComparing && (
        <>
          <RepositorySection />
          <ContributorsSection />
        </>
      )}
    </AnalyzeContext.Provider>
  );
}

// --- Compare Header ---

const RECOMMEND_KEYWORD = 'recommend-repo-list-2-keyword';

function CompareHeader({ repoInfo, vsRepoInfo }: { repoInfo: RepoInfo; vsRepoInfo?: RepoInfo | null }) {
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

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
        if (!searchText.trim()) {
          setSearchActive(false);
        }
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
    router.push(`/compare/${repoInfo.full_name}/${fullName}`);
  }, [repoInfo.full_name, router]);

  const removeVs = useCallback(() => {
    router.push(`/analyze/${repoInfo.full_name}`);
  }, [repoInfo.full_name, router]);

  // Handle pasting a GitHub URL
  const handlePaste = useCallback((text: string) => {
    const match = text.match(/github\.com\/([^/]+\/[^/\s?#]+)/);
    if (match) {
      selectRepo(match[1]);
    }
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

  return (
    <div className="sticky top-[var(--site-header-height)] z-20 -mx-6 mb-6 bg-[#222222] px-6 py-2 shadow md:-mx-8 md:px-8">
      <div className="flex flex-wrap items-center gap-3">
        <div className="min-w-0 flex-1 md:max-w-[540px]">
          <div className="flex h-10 items-center rounded-md bg-[#3c3c3c] px-3 text-[16px] text-[#e9eaee]">
            <span className="truncate">{repoInfo.full_name}</span>
          </div>
        </div>

        {vsRepoInfo ? (
          <>
            <div className="px-1 text-[20px] font-bold text-[#a3a3a3]">VS.</div>
            <div className="flex h-10 min-w-0 items-center gap-2 rounded-md bg-[#3c3c3c] px-3 text-[16px] text-[#e9eaee] md:max-w-[300px]">
              <span className="truncate">{vsRepoInfo.full_name}</span>
              <button
                onClick={removeVs}
                className="ml-auto text-[18px] leading-none text-[#9f9f9f] transition hover:text-white"
                title="Remove comparison"
              >
                ×
              </button>
            </div>
          </>
        ) : searchActive ? (
          <>
            <div className="px-1 text-[20px] font-bold text-[#a3a3a3]">VS.</div>
            <div ref={dropdownRef} className="relative min-w-0 flex-1 md:max-w-[300px]">
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
                placeholder="Search repos to compare..."
                className="h-10 w-full rounded-md bg-[#3c3c3c] px-3 text-[16px] text-[#e9eaee] outline-none placeholder:text-[#8a8a8a]"
              />
              {showDropdown && displayList.length > 0 && (
                <div className="absolute left-0 top-full z-50 mt-1 max-h-80 w-full overflow-y-auto rounded-md border border-[#4a4a4a] bg-[#212122] shadow-xl">
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
          </>
        ) : (
          <button
            onClick={activateSearch}
            className="flex h-10 items-center gap-2 rounded-md bg-[#5b4cce] px-4 text-[15px] font-medium text-white shadow transition hover:bg-[#6d5fd9] active:bg-[#4e40b5]"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M1 8h6M11 8h4M8 1v6M8 11v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            Compare with...
          </button>
        )}
      </div>
    </div>
  );
}
