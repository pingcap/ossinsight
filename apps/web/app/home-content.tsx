'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';
import { FAQ_ITEMS } from './faq-data';
import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import {
  CodeReviewIcon,
  CommentIcon,
  GitMergeIcon,
  GitPullRequestClosedIcon,
  GitPullRequestIcon,
  IssueClosedIcon,
  IssueOpenedIcon,
  PersonAddIcon,
  RepoDeletedIcon,
  RepoForkedIcon,
  RepoIcon,
  RepoPushIcon,
  StarFillIcon,
  TagIcon,
} from '@primer/octicons-react';
import { getCollectionsHotPath } from '@/lib/collections';
import { type CollectionQueryResponse, useCollectionApi } from '@/lib/collections-client';
import { useRemoteData, getRemoteDataQueryKey } from '@/utils/useRemoteData';
import { queryAPI } from '@/utils/api';
import { fetchGitHubRepo, SITE_HOST } from '@/utils/api';
import { ShowSQLInline } from '@/components/Analyze/ShowSQL';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectItem } from '@/components/ui/components/Selector/Select';
import * as Tooltip from '@/components/ui/components/Tooltip';
import * as Tabs from '@radix-ui/react-tabs';
import { useDebouncedValue } from '@/utils/useDebouncedValue';
import {
  getOrgSearchQueryKey,
  ORG_SEARCH_STALE_TIME,
  searchOrg,
} from '@/components/ui/components/GHOrgSelector/utils';
import {
  getRepoSearchQueryKey,
  REPO_SEARCH_STALE_TIME,
  searchRepo,
} from '@/components/ui/components/GHRepoSelector/utils';
import {
  getUserSearchQueryKey,
  searchUser,
  USER_SEARCH_STALE_TIME,
} from '@/components/ui/components/GHUserSelector/utils';

// --- Language Colors ---

const LANGUAGE_COLORS: Record<string, string> = {
  javascript: '#f1e05a', java: '#b07219', python: '#3572A5', php: '#4F5D95',
  'c++': '#f34b7d', 'c#': '#178600', typescript: '#3178c6', shell: '#89e051',
  c: '#555555', ruby: '#701516', rust: '#dea584', go: '#00ADD8',
  kotlin: '#A97BFF', dart: '#00B4AB', swift: '#F05138', html: '#e34c26',
  css: '#563d7c', elixir: '#6e4a7e', haskell: '#5e5086', scala: '#c22d40',
  julia: '#a270ba', lua: '#000080', r: '#198CE7', zig: '#ec915c',
  nim: '#ffc200', erlang: '#B83998', clojure: '#db5855', 'objective-c': '#438eff',
  perl: '#0298c3', vue: '#41b883',
};

// --- Constants ---

const periods = [
  { key: 'past_24_hours', label: 'Past 24 Hours' },
  { key: 'past_week', label: 'Past Week' },
  { key: 'past_month', label: 'Past Month' },
  { key: 'past_3_months', label: 'Past 3 Months' },
];

const languages = [
  'All', 'JavaScript', 'Java', 'Python', 'PHP', 'C++', 'C#', 'TypeScript', 'Shell',
  'C', 'Ruby', 'Rust', 'Go', 'Kotlin', 'HCL', 'PowerShell', 'CMake', 'Groovy',
  'PLpgSQL', 'TSQL', 'Dart', 'Swift', 'HTML', 'CSS', 'Elixir', 'Haskell',
  'Solidity', 'Assembly', 'R', 'Scala', 'Julia', 'Lua', 'Clojure', 'Erlang',
  'Common Lisp', 'Emacs Lisp', 'OCaml', 'MATLAB', 'Objective-C', 'Perl',
  'Fortran', 'Zig', 'Others',
];
const OSSINSIGHT_REPO_QUERY_KEY = ['repo-meta', 'pingcap', 'ossinsight'] as const;
const ONE_HOUR = 60 * 60 * 1000;

function toSlug(name: string) {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

// --- Animated Number ---

function AnimatedTotal({ value }: { value: number }) {
  const [display, setDisplay] = useState(value);
  const prevRef = useRef(value);

  useEffect(() => {
    const from = prevRef.current;
    const to = value;
    if (from === to) return;
    prevRef.current = to;
    const start = performance.now();
    const duration = 400;
    const step = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(from + (to - from) * eased));
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [value]);

  return <span className="text-[#E30C34] font-bold" style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace', fontVariantNumeric: 'tabular-nums' }}>{display.toLocaleString()}</span>;
}

// --- Real-time Events Chart (ECharts bar, same as legacy) ---

const LazyECharts = dynamic(() => import('@/components/Analyze/EChartsWrapper'), { ssr: false });

function EventsBarChart({ data }: { data: Array<{ cnt: number; latest_timestamp: string }> }) {
  const option = useMemo(() => ({
    grid: { top: 0, bottom: 8, left: 0, right: 0, containLabel: true },
    xAxis: {
      type: 'category' as const,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { show: false },
      splitLine: { show: false },
    },
    yAxis: {
      type: 'value' as const,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { show: true, align: 'right', fontSize: 12, showMinLabel: true, showMaxLabel: false, hideOverlap: true, color: '#999' },
      splitLine: { show: false },
      interval: 100,
    },
    series: [{
      type: 'bar',
      color: '#F77C00',
      barCategoryGap: '51%',
      encode: { x: 'latest_timestamp', y: 'cnt' },
      datasetId: 'main',
      silent: true,
    }],
    dataset: { id: 'main', source: data },
    animationDuration: 500,
    animationEasing: 'cubicOut',
    backgroundColor: 'transparent',
  }), [data]);

  return (
    <div style={{ height: 120, maxWidth: 360 }}>
      <LazyECharts
        option={option}
        style={{ width: '100%', height: '100%' }}
        notMerge={false}
        lazyUpdate
        theme="dark"
      />
    </div>
  );
}

// --- Real-time Event Feed ---

type GHEvent = {
  id: number;
  type: string;
  repo_name: string;
  actor_login: string;
  number: number;
  action: string;
  pr_merged: 0 | 1 | null;
};

const EMPTY_EVENTS: GHEvent[] = [];

function prUrl(event: GHEvent) {
  return `https://github.com/${event.repo_name}/pull/${event.number}`;
}

function issueUrl(event: GHEvent) {
  return `https://github.com/${event.repo_name}/issues/${event.number}`;
}

function eventTarget(event: GHEvent) {
  if (!event.repo_name) {
    return null;
  }

  return (
    <a
      href={`https://github.com/${event.repo_name}`}
      target="_blank"
      rel="noopener noreferrer"
      className="site-link"
    >
      {event.repo_name}
    </a>
  );
}

function eventVerb(event: GHEvent) {
  const actor = (
    <a
      href={`https://github.com/${event.actor_login}`}
      target="_blank"
      rel="noopener noreferrer"
      className="site-link"
    >
      {event.actor_login}
    </a>
  );

  switch (event.type) {
    case 'PushEvent':
      return <><RepoPushIcon size={12} className="inline align-[-2px]" /> {actor} pushed to</>;
    case 'CreateEvent':
      return <><RepoIcon size={12} className="inline align-[-2px]" /> {actor} created</>;
    case 'WatchEvent':
      return <><StarFillIcon size={12} className="inline align-[-2px]" /> {actor} starred</>;
    case 'ForkEvent':
      return <><RepoForkedIcon size={12} className="inline align-[-2px]" /> {actor} forked</>;
    case 'IssuesEvent': {
      const issue = (
        <a href={issueUrl(event)} target="_blank" rel="noopener noreferrer" className="site-link">
          #{event.number}
        </a>
      );

      if (event.action === 'closed') {
        return <><IssueClosedIcon size={12} className="inline align-[-2px]" /> {actor} closed {issue} in</>;
      }

      return <><IssueOpenedIcon size={12} className="inline align-[-2px]" /> {actor} {event.action} {issue} in</>;
    }
    case 'PullRequestEvent': {
      const pr = (
        <a href={prUrl(event)} target="_blank" rel="noopener noreferrer" className="site-link">
          #{event.number}
        </a>
      );

      if (event.action === 'closed' && event.pr_merged) {
        return <><GitMergeIcon size={12} className="inline align-[-2px]" /> {actor} merged PR {pr} in</>;
      }

      if (event.action === 'closed') {
        return <><GitPullRequestClosedIcon size={12} className="inline align-[-2px]" /> {actor} closed PR {pr} in</>;
      }

      return <><GitPullRequestIcon size={12} className="inline align-[-2px]" /> {actor} {event.action} PR {pr} in</>;
    }
    case 'PullRequestReviewCommentEvent': {
      const pr = (
        <a href={prUrl(event)} target="_blank" rel="noopener noreferrer" className="site-link">
          #{event.number}
        </a>
      );
      return <><CommentIcon size={12} className="inline align-[-2px]" /> {actor} commented review PR {pr} in</>;
    }
    case 'PullRequestReviewEvent': {
      const pr = (
        <a href={prUrl(event)} target="_blank" rel="noopener noreferrer" className="site-link">
          #{event.number}
        </a>
      );
      return <><CodeReviewIcon size={12} className="inline align-[-2px]" /> {actor} review PR {pr} in</>;
    }
    case 'IssueCommentEvent': {
      const issue = (
        <a href={issueUrl(event)} target="_blank" rel="noopener noreferrer" className="site-link">
          #{event.number}
        </a>
      );
      return <><CommentIcon size={12} className="inline align-[-2px]" /> {actor} commented issue {issue} in</>;
    }
    case 'CommitCommentEvent':
      return <><CommentIcon size={12} className="inline align-[-2px]" /> {actor} commented commit in</>;
    case 'ReleaseEvent':
      return <><TagIcon size={12} className="inline align-[-2px]" /> {actor} released in</>;
    case 'DeleteEvent':
      return <><RepoDeletedIcon size={12} className="inline align-[-2px]" /> {actor} deleted</>;
    case 'MemberEvent':
      return <><PersonAddIcon size={12} className="inline align-[-2px]" /> {actor} {event.action} member in</>;
    default:
      return <>{actor} {event.type}</>;
  }
}

function LiveEventFeed() {
  const { data, reload } = useRemoteData<GHEvent>('events-increment-list', {});
  const allEvents = data?.data ?? EMPTY_EVENTS;
  const [visibleEvents, setVisibleEvents] = useState<(GHEvent & { _key: string })[]>([]);
  const indexRef = useRef(0);
  const pausedRef = useRef(false);

  useEffect(() => {
    if (allEvents.length === 0) {
      indexRef.current = 0;
      setVisibleEvents([]);
      return;
    }

    const seededEvents = allEvents.slice(0, 7).map((event, index) => ({
      ...event,
      _key: `${event.id}-seed-${index}`,
    }));
    indexRef.current = seededEvents.length;
    setVisibleEvents(seededEvents);
  }, [data?.requestedAt]);

  // Re-fetch events when page becomes visible again
  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void reload();
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, [reload]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (pausedRef.current) return;
      if (allEvents.length === 0) return;
      const idx = indexRef.current % allEvents.length;
      const ev = allEvents[idx];
      setVisibleEvents(prev => {
        const next = [{ ...ev, _key: `${ev.id}-${Date.now()}` }, ...prev];
        return next.slice(0, 7);
      });
      indexRef.current = idx + 1;
    }, 500);
    return () => clearInterval(interval);
  }, [allEvents]);

  return (
    <div
      className="overflow-hidden"
      style={{ height: 7 * 24 }}
      onMouseEnter={() => { pausedRef.current = true; }}
      onMouseLeave={() => { pausedRef.current = false; }}
    >
      {visibleEvents.map((ev) => (
        <div
          key={ev._key}
          className="h-6 overflow-hidden text-ellipsis whitespace-nowrap text-[12px] leading-6 text-[#c4c4c4] animate-[eventSlideIn_0.8s_cubic-bezier(0.16,1,0.3,1)]"
        >
          {eventVerb(ev)}&nbsp;{eventTarget(ev)}
        </div>
      ))}
    </div>
  );
}

// --- Hero Search (inline autocomplete dropdown, legacy style) ---

type SearchType = 'all' | 'repo' | 'user' | 'org';
type SearchResultItem = { id: number; fullName?: string; login?: string; type: 'Repo' | 'User' | 'Org' };

const SEARCH_TABS: { label: string; value: SearchType }[] = [
  { label: 'All', value: 'all' },
  { label: 'Repo', value: 'repo' },
  { label: 'Developer', value: 'user' },
  { label: 'Org', value: 'org' },
];

const PLACEHOLDERS: Record<SearchType, string> = {
  all: 'Enter a GitHub ID/Repo/Org Name',
  repo: 'Enter a GitHub Repo Name',
  user: 'Enter a GitHub ID',
  org: 'Enter a GitHub Org Name',
};

const DEFAULT_REPO_SEARCH_KEYWORD = 'recommend-repo-list-1-keyword';
const DEFAULT_USER_SEARCH_KEYWORD = 'recommend-user-list-keyword';
const DEFAULT_ORG_SEARCH_KEYWORD = 'recommend-org-list-keyword';

function HeroSearch() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [keyword, setKeyword] = useState('');
  const [searchType, setSearchType] = useState<SearchType>('all');
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const hasPrefetchedRef = useRef(false);
  const debouncedKeyword = useDebouncedValue(keyword.trim(), 350);
  const repoKeyword = debouncedKeyword || DEFAULT_REPO_SEARCH_KEYWORD;
  const userKeyword = debouncedKeyword || DEFAULT_USER_SEARCH_KEYWORD;
  const orgKeyword = debouncedKeyword || DEFAULT_ORG_SEARCH_KEYWORD;

  useEffect(() => {
    if (!open || hasPrefetchedRef.current) {
      return;
    }

    hasPrefetchedRef.current = true;

    void Promise.all([
      queryClient.prefetchQuery({
        queryKey: getRepoSearchQueryKey(DEFAULT_REPO_SEARCH_KEYWORD),
        queryFn: ({ signal }) => searchRepo(DEFAULT_REPO_SEARCH_KEYWORD, signal),
        staleTime: REPO_SEARCH_STALE_TIME,
      }),
      queryClient.prefetchQuery({
        queryKey: getUserSearchQueryKey(DEFAULT_USER_SEARCH_KEYWORD),
        queryFn: ({ signal }) => searchUser(DEFAULT_USER_SEARCH_KEYWORD, signal),
        staleTime: USER_SEARCH_STALE_TIME,
      }),
      queryClient.prefetchQuery({
        queryKey: getOrgSearchQueryKey(DEFAULT_ORG_SEARCH_KEYWORD),
        queryFn: ({ signal }) => searchOrg(DEFAULT_ORG_SEARCH_KEYWORD, signal),
        staleTime: ORG_SEARCH_STALE_TIME,
      }),
    ]);
  }, [open, queryClient]);

  const repoQuery = useQuery({
    queryKey: getRepoSearchQueryKey(repoKeyword),
    queryFn: ({ signal }) => searchRepo(repoKeyword, signal),
    enabled: open && (searchType === 'all' || searchType === 'repo'),
    staleTime: REPO_SEARCH_STALE_TIME,
    retry: false,
    placeholderData: keepPreviousData,
  });
  const userQuery = useQuery({
    queryKey: getUserSearchQueryKey(userKeyword),
    queryFn: ({ signal }) => searchUser(userKeyword, signal),
    enabled: open && (searchType === 'all' || searchType === 'user'),
    staleTime: USER_SEARCH_STALE_TIME,
    retry: false,
    placeholderData: keepPreviousData,
  });
  const orgQuery = useQuery({
    queryKey: getOrgSearchQueryKey(orgKeyword),
    queryFn: ({ signal }) => searchOrg(orgKeyword, signal),
    enabled: open && (searchType === 'all' || searchType === 'org'),
    staleTime: ORG_SEARCH_STALE_TIME,
    retry: false,
    placeholderData: keepPreviousData,
  });

  const results = useMemo<SearchResultItem[]>(() => {
    const repoItems = (repoQuery.data ?? []).slice(0, 5).map((repo) => ({
      id: repo.id,
      fullName: repo.fullName,
      type: 'Repo' as const,
    }));
    const userItems = (userQuery.data ?? []).slice(0, 5).map((user) => ({
      id: user.id,
      login: user.login,
      type: 'User' as const,
    }));
    const orgItems = (orgQuery.data ?? []).slice(0, 5).map((org) => ({
      id: org.id,
      login: org.login,
      type: 'Org' as const,
    }));

    switch (searchType) {
      case 'repo':
        return repoItems;
      case 'user':
        return userItems;
      case 'org':
        return orgItems;
      case 'all':
        return [...repoItems, ...userItems, ...orgItems];
    }
  }, [orgQuery.data, repoQuery.data, searchType, userQuery.data]);

  const loading = useMemo(
    () =>
      open && (
        ((searchType === 'all' || searchType === 'repo') && repoQuery.isPending && !repoQuery.data) ||
        ((searchType === 'all' || searchType === 'user') && userQuery.isPending && !userQuery.data) ||
        ((searchType === 'all' || searchType === 'org') && orgQuery.isPending && !orgQuery.data)
      ),
    [
      open,
      orgQuery.data,
      orgQuery.isPending,
      repoQuery.data,
      repoQuery.isPending,
      searchType,
      userQuery.data,
      userQuery.isPending,
    ],
  );

  const hasError = useMemo(
    () =>
      ((searchType === 'all' || searchType === 'repo') && repoQuery.isError) ||
      ((searchType === 'all' || searchType === 'user') && userQuery.isError) ||
      ((searchType === 'all' || searchType === 'org') && orgQuery.isError),
    [
      orgQuery.isError,
      repoQuery.isError,
      searchType,
      userQuery.isError,
    ],
  );

  useEffect(() => {
    setActiveIndex(-1);
  }, [results]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = useCallback((item: SearchResultItem) => {
    setOpen(false); setKeyword('');
    const name = item.type === 'Repo' ? item.fullName : item.login;
    if (name) router.push(`/analyze/${name}`);
  }, [router]);

  // Tab cycling (Tab key or arrow left/right)
  const nextTab = useCallback(() => {
    setSearchType(prev => {
      const idx = SEARCH_TABS.findIndex(t => t.value === prev);
      return SEARCH_TABS[(idx + 1) % SEARCH_TABS.length].value;
    });
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Tab' && open) { e.preventDefault(); nextTab(); return; }
    if (!open || results.length === 0) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIndex(i => Math.min(i + 1, results.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIndex(i => Math.max(i - 1, 0)); }
    else if (e.key === 'Enter' && activeIndex >= 0) { e.preventDefault(); handleSelect(results[activeIndex]); }
    else if (e.key === 'Escape') { setOpen(false); }
  }, [open, results, activeIndex, handleSelect, nextTab]);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData('text');
    const match = text.match(/github\.com\/([^?\s#]+)/);
    if (match) { e.preventDefault(); setKeyword(match[1]); }
  }, []);

  // Group results by type for display
  const grouped = useMemo(() => {
    const groups: { type: string; items: SearchResultItem[] }[] = [];
    const typeOrder = ['Repo', 'User', 'Org'];
    for (const t of typeOrder) {
      const items = results.filter(r => r.type === t);
      if (items.length > 0) groups.push({ type: t, items });
    }
    return groups;
  }, [results]);

  // Flat list for keyboard navigation
  const flatList = useMemo(() => grouped.flatMap(g => g.items), [grouped]);

  return (
    <div ref={containerRef} style={{ position: 'relative', maxWidth: 500 }} className="ml-auto mt-6">
      {/* Input */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        backgroundColor: '#212122',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 16,
        boxShadow: '0 16px 40px -28px rgba(0,0,0,0.85)',
        padding: '10px 16px',
      }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFE895" strokeWidth="2">
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
        </svg>
        <input
          ref={inputRef}
          value={keyword}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setKeyword(e.target.value)}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder={open ? PLACEHOLDERS[searchType] : 'Search a developer/repo/org'}
          style={{
            flex: 1,
            background: 'none',
            border: 'none',
            outline: 'none',
            fontSize: 16,
            color: '#EEF0F5',
            fontFamily: 'inherit',
            textAlign: 'left',
          }}
        />
        {loading && (
          <svg width="16" height="16" viewBox="0 0 24 24" className="animate-spin" style={{ color: '#FFE895' }}>
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" opacity="0.3" />
            <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" />
          </svg>
        )}
        {!open && (
          <span style={{
            minWidth: 24,
            height: 24,
            borderRadius: 6,
            border: '1px solid rgba(255,255,255,0.08)',
            backgroundColor: '#1a1a1b',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 12,
            color: '#a7a9b6',
          }}>/</span>
        )}
      </div>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, marginTop: 4,
          minWidth: 420, maxHeight: '80vh',
          backgroundColor: '#1a1a1b',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 16,
          boxShadow: '0 32px 80px -48px rgba(0,0,0,0.98)',
          overflow: 'hidden', zIndex: 50, display: 'flex', flexDirection: 'column', textAlign: 'left',
        }}>
          {/* Tabs */}
          <Tabs.Root value={searchType} onValueChange={(v) => { setSearchType(v as SearchType); inputRef.current?.focus(); }}>
            <Tabs.List style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.06)', minHeight: 40 }}>
              {SEARCH_TABS.map(t => (
                <Tabs.Trigger
                  key={t.value}
                  value={t.value}
                  style={{
                    padding: '4px 12px', fontSize: 12, border: 'none', cursor: 'pointer', textAlign: 'left',
                    background: 'none', color: searchType === t.value ? '#FFE895' : '#8c8c8c',
                    borderBottom: searchType === t.value ? '2px solid #FFE895' : '2px solid transparent',
                    transition: 'color 0.15s', outline: 'none',
                  }}
                >
                  {t.label}
                </Tabs.Trigger>
              ))}
            </Tabs.List>
          </Tabs.Root>

          {/* Results (grouped) */}
          <div style={{ overflowY: 'auto', flex: 1, maxHeight: 'calc(80vh - 72px)' }}>
            {hasError && !loading && (
              <div style={{ padding: '16px', color: '#ffb1ab', fontSize: 13, textAlign: 'center' }}>
                Failed to load search results.
              </div>
            )}
            {grouped.length === 0 && !loading && !hasError && (
              <div style={{ padding: '24px 16px', textAlign: 'center' }}>
                <div style={{ color: '#7c7c7c', fontSize: 13 }}>
                  {debouncedKeyword
                    ? <>No results found for <strong style={{ color: '#a0a0a0' }}>{debouncedKeyword}</strong></>
                    : 'No results'}
                </div>
                {debouncedKeyword && (
                  <div style={{ color: '#5c5c5c', fontSize: 12, marginTop: 8 }}>
                    {searchType === 'user'
                      ? 'Try searching for popular developers like torvalds, gaearon, or sindresorhus'
                      : searchType === 'org'
                        ? 'Try searching for popular organizations like google, facebook, or microsoft'
                        : searchType === 'repo'
                          ? 'Try searching for popular repos like react, vue, or tensorflow'
                          : 'Try react, torvalds, google, or any GitHub repo / user / org name'}
                  </div>
                )}
              </div>
            )}
            {!hasError && grouped.map(group => {
              const globalOffset = flatList.indexOf(group.items[0]);
              return (
                <div key={group.type}>
                  {/* Group header (only in "all" mode with multiple groups) */}
                  {searchType === 'all' && grouped.length > 1 && (
                    <div style={{ padding: '6px 16px', fontSize: 11, color: '#8c8c8c', lineHeight: 1.5 }}>{group.type}</div>
                  )}
                  {group.items.map((item, j) => {
                    const flatIdx = globalOffset + j;
                    const name = item.type === 'Repo' ? item.fullName! : item.login!;
                    const avatarUrl = item.type === 'Repo'
                      ? `https://github.com/${name.split('/')[0]}.png?size=40`
                      : `https://github.com/${name}.png?size=40`;
                    return (
                      <div
                        key={`${item.type}-${item.id}`}
                        onClick={() => handleSelect(item)}
                        onMouseEnter={() => setActiveIndex(flatIdx)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 8,
                          padding: '6px 16px', cursor: 'pointer',
                          backgroundColor: activeIndex === flatIdx ? 'rgba(255,232,149,0.08)' : 'transparent',
                        }}
                      >
                        <img src={avatarUrl} alt="" width={24} height={24} style={{ borderRadius: item.type === 'User' ? '50%' : 4, flexShrink: 0, backgroundColor: '#2a2a2c' }} />
                        <span style={{ color: '#e0e0e0', fontSize: 14, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'left' }}>{name}</span>
                        {activeIndex === flatIdx && (
                          <span style={{
                            minWidth: 24,
                            height: 24,
                            borderRadius: 6,
                            border: '1px solid rgba(255,255,255,0.08)',
                            backgroundColor: '#212122',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 11,
                            color: '#FFE895',
                            flexShrink: 0,
                          }}>↵</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {/* Keyboard hints bar */}
          <div style={{
            height: 32, padding: '0 12px', backgroundColor: '#212122',
            display: 'flex', alignItems: 'center', gap: 16, fontSize: 11, color: '#8c8c8c',
          }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <span style={{ minWidth: 24, height: 24, borderRadius: 6, border: '1px solid rgba(255,255,255,0.08)', backgroundColor: '#1a1a1b', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#a7a9b6', padding: '0 4px' }}>TAB</span>
              <span style={{ minWidth: 24, height: 24, borderRadius: 6, border: '1px solid rgba(255,255,255,0.08)', backgroundColor: '#1a1a1b', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: '#a7a9b6' }}>↑</span>
              <span style={{ minWidth: 24, height: 24, borderRadius: 6, border: '1px solid rgba(255,255,255,0.08)', backgroundColor: '#1a1a1b', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: '#a7a9b6' }}>↓</span>
              To Navigate
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <span style={{ minWidth: 24, height: 24, borderRadius: 6, border: '1px solid rgba(255,255,255,0.08)', backgroundColor: '#1a1a1b', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#a7a9b6', padding: '0 4px' }}>ESC</span>
              To Cancel
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <span style={{ minWidth: 24, height: 24, borderRadius: 6, border: '1px solid rgba(255,255,255,0.08)', backgroundColor: '#1a1a1b', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: '#a7a9b6' }}>↵</span>
              To Enter
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Hero Section (two-column like legacy) ---

function HeroSection() {
  // --- Total events: base + increment (same approach as RealtimeSummary) ---
  const totalQuery = useQuery({
    queryKey: getRemoteDataQueryKey('events-total', undefined),
    queryFn: ({ signal }) => queryAPI<{ cnt: number; latest_timestamp: number }>('events-total', undefined, signal),
    refetchInterval: 5 * 60 * 1000,
    refetchIntervalInBackground: false,
    staleTime: 5 * 60 * 1000,
  });
  const baseRow = totalQuery.data?.data?.[0];

  const incrementQuery = useQuery({
    queryKey: ['hero', 'events-increment', baseRow?.latest_timestamp ?? null],
    queryFn: ({ signal }) =>
      queryAPI<{ cnt: number }>('events-increment', { ts: baseRow!.latest_timestamp }, signal),
    enabled: baseRow?.latest_timestamp != null,
    refetchInterval: 5000,
    refetchIntervalInBackground: false,
    staleTime: 0,
    structuralSharing: false,
  });

  const baseCnt = baseRow?.cnt ?? 0;
  const added = incrementQuery.data?.data?.[0]?.cnt ?? 0;
  const totalEvents = baseCnt + added;

  // --- Bar chart: poll events-increment-intervals ---
  const intervalsQuery = useQuery({
    queryKey: getRemoteDataQueryKey('events-increment-intervals', undefined),
    queryFn: ({ signal }) => queryAPI<{ cnt: number; latest_timestamp: string }>('events-increment-intervals', undefined, signal),
    refetchInterval: 5000,
    refetchIntervalInBackground: false,
    staleTime: 0,
    structuralSharing: false,
  });
  const intervalData = intervalsQuery.data?.data ?? [];

  return (
    <section className="max-w-[1536px] mx-auto px-6 pt-16 pb-4">
      <div className="flex flex-col lg:flex-row gap-8 items-stretch">
        {/* Left */}
        <div className="flex-[3] flex flex-col justify-center items-end">
          <div className="w-full max-w-[800px] text-right">
          <p className="text-[#C4C4C4] text-2xl font-medium mb-2">
            SELECT insights FROM <AnimatedTotal value={totalEvents} /> GitHub events
          </p>
          <h1 className="text-5xl lg:text-[64px] font-bold leading-[80px] mb-2 text-[#e3e3e3]">
            Open Source Software
            <br />
            <span className="text-[#FFE895]">
              <svg className="inline-block align-middle mr-2" style={{ width: '1em', height: '1em' }} viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 6c3.79 0 7.17 2.13 8.82 5.5C19.17 14.87 15.79 17 12 17s-7.17-2.13-8.82-5.5C4.83 8.13 8.21 6 12 6m0-2C7 4 2.73 7.11 1 11.5 2.73 15.89 7 19 12 19s9.27-3.11 11-7.5C21.27 7.11 17 4 12 4zm0 5c1.38 0 2.5 1.12 2.5 2.5S13.38 14 12 14s-2.5-1.12-2.5-2.5S10.62 9 12 9m0-2c-2.48 0-4.5 2.02-4.5 4.5S9.52 16 12 16s4.5-2.02 4.5-4.5S14.48 7 12 7z" />
              </svg>
              Insight
            </span>
          </h1>
          <HeroSearch />
          <p className="text-sm text-[#7c7c7c] mt-2">
            Deep insight into developers and repos on GitHub
            <br />
            about stars, pull requests, issues, pushes, comments, reviews...
          </p>
          <div className="flex justify-end mt-4">
            <a
              href="https://www.pingcap.com/tidb-cloud/"
              target="_blank"
              rel="noopener noreferrer"
              className="opacity-60 hover:opacity-100 transition-opacity"
            >
              <img src="/img/tidb-cloud-logo-o.png" alt="TiDB Cloud" style={{ height: 20 }} />
            </a>
          </div>
          </div>
        </div>

        {/* Divider */}
        <div className="hidden lg:block w-px bg-gray-700 self-stretch" />

        {/* Right */}
        <div className="flex-[2] flex flex-col min-w-0">
          <div className="mb-2 mt-0" />
          <div className="w-full sm:max-w-[61.8%]">
            <EventsBarChart data={intervalData.length > 0 ? intervalData : []} />
          </div>

          <p className="mt-4 mb-2 text-[14px] font-bold text-[#C4C4C4]">
            What is happening on GitHub <span className="text-[#47D9A1]">NOW!</span>
            <span className="ml-1 inline-flex align-middle">
              <Tooltip.InfoTooltip
                iconProps={{
                  className: 'inline text-[#8c8c8c]',
                  width: 14,
                  height: 14,
                }}
                contentProps={{
                  className: 'text-[12px] leading-[16px] max-w-[260px] bg-[var(--background-color-tooltip)] text-[var(--text-color-tooltip)]',
                }}
                arrowProps={{
                  className: 'fill-[var(--background-color-tooltip)]',
                }}
              >
                Random pick from all realtime events
              </Tooltip.InfoTooltip>
            </span>
          </p>
          <LiveEventFeed />
          <div className="mt-3 text-[12px]">
            <Link
              href="/blog/why-we-choose-tidb-to-support-ossinsight"
              className="text-[#7c7c7c] underline decoration-transparent transition-colors hover:text-[#a9a9a9]"
            >
              🤖️ How do we create this real-time effect?
            </Link>
          </div>
        </div>
      </div>

    </section>
  );
}

// --- Trending Repos Section ---

interface TrendingRepo {
  repo_id: number;
  repo_name: string;
  description: string;
  stars: number;
  forks: number;
  pushes: number;
  pull_requests: number;
  language: string;
  contributor_logins: string;
  collection_names: string | null;
  total_score: number;
}

function LoadingSkeleton({ className }: { className?: string }) {
  return <Skeleton className={['bg-white/[0.08]', className].filter(Boolean).join(' ')} />;
}

function TrendingReposTableSkeleton({ rowCount }: { rowCount: number }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-700 text-left text-gray-400">
            <th className="px-3 py-2 w-16">Rank</th>
            <th className="px-3 py-2">Repository</th>
            <th className="px-3 py-2 text-right">Stars</th>
            <th className="px-3 py-2 text-right">Forks</th>
            <th className="px-3 py-2 text-right">Pushes</th>
            <th className="px-3 py-2 text-right">PRs</th>
            <th className="px-3 py-2">Top Contributors</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rowCount }).map((_, index) => (
            <tr key={index} className="border-b border-gray-800/50">
              <td className="px-3 py-3">
                <LoadingSkeleton className="h-4 w-10" />
              </td>
              <td className="px-3 py-3">
                <div className="flex flex-col gap-2">
                  <LoadingSkeleton className="h-5 w-56 max-w-full" />
                  <div className="flex flex-wrap gap-2">
                    <LoadingSkeleton className="h-5 w-20 rounded-full" />
                    <LoadingSkeleton className="h-5 w-16 rounded-full" />
                  </div>
                  <LoadingSkeleton className="h-4 w-full max-w-[560px]" />
                  <LoadingSkeleton className="h-3.5 w-20" />
                </div>
              </td>
              <td className="px-3 py-3 text-right">
                <LoadingSkeleton className="ml-auto h-4 w-14" />
              </td>
              <td className="px-3 py-3 text-right">
                <LoadingSkeleton className="ml-auto h-4 w-14" />
              </td>
              <td className="px-3 py-3 text-right">
                <LoadingSkeleton className="ml-auto h-4 w-14" />
              </td>
              <td className="px-3 py-3 text-right">
                <LoadingSkeleton className="ml-auto h-4 w-14" />
              </td>
              <td className="px-3 py-3">
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, avatarIndex) => (
                    <LoadingSkeleton key={avatarIndex} className="size-[22px] rounded-full" />
                  ))}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TrendingReposPaginationSkeleton() {
  return (
    <div className="mt-3 flex items-center justify-end gap-4 text-sm text-gray-400">
      <LoadingSkeleton className="h-4 w-24" />
      <LoadingSkeleton className="h-8 w-14 rounded-lg" />
      <LoadingSkeleton className="h-4 w-28" />
      <LoadingSkeleton className="size-6 rounded-md" />
      <LoadingSkeleton className="size-6 rounded-md" />
    </div>
  );
}

function HotCollectionsSkeleton() {
  return (
    <div className="relative">
      <LoadingSkeleton className="absolute inset-y-0 left-0 z-10 w-6 rounded-none rounded-l-lg" />
      <LoadingSkeleton className="absolute inset-y-0 right-0 z-10 w-6 rounded-none rounded-r-lg" />
      <div className="flex gap-4 overflow-hidden px-8">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="w-[280px] shrink-0 rounded-lg border-2 border-dashed border-[#3c3c3c] p-4"
          >
            <LoadingSkeleton className="h-5 w-40" />
            <LoadingSkeleton className="mt-2 h-4 w-28" />

            {Array.from({ length: 3 }).map((__, itemIndex) => (
              <div key={itemIndex} className="mt-3 flex items-center gap-2">
                <LoadingSkeleton className="h-4 w-10" />
                <LoadingSkeleton className="size-8 rounded-full" />
                <LoadingSkeleton className="h-4 flex-1" />
              </div>
            ))}

            <LoadingSkeleton className="mt-5 h-4 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}

function TrendingReposSection() {
  const [period, setPeriod] = useState('past_24_hours');
  const [language, setLanguage] = useState('All');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  const params = useMemo(() => ({
    period,
    language: language === 'All' ? 'All' : language,
  }), [period, language]);

  const { data, loading } = useRemoteData<TrendingRepo>('trending-repos', params);
  const allRepos = data?.data ?? [];
  const totalCount = allRepos.length;
  const repos = allRepos.slice(page * rowsPerPage, (page + 1) * rowsPerPage);
  const totalPages = Math.ceil(totalCount / rowsPerPage);

  // Reset page when filters change
  useEffect(() => { setPage(0); }, [period, language]);

  return (
    <section className="px-6 pt-16 pb-8 max-w-[1536px] mx-auto">
      <a id="trending-repos" />
      <h2 className="text-2xl font-bold mb-2">&#x1F525; Trending Repos</h2>
      <p className="text-gray-400 text-sm mb-4">
        We ranked all repositories with score. <b>Total Score = Stars score + Forks score + Base score</b>.
      </p>

      <div className="flex flex-wrap items-center gap-2 mb-2">
        {/* Period dropdown */}
        <Select value={period} onValueChange={setPeriod} className="Select-borderless">
          {periods.map((p) => (
            <SelectItem key={p.key} value={p.key}>{p.label}</SelectItem>
          ))}
        </Select>

        <span className="text-sm text-gray-400 mx-1">Language :</span>

        {/* Language tiles (flat row, overflow into "Others" dropdown) */}
        <div className="flex flex-wrap items-center gap-1 flex-1">
          {languages.slice(0, 16).map((lang) => (
            <button
              key={lang}
              className={`px-2 py-0.5 text-sm rounded-md transition-colors ${
                language === lang
                  ? 'border border-[#ffe895]/55 bg-[#ffe895]/[0.07] text-[#ffe895]'
                  : 'border border-transparent text-gray-400 hover:text-[#fff0b7]'
              }`}
              onClick={() => setLanguage(lang)}
            >
              {lang}
            </button>
          ))}
          <Select
            value={languages.slice(16).includes(language) ? language : undefined}
            onValueChange={setLanguage}
            placeholder="Others"
            className="Select-borderless"
          >
            {languages.slice(16).map((lang) => (
              <SelectItem key={lang} value={lang}>{lang}</SelectItem>
            ))}
          </Select>
        </div>

        {/* SHOW SQL (same row, pushed to right) */}
        {data?.sql ? (
          <ShowSQLInline sql={data.sql} queryName="trending-repos" queryParams={params} />
        ) : loading ? (
          <LoadingSkeleton className="ml-auto h-8 w-24 rounded-xl" />
        ) : null}
      </div>

      {loading ? (
        <TrendingReposTableSkeleton rowCount={rowsPerPage} />
      ) : repos.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700 text-left text-gray-400">
                <th className="px-3 py-2 w-16">Rank</th>
                <th className="px-3 py-2">Repository</th>
                <th className="px-3 py-2 text-right">Stars</th>
                <th className="px-3 py-2 text-right">Forks</th>
                <th className="px-3 py-2 text-right">Pushes</th>
                <th className="px-3 py-2 text-right">PRs</th>
                <th className="px-3 py-2">Top Contributors</th>
              </tr>
            </thead>
            <tbody>
              {repos.map((repo, i) => {
                const contributors = repo.contributor_logins
                  ? repo.contributor_logins.split(',').slice(0, 5)
                  : [];
                const collections = repo.collection_names
                  ? (typeof repo.collection_names === 'string' ? repo.collection_names.split(',') : repo.collection_names as unknown as string[])
                  : [];
                const langColor = LANGUAGE_COLORS[repo.language?.toLowerCase()] ?? '#d1d1d1';
                return (
                  <tr key={repo.repo_id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                    <td className="px-3 py-3 text-gray-400">#{page * rowsPerPage + i + 1}</td>
                    <td className="px-3 py-3">
                      <div>
                        <span className="text-lg font-bold">
                          <Link href={`/analyze/${repo.repo_name}`} className="text-[#ffe895] transition-colors hover:text-[#fff0b7]">
                            {repo.repo_name}
                          </Link>
                          <a href={`https://github.com/${repo.repo_name}`} target="_blank" rel="noopener noreferrer" className="ml-1 text-[#7c7c7c] hover:text-white inline-flex align-middle">
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M3.75 2h3.5a.75.75 0 010 1.5h-3.5a.25.25 0 00-.25.25v8.5c0 .138.112.25.25.25h8.5a.25.25 0 00.25-.25v-3.5a.75.75 0 011.5 0v3.5A1.75 1.75 0 0112.25 14h-8.5A1.75 1.75 0 012 12.25v-8.5C2 2.784 2.784 2 3.75 2zm6.854-1h4.146a.25.25 0 01.25.25v4.146a.25.25 0 01-.427.177L13.03 4.03 9.28 7.78a.751.751 0 01-1.042-.018.751.751 0 01-.018-1.042l3.75-3.75-1.543-1.543A.25.25 0 0110.604 1z" /></svg>
                          </a>
                        </span>
                        {collections.length > 0 && (
                          <span className="ml-2 inline-flex gap-1">
                            {collections.map((c: string) => (
                              <Link
                                key={c}
                                href={`/collections/${toSlug(c.trim())}`}
                                className="rounded-full bg-[#312d1f] px-2 py-0.5 text-xs text-[#ffe895] transition-colors hover:bg-[#3d3724] hover:text-[#fff0b7]"
                              >
                                {c.trim()}
                              </Link>
                            ))}
                          </span>
                        )}
                        {repo.description && (
                          <p className="text-sm text-[#adadad] mt-1 max-w-[600px]">{repo.description}</p>
                        )}
                        {repo.language && (
                          <div className="text-sm text-[#7d7d7d] mt-1 flex items-center gap-1">
                            <span className="inline-block w-[6px] h-[6px] rounded-full" style={{ backgroundColor: langColor }} />
                            {repo.language}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-right">{repo.stars ?? 0}</td>
                    <td className="px-3 py-3 text-right">{repo.forks ?? 0}</td>
                    <td className="px-3 py-3 text-right">{repo.pushes ?? 0}</td>
                    <td className="px-3 py-3 text-right">{repo.pull_requests ?? 0}</td>
                    <td className="px-3 py-3">
                      <div className="flex gap-1">
                        {contributors.map((login) => (
                          <Link key={login} href={`/analyze/${login}`}>
                            <img
                              src={`https://github.com/${login}.png`}
                              alt={login}
                              title={login}
                              className="w-[22px] h-[22px] rounded-full"
                              loading="lazy"
                              width={22}
                              height={22}
                            />
                          </Link>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {loading ? (
        <TrendingReposPaginationSkeleton />
      ) : totalCount > 0 && (
        <div className="flex items-center justify-end gap-4 text-sm text-gray-400 mt-3">
          <span>Rows per page:</span>
          <Select
            value={String(rowsPerPage)}
            onValueChange={(v) => { setRowsPerPage(Number(v)); setPage(0); }}
            className="Select-borderless"
          >
            {[20, 50, 100].map(n => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}
          </Select>
          <span>{page * rowsPerPage + 1}-{Math.min((page + 1) * rowsPerPage, totalCount)} of {totalCount}</span>
          <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="disabled:opacity-30">&lt;</button>
          <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className="disabled:opacity-30">&gt;</button>
        </div>
      )}

      {/* View All link */}
      <div className="mt-4 text-center">
        <Link href="/trending" className="inline-flex items-center gap-1 text-sm font-medium text-[#ffe895] hover:text-[#fff2bd] transition-colors">
          View All Trending →
        </Link>
      </div>
    </section>
  );
}

// --- Hot Collections Section (horizontal scroll carousel like legacy) ---

interface HotCollectionItem {
  id: number;
  name: string;
  repos: number;
  visits: number;
  repo_name: string;
  repo_id: number;
  rank: number;
  rank_changes: number;
  last_month_rank: number;
  last_2nd_month_rank: number;
}

interface CollectionGroup {
  id: number;
  name: string;
  repos: number;
  items: HotCollectionItem[];
}

function HotCollectionsSection() {
  const { data, loading } = useCollectionApi<CollectionQueryResponse<HotCollectionItem>>(getCollectionsHotPath());
  const rawData = data?.data ?? [];
  const scrollRef = useRef<HTMLDivElement>(null);

  const collections = useMemo(() => {
    const result: CollectionGroup[] = [];
    for (const item of rawData) {
      const last = result[result.length - 1];
      if (last && last.id === item.id) {
        last.items.push(item);
      } else {
        result.push({ id: item.id, name: item.name, repos: item.repos, items: [item] });
      }
    }
    return result;
  }, [rawData]);

  const scroll = useCallback((dir: number) => {
    if (scrollRef.current) {
      const w = scrollRef.current.clientWidth;
      scrollRef.current.scrollBy({ left: w * dir * 0.6, behavior: 'smooth' });
    }
  }, []);

  return (
    <section className="px-6 py-8 max-w-[1536px] mx-auto">
      <h2 className="text-2xl font-bold mb-2">&#x1F4D6; Hot Collections</h2>
      <p className="text-gray-400 text-sm mb-4">
        Insights about the monthly and historical rankings and trends in technical fields with curated repository lists.
      </p>

      {loading ? (
        <HotCollectionsSkeleton />
      ) : collections.length > 0 && (
        <div className="relative">
          {/* Scroll arrows */}
          <button
            onClick={() => scroll(-1)}
            className="absolute left-0 top-0 bottom-0 z-10 w-6 flex items-center justify-center bg-[#2c2c2c] border-2 border-dashed border-[#3c3c3c] text-2xl text-gray-400 hover:text-white opacity-70 hover:opacity-100"
          >
            &lt;
          </button>
          <button
            onClick={() => scroll(1)}
            className="absolute right-0 top-0 bottom-0 z-10 w-6 flex items-center justify-center bg-[#2c2c2c] border-2 border-dashed border-[#3c3c3c] text-2xl text-gray-400 hover:text-white opacity-70 hover:opacity-100"
          >
            &gt;
          </button>

          <div ref={scrollRef} className="flex gap-4 overflow-x-auto scrollbar-hide px-8">
            {collections.slice(0, 10).map((col) => (
              <div
                key={col.id}
                className="shrink-0 w-[280px] p-4 border-2 border-dashed border-[#3c3c3c] rounded-lg cursor-pointer hover:shadow-lg hover:-translate-y-[1px] hover:scale-[1.02] transition-all"
                onClick={() => { window.location.href = `/collections/${toSlug(col.name)}`; }}
              >
                <div className="text-base font-medium mb-1">{col.name}</div>
                <div className="text-sm text-[#7C7C7C] mb-3">{col.repos} repositories</div>

                {col.items.slice(0, 3).map((item) => (
                  <div key={item.repo_id} className="flex items-center mt-2">
                    <div className="w-12 shrink-0 text-sm">
                      {item.rank}
                      {item.rank_changes !== 0 && (
                        <span className={`text-xs ml-0.5 ${item.rank_changes > 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {item.rank_changes > 0 ? `+${item.rank_changes}` : item.rank_changes}
                        </span>
                      )}
                    </div>
                    <img
                      src={`https://github.com/${item.repo_name.split('/')[0]}.png`}
                      alt=""
                      className="w-8 h-8 rounded-full mr-2 shrink-0 bg-gray-600"
                      loading="lazy"
                      width={32}
                      height={32}
                    />
                    <span className="text-sm truncate text-[#ffe895] transition-colors hover:text-[#fff0b7]">{item.repo_name}</span>
                  </div>
                ))}

                <div className="mt-3 text-sm">
                  <Link
                    href={`/collections/${toSlug(col.name)}`}
                    className="text-[#ffe895] transition-colors hover:text-[#fff0b7]"
                  >
                    &gt; See All
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

// --- FAQ Section ---

function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = useCallback((i: number) => {
    setOpenIndex((prev) => (prev === i ? null : i));
  }, []);

  return (
    <section
      className="px-6 py-12 max-w-[860px] mx-auto"
      aria-labelledby="faq-heading"
    >
      <h2
        id="faq-heading"
        className="text-2xl font-bold mb-2"
      >
        ❓ Frequently Asked Questions
      </h2>
      <p className="text-gray-400 text-sm mb-8">
        Everything you need to know about OSSInsight.
      </p>

      <div className="space-y-2">
        {FAQ_ITEMS.map((item, i) => {
          const isOpen = openIndex === i;
          return (
            <div
              key={i}
              className="rounded-xl border border-white/[0.07] overflow-hidden"
              style={{ backgroundColor: isOpen ? '#242526' : '#1a1a1b' }}
            >
              <button
                type="button"
                onClick={() => toggle(i)}
                aria-expanded={isOpen}
                className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-white/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffe895]/50"
              >
                <span className="text-[15px] font-medium text-[#e3e3e3]">
                  {item.question}
                </span>
                <span
                  aria-hidden="true"
                  className="shrink-0 text-[#ffe895] transition-transform duration-200"
                  style={{ transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)' }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </span>
              </button>

              {isOpen && (
                <div className="px-5 pb-5">
                  <div className="h-px bg-white/[0.06] mb-4" />
                  <p className="text-[14px] leading-relaxed text-slate-300">
                    {item.answer}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

// --- Footer ---

function Footer() {
  const { data: repoData } = useQuery({
    queryKey: OSSINSIGHT_REPO_QUERY_KEY,
    queryFn: () => fetchGitHubRepo('pingcap', 'ossinsight'),
    staleTime: ONE_HOUR,
    gcTime: ONE_HOUR,
  });
  const starCount = repoData?.data?.stars;

  return (
    <footer className="border-t border-gray-800 mt-12 py-10 px-6">
      <div className="max-w-[1536px] mx-auto">
        {/* CTA */}
        <div className="text-center mb-10">
          <p className="text-lg">
            Follow us at <a href="https://twitter.com/OSSInsight" target="_blank" rel="noopener noreferrer" className="site-link">@OSSInsight</a> and join the conversation using the hashtags
          </p>
          <p className="font-bold text-lg mt-1">#OSSInsight #TiDBCloud</p>
          <div className="mt-4 flex justify-center">
            <div className="inline-flex overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] shadow-[0_18px_45px_-28px_rgba(0,0,0,0.82)]">
              <a
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#ffe895] transition-colors hover:bg-white/[0.05] hover:text-[#fff0b7]"
                href="https://github.com/pingcap/ossinsight"
                rel="noopener noreferrer"
                target="_blank"
                aria-label="Star pingcap/ossinsight on GitHub"
              >
                <svg viewBox="0 0 16 16" width="16" height="16" className="shrink-0 fill-current" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8Z"
                  />
                </svg>
                <span>Star</span>
              </a>
              <a
                className="border-l border-white/10 px-3.5 py-2 text-sm text-[#d3d5de] transition-colors hover:bg-white/[0.05] hover:text-white"
                href="https://github.com/pingcap/ossinsight/stargazers"
                rel="noopener noreferrer"
                target="_blank"
                aria-label={`${starCount?.toLocaleString() ?? 'View'} stargazers on GitHub`}
              >
                {starCount != null ? starCount.toLocaleString() : 'View'}
              </a>
            </div>
          </div>
        </div>

        {/* Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
          <div>
            <h4 className="font-bold mb-3">OSS Insight</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="/collections" className="hover:text-white">Collections</Link></li>
              <li><a href="/blog" className="hover:text-white">Blog</a></li>
              <li><a href="/docs" className="hover:text-white">Workshop</a></li>
              <li><a href="/docs/api" className="hover:text-white">API</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-3">Sponsored By</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="https://www.pingcap.com/tidb-cloud/" target="_blank" rel="noopener noreferrer" className="hover:text-white">TiDB Cloud &#x2197;</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-3">Built With</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="https://docs.github.com/en/rest" target="_blank" rel="noopener noreferrer" className="hover:text-white">GitHub REST API &#x2197;</a></li>
              <li><a href="https://www.gharchive.org/" target="_blank" rel="noopener noreferrer" className="hover:text-white">GH Archive &#x2197;</a></li>
              <li><a href="https://echarts.apache.org/" target="_blank" rel="noopener noreferrer" className="hover:text-white">Apache ECharts &#x2197;</a></li>
              <li><a href="https://reactjs.org/" target="_blank" rel="noopener noreferrer" className="hover:text-white">React &#x2197;</a></li>
              <li><a href="https://www.typescriptlang.org/" target="_blank" rel="noopener noreferrer" className="hover:text-white">TypeScript &#x2197;</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-3">Contacts</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="https://twitter.com/OSSInsight" target="_blank" rel="noopener noreferrer" className="hover:text-white">Twitter &#x2197;</a></li>
              <li><a href="mailto:ossinsight@pingcap.com" className="hover:text-white">Email &#x2197;</a></li>
              <li><a href="https://github.com/pingcap/ossinsight" target="_blank" rel="noopener noreferrer" className="hover:text-white">GitHub &#x2197;</a></li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center text-xs text-gray-500 mt-10">
          Copyright &copy; {new Date().getFullYear()} PingCAP. All Rights Reserved. | <a href="https://pingcap.com/privacy-policy/" target="_blank" rel="noopener noreferrer" className="hover:text-white">Privacy</a>
        </div>
      </div>
    </footer>
  );
}

// --- Main ---

export function HomeContent() {
  return (
    <div>
      <HeroSection />
      <TrendingReposSection />
      <HotCollectionsSection />
      <FAQSection />
      <Footer />
      <style jsx global>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(-6px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes eventSlideIn {
          0% { opacity: 0; transform: translateY(-12px); max-height: 0; }
          30% { opacity: 0.5; max-height: 28px; }
          100% { opacity: 1; transform: translateY(0); max-height: 28px; }
        }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
