'use client';

import * as React from 'react';
import {
  EyeIcon,
  OrganizationIcon,
  RepoIcon,
  PeopleIcon,
} from '@primer/octicons-react';
import { twMerge } from 'tailwind-merge';
import { SearchIcon as LucideSearchIcon } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useRemoteList } from './use-remote-list';
import {
  type RemoteRepoInfo,
  type RemoteUserInfo,
  type RemoteOrgInfo,
  createSearchFunctions,
  getRepoSearchQueryKey,
  getUserSearchQueryKey,
  getOrgSearchQueryKey,
  REPO_SEARCH_STALE_TIME,
  USER_SEARCH_STALE_TIME,
  ORG_SEARCH_STALE_TIME,
} from './search-api';
import {
  Button,
  Input,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  GHAvatar,
} from './ui';

function usePrefetchedRemoteList<Item>(opts: {
  getRemoteOptions: (text: string, signal?: AbortSignal) => Promise<Item[]>;
  prefetchKey: string;
  prefetchKeyword: string;
}) {
  const base = useRemoteList<Item>({
    getRemoteOptions: opts.getRemoteOptions,
    queryKeyPrefix: ['remote-list', opts.prefetchKey],
  });
  const { reload } = base;

  React.useEffect(() => {
    reload(opts.prefetchKeyword);
  }, [reload, opts.prefetchKeyword]);

  return base;
}

const types: {
  name: string;
  id: 'user' | 'repo' | 'org' | 'all';
  placeholder: string;
  Icon: React.ComponentType<any>;
}[] = [
  { name: 'All', id: 'all', placeholder: 'Search for a developer / repository / organization analysis...', Icon: EyeIcon },
  { name: 'User', id: 'user', placeholder: 'Enter a GitHub ID', Icon: PeopleIcon },
  { name: 'Repository', id: 'repo', placeholder: 'Enter a GitHub Repo Name', Icon: RepoIcon },
  { name: 'Organization', id: 'org', placeholder: 'Enter a GitHub Organization Name', Icon: OrganizationIcon },
];

export interface HeaderAnalyzeSelectorProps {
  /** Base URL for GitHub search API proxy, e.g. "" (same origin) or "http://localhost:3001" */
  apiBase?: string;
  /** Called when user selects an item. Receives the relative path like "/analyze/owner/repo" */
  navigateTo?: (url: string) => void;
}

export function HeaderAnalyzeSelector({ apiBase = '', navigateTo }: HeaderAnalyzeSelectorProps) {
  const queryClient = useQueryClient();
  const search = React.useMemo(() => createSearchFunctions(apiBase), [apiBase]);

  const [selectedType, setSelectedType] = React.useState<'user' | 'org' | 'repo' | 'all'>('all');
  const [isOpen, setIsOpen] = React.useState(false);
  const hasPrefetchedRef = React.useRef(false);

  React.useEffect(() => {
    if (!isOpen || hasPrefetchedRef.current) return;
    hasPrefetchedRef.current = true;
    void Promise.all([
      queryClient.prefetchQuery({
        queryKey: getUserSearchQueryKey('recommend-user-list-keyword'),
        queryFn: ({ signal }) => search.searchUser('recommend-user-list-keyword', signal),
        staleTime: USER_SEARCH_STALE_TIME,
      }),
      queryClient.prefetchQuery({
        queryKey: getRepoSearchQueryKey('recommend-repo-list-1-keyword'),
        queryFn: ({ signal }) => search.searchRepo('recommend-repo-list-1-keyword', signal),
        staleTime: REPO_SEARCH_STALE_TIME,
      }),
      queryClient.prefetchQuery({
        queryKey: getOrgSearchQueryKey('recommend-org-list-keyword'),
        queryFn: ({ signal }) => search.searchOrg('recommend-org-list-keyword', signal),
        staleTime: ORG_SEARCH_STALE_TIME,
      }),
    ]);
  }, [isOpen, queryClient, search]);

  const closeModal = () => setIsOpen(false);
  const openModal = () => setIsOpen(true);

  const handleSelectItem = React.useCallback(
    () => (item: RemoteRepoInfo | RemoteUserInfo | RemoteOrgInfo) => {
      closeModal();
      const name = (item as RemoteRepoInfo).fullName || (item as RemoteUserInfo | RemoteOrgInfo).login;
      navigateTo?.(`/analyze/${name}`);
    },
    [navigateTo],
  );

  React.useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === '/') openModal();
      else if (event.key === 'Escape') { closeModal(); event.preventDefault(); }
    };
    document.addEventListener('keypress', handleKeyPress);
    return () => document.removeEventListener('keypress', handleKeyPress);
  }, []);

  return (
    <>
      <Button
        type="button"
        onClick={openModal}
        variant="outline"
        size="lg"
        className="w-full min-w-[20rem] max-w-[32rem] justify-start gap-2.5 rounded-xl border-white/10 bg-transparent px-3.5 text-slate-200 shadow-[0_10px_30px_-18px_rgba(0,0,0,0.6)] hover:border-[#ffe895]/25 hover:bg-white/[0.04] hover:text-slate-100"
      >
        <LucideSearchIcon className="size-4 text-[#ffe895]" />
        Search ...
        <span className="kbd kbd-sm ml-auto">/</span>
      </Button>

      <Dialog open={isOpen} onOpenChange={(open) => { if (!open) closeModal(); }}>
        <DialogContent
          showCloseButton={false}
          className="top-[10vh] max-h-[80vh] w-[min(68rem,calc(100vw-2rem))] max-w-none translate-y-0 overflow-y-auto rounded-[1.75rem] border border-white/10 bg-[#1a1a1b] p-0 text-[#e9eaee] shadow-[0_40px_120px_-60px_rgba(0,0,0,0.98)] ring-1 ring-black/20 supports-backdrop-filter:bg-[#1a1a1b]/98 supports-backdrop-filter:backdrop-blur-2xl sm:w-[min(68rem,calc(100vw-2.5rem))] sm:max-w-none"
        >
          <DialogTitle className="sr-only">Search</DialogTitle>
          <DialogDescription className="sr-only">
            Search developers, repositories, and organizations to jump into OSS Insight analysis pages.
          </DialogDescription>
          <div className="border-b border-white/6 px-6 py-5">
            <SelectTabs selectedType={selectedType} onChange={setSelectedType} />
          </div>
          <div className="px-6 py-5">
            {selectedType === 'all' && (
              <CombinedSearch search={search} handleSelectUser={handleSelectItem()} handleSelectOrg={handleSelectItem()} handleSelectRepo={handleSelectItem()} />
            )}
            {selectedType === 'user' && <UserSearch search={search} handleSelectItem={handleSelectItem()} />}
            {selectedType === 'repo' && <RepoSearch search={search} handleSelectItem={handleSelectItem()} />}
            {selectedType === 'org' && <OrgSearch search={search} handleSelectItem={handleSelectItem()} />}
          </div>
          <BottomTips />
        </DialogContent>
      </Dialog>
    </>
  );
}

// --- Sub-components ---

type SearchFns = ReturnType<typeof createSearchFunctions>;

function SelectTabs({ selectedType, onChange }: { selectedType: string; onChange: (type: any) => void }) {
  return (
    <nav className="flex flex-wrap gap-2" aria-label="Tabs">
      {types.map((tab) => (
        <Button
          key={tab.id}
          type="button"
          variant={tab.id === selectedType ? 'secondary' : 'ghost'}
          size="sm"
          className={twMerge(
            'justify-start rounded-xl px-3.5 text-[13px]',
            tab.id === selectedType ? 'bg-[#212122] text-[#ffe895] hover:bg-[#2a2a2c]' : 'text-slate-300 hover:bg-white/[0.05] hover:text-slate-100',
          )}
          onClick={() => onChange(tab.id)}
        >
          <tab.Icon className="h-4 w-4" />
          {tab.name}
        </Button>
      ))}
    </nav>
  );
}

function BottomTips() {
  return (
    <div className="mt-auto flex cursor-default select-none flex-wrap items-center gap-3 border-t border-white/6 bg-[#212122] px-6 py-3 text-sm text-[#a8aab8]">
      <div className="inline-flex items-center gap-2"><span className="kbd kbd-sm">TAB</span><span className="kbd kbd-sm">▲</span><span className="kbd kbd-sm">▼</span>To Navigation</div>
      <div className="inline-flex items-center gap-2"><span className="kbd kbd-sm">ESC</span>To Close</div>
      <div className="inline-flex items-center gap-2"><span className="kbd kbd-sm">↵</span>To Enter</div>
    </div>
  );
}

function CommonInput({ placeholder, handleInputValueChange }: { placeholder: string; handleInputValueChange: (v: string) => void }) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  React.useEffect(() => { inputRef.current?.focus(); }, []);

  return (
    <div className="relative">
      <LucideSearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        ref={inputRef}
        type="text"
        className="h-11 rounded-xl border-white/10 bg-[#212122] pl-9 text-[#eef0f5] placeholder:text-[#84879a] focus-visible:border-[#f7df83]/45 focus-visible:ring-2 focus-visible:ring-[#f7df83]/18"
        placeholder={placeholder}
        autoFocus
        onChange={(e) => handleInputValueChange(e.target.value || '')}
      />
    </div>
  );
}

function CommonResultList<T extends { id: string | number }>({
  loading, error, items, getAvatarName, renderLabel, handleSelectItem, className, id, skeletonCount: skeletonCountProp,
}: {
  loading: boolean; error: any; items: T[]; getAvatarName: (item: T) => string;
  renderLabel: (item: T) => string | React.ReactNode; handleSelectItem?: (item: T) => void;
  className?: string; id?: string; skeletonCount?: number;
}) {
  const lastCountRef = React.useRef(0);
  if (!loading && items.length > 0) lastCountRef.current = items.length;
  const skeletonCount = skeletonCountProp ?? (lastCountRef.current || 6);

  return (
    <ul role="list" className={twMerge('mt-4 space-y-1', className)} id={id}>
      {loading && Array.from({ length: skeletonCount }).map((_, i) => (
        <li key={`skeleton-${i}`} className="px-4 py-2.5">
          <div className="inline-flex gap-2 items-center w-full animate-pulse">
            <div className="h-8 w-8 rounded-full bg-white/8 flex-shrink-0" />
            <div className="h-4 rounded bg-white/8" style={{ width: `${40 + ((i * 37) % 60)}%` }} />
          </div>
        </li>
      ))}
      {!loading && error && <li className="px-2 py-4 text-xs text-[#87879a]">Failed to load</li>}
      {!loading && !error && !items.length && <li className="px-2 py-4 text-xs text-[#87879a]">No results found. Try a different keyword or check the spelling.</li>}
      {items.map((item) => (
        <li
          tabIndex={0}
          key={item.id}
          className="group cursor-pointer overflow-hidden rounded-xl px-4 py-2.5 text-sm text-slate-300 transition-colors hover:bg-white/[0.05] hover:text-slate-100 focus:bg-white/[0.06] focus:text-slate-100"
          onKeyDown={(e) => { if (e.key === 'Enter') handleSelectItem?.(item); }}
          onClick={() => handleSelectItem?.(item)}
        >
          <div className="inline-flex gap-2 items-center w-full">
            <GHAvatar name={getAvatarName(item)} size={6} />
            {renderLabel(item)}
            <span className="ml-auto hidden text-[#87879a] group-focus:block"><span className="kbd kbd-sm">↵</span> Go</span>
          </div>
        </li>
      ))}
    </ul>
  );
}

function UserSearch({ search, handleSelectItem }: { search: SearchFns; handleSelectItem?: (item: RemoteUserInfo) => void }) {
  const { items, reload, error, loading } = usePrefetchedRemoteList<RemoteUserInfo>({
    getRemoteOptions: search.searchUser, prefetchKey: 'user', prefetchKeyword: 'recommend-user-list-keyword',
  });
  return (
    <>
      <CommonInput placeholder="Enter a GitHub ID" handleInputValueChange={reload} />
      <CommonResultList id="analyze-selector-results" loading={loading} error={error} items={items} getAvatarName={(i) => i.login} renderLabel={(i) => i.login} handleSelectItem={handleSelectItem} />
    </>
  );
}

function RepoSearch({ search, handleSelectItem }: { search: SearchFns; handleSelectItem?: (item: RemoteRepoInfo) => void }) {
  const { items, reload, error, loading } = usePrefetchedRemoteList<RemoteRepoInfo>({
    getRemoteOptions: search.searchRepo, prefetchKey: 'repo', prefetchKeyword: 'recommend-repo-list-1-keyword',
  });
  return (
    <>
      <CommonInput placeholder="Enter a GitHub Repo Name" handleInputValueChange={reload} />
      <CommonResultList id="analyze-selector-results" loading={loading} error={error} items={items} getAvatarName={(i) => i.fullName} renderLabel={(i) => i.fullName} handleSelectItem={handleSelectItem} />
    </>
  );
}

function OrgSearch({ search, handleSelectItem }: { search: SearchFns; handleSelectItem?: (item: RemoteOrgInfo) => void }) {
  const { items, reload, error, loading } = usePrefetchedRemoteList<RemoteOrgInfo>({
    getRemoteOptions: search.searchOrg, prefetchKey: 'org', prefetchKeyword: 'recommend-org-list-keyword',
  });
  return (
    <>
      <CommonInput placeholder="Enter a GitHub Organization Name" handleInputValueChange={reload} />
      <CommonResultList id="analyze-selector-results" loading={loading} error={error} items={items} getAvatarName={(i) => i.login} renderLabel={(i) => i.login} handleSelectItem={handleSelectItem} />
    </>
  );
}

function CombinedSearch({ search, handleSelectUser, handleSelectRepo, handleSelectOrg, limit = 4 }: {
  search: SearchFns; handleSelectUser?: (item: RemoteUserInfo) => void; handleSelectRepo?: (item: RemoteRepoInfo) => void; handleSelectOrg?: (item: RemoteOrgInfo) => void; limit?: number;
}) {
  const { items: userItems, reload: userReload, error: userError, loading: userLoading } = usePrefetchedRemoteList<RemoteUserInfo>({ getRemoteOptions: search.searchUser, prefetchKey: 'user', prefetchKeyword: 'recommend-user-list-keyword' });
  const { items: repoItems, reload: repoReload, error: repoError, loading: repoLoading } = usePrefetchedRemoteList<RemoteRepoInfo>({ getRemoteOptions: search.searchRepo, prefetchKey: 'repo', prefetchKeyword: 'recommend-repo-list-1-keyword' });
  const { items: orgItems, reload: orgReload, error: orgError, loading: orgLoading } = usePrefetchedRemoteList<RemoteOrgInfo>({ getRemoteOptions: search.searchOrg, prefetchKey: 'org', prefetchKeyword: 'recommend-org-list-keyword' });

  const handleInputValueChange = React.useCallback((v: string) => { userReload(v); repoReload(v); orgReload(v); }, [userReload, repoReload, orgReload]);

  return (
    <>
      <CommonInput placeholder={types[0].placeholder} handleInputValueChange={handleInputValueChange} />
      <div id="analyze-selector-results-all">
        <div className="border-b border-[var(--divide-color-default)] mt-4">
          <label className="text-sm font-semibold">Developer</label>
          <CommonResultList loading={userLoading} error={userError} items={userItems.slice(0, limit)} getAvatarName={(i) => i.login} renderLabel={(i) => i.login} handleSelectItem={handleSelectUser} className="mt-0" skeletonCount={limit} />
        </div>
        <div className="border-b border-[var(--divide-color-default)] mt-4">
          <label className="text-sm font-semibold">Repository</label>
          <CommonResultList loading={repoLoading} error={repoError} items={repoItems.slice(0, limit)} getAvatarName={(i) => i.fullName} renderLabel={(i) => i.fullName} handleSelectItem={handleSelectRepo} className="mt-0" skeletonCount={limit} />
        </div>
        <div className="mt-4">
          <label className="text-sm font-semibold">Organization</label>
          <CommonResultList loading={orgLoading} error={orgError} items={orgItems.slice(0, limit)} getAvatarName={(i) => i.login} renderLabel={(i) => i.login} handleSelectItem={handleSelectOrg} className="mt-0" skeletonCount={limit} />
        </div>
      </div>
    </>
  );
}
