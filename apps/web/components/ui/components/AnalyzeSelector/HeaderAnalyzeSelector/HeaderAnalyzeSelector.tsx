'use client';

import * as React from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { RemoteRepoInfo } from '../../GHRepoSelector';
import { RemoteUserInfo } from '../../GHUserSelector';
import { RemoteOrgInfo } from '../../GHOrgSelector';
import {
  EyeIcon,
  OrganizationIcon,
  RepoIcon,
  PeopleIcon,
} from '@primer/octicons-react';
import { twMerge } from 'tailwind-merge';
import {
  useRemoteList,
} from '../../RemoteSelector/useRemoteList';
import {
  getUserSearchQueryKey,
  searchUser,
  USER_SEARCH_STALE_TIME,
} from '../../GHUserSelector/utils';
import {
  getRepoSearchQueryKey,
  searchRepo,
  REPO_SEARCH_STALE_TIME,
} from '../../GHRepoSelector/utils';
import {
  getOrgSearchQueryKey,
  searchOrg,
  ORG_SEARCH_STALE_TIME,
} from '../../GHOrgSelector/utils';

import { GHAvatar } from '../../GHAvatar';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { SearchIcon as LucideSearchIcon } from 'lucide-react';

function usePrefetchedRemoteList<Item>(opts: {
  getRemoteOptions: (text: string) => any;
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
  endEle?: React.ReactNode;
}[] = [
  {
    name: 'All',
    id: 'all',
    placeholder:
      'Search for a developer / repository / organization analysis...',
    Icon: EyeIcon,
  },
  {
    name: 'User',
    id: 'user',
    placeholder: 'Enter a GitHub ID',
    Icon: PeopleIcon,
  },
  {
    name: 'Repository',
    id: 'repo',
    placeholder: 'Enter a GitHub Repo Name',
    Icon: RepoIcon,
  },
  {
    name: 'Organization',
    id: 'org',
    placeholder: 'Enter a GitHub Organization Name',
    Icon: OrganizationIcon,
  },
];

export interface HeaderAnalyzeSelectorProps {
  navigateTo?: (url: string) => void;
}

export function HeaderAnalyzeSelector(props: HeaderAnalyzeSelectorProps) {
  const { navigateTo } = props;
  const queryClient = useQueryClient();

  const [selectedType, setSelectedType] = React.useState<
    'user' | 'org' | 'repo' | 'all'
  >('all');
  const [isOpen, setIsOpen] = React.useState(false);
  const hasPrefetchedRef = React.useRef(false);

  React.useEffect(() => {
    if (!isOpen || hasPrefetchedRef.current) {
      return;
    }

    hasPrefetchedRef.current = true;

    void Promise.all([
      queryClient.prefetchQuery({
        queryKey: getUserSearchQueryKey('recommend-user-list-keyword'),
        queryFn: ({ signal }) => searchUser('recommend-user-list-keyword', signal),
        staleTime: USER_SEARCH_STALE_TIME,
      }),
      queryClient.prefetchQuery({
        queryKey: getRepoSearchQueryKey('recommend-repo-list-1-keyword'),
        queryFn: ({ signal }) => searchRepo('recommend-repo-list-1-keyword', signal),
        staleTime: REPO_SEARCH_STALE_TIME,
      }),
      queryClient.prefetchQuery({
        queryKey: getOrgSearchQueryKey('recommend-org-list-keyword'),
        queryFn: ({ signal }) => searchOrg('recommend-org-list-keyword', signal),
        staleTime: ORG_SEARCH_STALE_TIME,
      }),
    ]);
  }, [isOpen, queryClient]);

  function closeModal() {
    setIsOpen(false);
  }

  function openModal() {
    setIsOpen(true);
  }

  const handleTypeChange = React.useCallback(
    (type: 'user' | 'repo' | 'org' | 'all') => {
      setSelectedType(type);
    },
    []
  );

  const handleSelectUser = React.useCallback(
    () =>
      (item: RemoteUserInfo) => {
        closeModal();
        navigateTo?.(`/analyze-user/${item.login}`);
      },
    [navigateTo]
  );

  const handleSelectNonUser = React.useCallback(
    () =>
      (item: RemoteRepoInfo | RemoteOrgInfo) => {
        closeModal();
        const name =
          (item as RemoteRepoInfo)!.fullName ||
          (item as RemoteOrgInfo)!.login;
        navigateTo?.(`/analyze/${name}`);
      },
    [navigateTo]
  );

  React.useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      const tag = (event.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || (event.target as HTMLElement)?.isContentEditable) {
        return;
      }
      if (event.key === '/') {
        openModal();
        event.preventDefault();
      } else if (event.key === 'Escape') {
        closeModal();
        event.preventDefault();
      }
    };
    document.addEventListener('keypress', handleKeyPress);
    return () => {
      document.removeEventListener('keypress', handleKeyPress);
    };
  }, []);

  return (
    <>
      <Button
        type='button'
        onClick={openModal}
        variant='outline'
        size='lg'
        className='w-full max-w-[26rem] justify-start gap-2.5 rounded-sm border-white/10 bg-transparent px-3.5 text-slate-200 shadow-[0_10px_30px_-18px_rgba(0,0,0,0.6)] hover:border-white/20 hover:bg-white/[0.04] hover:text-slate-100'
      >
        <LucideSearchIcon className='size-4 text-[#e9eaee]' />
        Search ...
        <span className='kbd kbd-sm ml-auto'>/</span>
      </Button>

      <Dialog open={isOpen} onOpenChange={(open) => { if (!open) closeModal(); }}>
        <DialogContent
          showCloseButton={false}
          className='search-dialog top-[10vh] max-h-[80vh] translate-y-0 overflow-y-auto rounded-sm border border-white/10 bg-[#1a1a1b] p-0 text-[#e9eaee] shadow-[0_40px_120px_-60px_rgba(0,0,0,0.98)] ring-1 ring-black/20 supports-backdrop-filter:bg-[#1a1a1b]/98 supports-backdrop-filter:backdrop-blur-2xl'
        >
          <DialogTitle className='sr-only'>Search</DialogTitle>
          <DialogDescription className='sr-only'>
            Search developers, repositories, and organizations to jump into OSS Insight analysis pages.
          </DialogDescription>
          <div className='border-b border-white/6 px-6 py-5'>
            <SelectTabs
              selectedType={selectedType}
              onChange={handleTypeChange}
            />
          </div>
          <div className='px-6 py-5'>
            {selectedType === 'all' && (
              <CombinedSearch
                handleSelectUser={handleSelectUser()}
                handleSelectOrg={handleSelectNonUser()}
                handleSelectRepo={handleSelectNonUser()}
              />
            )}
            {selectedType === 'user' && (
              <UserSearch handleSelectItem={handleSelectUser()} />
            )}
            {selectedType === 'repo' && (
              <RepoSearch handleSelectItem={handleSelectNonUser()} />
            )}
            {selectedType === 'org' && (
              <OrgSearch handleSelectItem={handleSelectNonUser()} />
            )}
          </div>
          <BottomTips />
        </DialogContent>
      </Dialog>
    </>
  );
}

const SelectTabs = (props: {
  selectedType: 'user' | 'repo' | 'org' | 'all';
  onChange: (type: 'user' | 'repo' | 'org' | 'all') => void;
}) => {
  const { selectedType, onChange: handleTypeChange } = props;

  return (
    <nav className='flex flex-wrap gap-2' aria-label='Tabs'>
      {types.map((tab) => (
        <Button
          key={tab.id}
          type='button'
          variant={tab.id === selectedType ? 'secondary' : 'ghost'}
          size='sm'
          className={twMerge(
            'justify-start rounded-md px-3.5 text-[13px]',
            tab.id === selectedType
              ? 'bg-white/10 text-white hover:bg-[#2a2a2c]'
              : 'text-slate-300 hover:bg-white/[0.05] hover:text-slate-100'
          )}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              handleTypeChange(tab.id as any);
            }
          }}
          onClick={() => handleTypeChange(tab.id as any)}
        >
          <tab.Icon className='h-4 w-4' />
          {tab.name}
          {tab?.endEle}
        </Button>
      ))}
    </nav>
  );
};

const BottomTips = () => {
  return (
    <div className='mt-auto flex cursor-default select-none flex-wrap items-center gap-3 border-t border-white/6 bg-[#212122] px-6 py-3 text-sm text-[#a8aab8]'>
      <div className='inline-flex items-center gap-2'>
        <span className='kbd kbd-sm'>TAB</span>
        <span className='kbd kbd-sm'>▲</span>
        <span className='kbd kbd-sm'>▼</span>
        To Navigation
      </div>
      <div className='inline-flex items-center gap-2'>
        <span className='kbd kbd-sm'>ESC</span>
        To Close
      </div>
      <div className='inline-flex items-center gap-2'>
        <span className='kbd kbd-sm'>↵</span>
        To Enter
      </div>
    </div>
  );
};

const CommonInput = (props: {
  placeholder: string;
  handleInputValueChange: (value: string) => void;
}) => {
  const { placeholder, handleInputValueChange } = props;

  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    const inputCurrent = inputRef.current;
    inputCurrent?.focus();
  }, []);

  React.useEffect(() => {
    const handleSlash = (event: KeyboardEvent) => {
      if (event.key === '/') {
        inputRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handleSlash);
    return () => {
      document.removeEventListener('keydown', handleSlash);
    };
  }, []);

  return (
    <div className='relative'>
      <LucideSearchIcon className='pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground' />
      <Input
        ref={inputRef}
        type='text'
        name='header-search'
        id='header-search'
        className='h-11 rounded-sm border-white/10 bg-[#212122] pl-9 text-[#eef0f5] placeholder:text-[#84879a] focus-visible:border-white/45 focus-visible:ring-2 focus-visible:ring-white/18'
        placeholder={placeholder}
        autoFocus
        onChange={(event) => {
          handleInputValueChange(event.target.value || '');
        }}
      />
    </div>
  );
};

function CommonResultList<T extends { id: string | number }>(props: {
  loading: boolean;
  error: any;
  items: T[];
  getAvatarName: (item: T) => string;
  renderLabel: (item: T) => string | React.ReactNode;
  handleSelectItem?: (item: T) => void;
  className?: string;
  id?: string;
  skeletonCount?: number;
}) {
  const {
    loading,
    error,
    items,
    getAvatarName,
    renderLabel,
    handleSelectItem,
    className,
    id,
    skeletonCount: skeletonCountProp,
  } = props;

  const lastCountRef = React.useRef(0);
  if (!loading && items.length > 0) {
    lastCountRef.current = items.length;
  }
  const skeletonCount = skeletonCountProp ?? (lastCountRef.current || 6);

  return (
    <>
      <ul role='list' className={twMerge('mt-4 space-y-1', className)} id={id}>
        {loading && Array.from({ length: skeletonCount }).map((_, i) => (
          <li key={`skeleton-${i}`} className='px-4 py-2.5'>
            <div className='inline-flex gap-2 items-center w-full animate-pulse'>
              <div className='h-8 w-8 rounded-full bg-white/8 flex-shrink-0' />
              <div className='h-4 rounded bg-white/8' style={{ width: `${40 + ((i * 37) % 60)}%` }} />
            </div>
          </li>
        ))}
        {!loading && error && (
          <li className='px-2 py-4 text-xs text-[#87879a]'>Failed to load</li>
        )}
        {!loading && !error && !items.length && (
          <li className='px-2 py-4 text-xs text-[#87879a]'>No results found. Try a different keyword or check the spelling.</li>
        )}
        {items.map((item) => (
          <li
            tabIndex={0}
            key={item.id}
            className='group cursor-pointer overflow-hidden rounded-md px-4 py-2.5 text-sm text-slate-300 transition-colors hover:bg-white/[0.05] hover:text-slate-100 focus:bg-white/[0.06] focus:text-slate-100'
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                handleSelectItem?.(item);
              }
            }}
            onClick={() => {
              handleSelectItem?.(item);
            }}
          >
            <div className='inline-flex gap-2 items-center w-full'>
              <GHAvatar name={getAvatarName(item)} size={6} />
              {renderLabel(item)}
              <span className='ml-auto hidden text-[#87879a] group-focus:block'>
                <span className='kbd kbd-sm'>↵</span> Go
              </span>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}

function CommonSearch<T extends { id: string | number }>(props: {
  placeholder: string;
  handleInputValueChange: (value: string) => void;
  loading: boolean;
  error: any;
  items: T[];
  getAvatarName: (item: T) => string;
  renderLabel: (item: T) => string | React.ReactNode;
  handleSelectItem?: (item: T) => void;
  className?: string;
}) {
  const { placeholder, handleInputValueChange, ...rest } = props;

  React.useEffect(() => {
    const handleKeyUpDown = (e: KeyboardEvent) => {
      if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
      const focusElem = document.querySelector(':focus');
      const tabElements = [
        ...(document.querySelectorAll('#analyze-selector-results > li') as any),
      ];
      const tabElementsCount = tabElements.length - 1;
      if (!tabElements.includes(focusElem)) return;
      e.preventDefault();
      const focusIndex = tabElements.indexOf(focusElem);
      let elemToFocus;
      if (e.key === 'ArrowUp')
        elemToFocus =
          tabElements[focusIndex > 0 ? focusIndex - 1 : tabElementsCount];
      if (e.key === 'ArrowDown')
        elemToFocus =
          tabElements[focusIndex < tabElementsCount ? focusIndex + 1 : 0];
      elemToFocus.focus();
    };
    document.addEventListener('keydown', handleKeyUpDown);
    return () => {
      document.removeEventListener('keydown', handleKeyUpDown);
    };
  }, [rest.items]);

  return (
    <>
      <CommonInput
        placeholder={placeholder}
        handleInputValueChange={handleInputValueChange}
      />
      <CommonResultList id='analyze-selector-results' {...rest} />
    </>
  );
}

function UserSearch(props: {
  handleSelectItem?: (item: RemoteUserInfo) => void;
}) {
  const { handleSelectItem } = props;

  const { items, reload, error, loading } = usePrefetchedRemoteList<RemoteUserInfo>({
    getRemoteOptions: searchUser,
    prefetchKey: 'user',
    prefetchKeyword: 'recommend-user-list-keyword',
  });

  const handleInputValueChange = React.useCallback(
    (value: string) => {
      reload(value);
    },
    [reload]
  );

  const renderLabel = React.useCallback(
    (item: RemoteUserInfo) => item.login,
    []
  );

  return (
    <CommonSearch
      placeholder='Enter a GitHub ID'
      handleInputValueChange={handleInputValueChange}
      loading={loading}
      error={error}
      items={items}
      getAvatarName={renderLabel}
      renderLabel={renderLabel}
      handleSelectItem={handleSelectItem}
    />
  );
}

function RepoSearch(props: {
  handleSelectItem?: (item: RemoteRepoInfo) => void;
}) {
  const { handleSelectItem } = props;

  const { items, reload, error, loading } = usePrefetchedRemoteList<RemoteRepoInfo>({
    getRemoteOptions: searchRepo,
    prefetchKey: 'repo',
    prefetchKeyword: 'recommend-repo-list-1-keyword',
  });

  const handleInputValueChange = React.useCallback(
    (value: string) => {
      reload(value);
    },
    [reload]
  );

  const renderLabel = React.useCallback(
    (item: RemoteRepoInfo) => item.fullName,
    []
  );

  if (error) {
    // search error – silently continue
  }

  return (
    <CommonSearch
      placeholder='Enter a GitHub Repo Name'
      handleInputValueChange={handleInputValueChange}
      loading={loading}
      error={error}
      items={items}
      getAvatarName={renderLabel}
      renderLabel={renderLabel}
      handleSelectItem={handleSelectItem}
    />
  );
}

function OrgSearch(
  props: { handleSelectItem?: (item: RemoteOrgInfo) => void } = {}
) {
  const { handleSelectItem } = props;

  const { items, reload, error, loading } = usePrefetchedRemoteList<RemoteOrgInfo>({
    getRemoteOptions: searchOrg,
    prefetchKey: 'org',
    prefetchKeyword: 'recommend-org-list-keyword',
  });

  const handleInputValueChange = React.useCallback(
    (value: string) => {
      reload(value);
    },
    [reload]
  );

  const renderLabel = React.useCallback(
    (item: RemoteOrgInfo) => item.login,
    []
  );

  return (
    <CommonSearch
      placeholder='Enter a GitHub Organization Name'
      handleInputValueChange={handleInputValueChange}
      loading={loading}
      error={error}
      items={items}
      getAvatarName={renderLabel}
      renderLabel={renderLabel}
      handleSelectItem={handleSelectItem}
    />
  );
}

function CombinedSearch(props: {
  handleSelectOrg?: (item: RemoteOrgInfo) => void;
  handleSelectRepo?: (item: RemoteRepoInfo) => void;
  handleSelectUser?: (item: RemoteUserInfo) => void;
  limit?: number;
}) {
  const {
    handleSelectOrg,
    handleSelectRepo,
    handleSelectUser,
    limit = 4,
  } = props;

  const {
    items: orgItems,
    reload: orgReload,
    error: orgError,
    loading: orgLoading,
  } = usePrefetchedRemoteList<RemoteOrgInfo>({
    getRemoteOptions: searchOrg,
    prefetchKey: 'org',
    prefetchKeyword: 'recommend-org-list-keyword',
  });
  const {
    items: repoItems,
    reload: repoReload,
    error: repoError,
    loading: repoLoading,
  } = usePrefetchedRemoteList<RemoteRepoInfo>({
    getRemoteOptions: searchRepo,
    prefetchKey: 'repo',
    prefetchKeyword: 'recommend-repo-list-1-keyword',
  });
  const {
    items: userItems,
    reload: userReload,
    error: userError,
    loading: userLoading,
  } = usePrefetchedRemoteList<RemoteUserInfo>({
    getRemoteOptions: searchUser,
    prefetchKey: 'user',
    prefetchKeyword: 'recommend-user-list-keyword',
  });

  const handleInputValueChange = React.useCallback(
    (value: string) => {
      orgReload(value);
      repoReload(value);
      userReload(value);
    },
    [orgReload, repoReload, userReload]
  );

  const renderUserOrgLabel = React.useCallback(
    (item: RemoteOrgInfo | RemoteUserInfo) => item.login,
    []
  );

  const renderRepoLabel = React.useCallback(
    (item: RemoteRepoInfo) => item.fullName,
    []
  );

  React.useEffect(() => {
    const handleKeyUpDown = (e: KeyboardEvent) => {
      if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
      const focusElem = document.querySelector(':focus');
      const tabElements = [
        ...(document.querySelectorAll(
          '#analyze-selector-results-all li'
        ) as any),
      ];
      const tabElementsCount = tabElements.length - 1;
      if (!tabElements.includes(focusElem)) return;
      e.preventDefault();
      e.stopPropagation();
      const focusIndex = tabElements.indexOf(focusElem);
      let elemToFocus;
      if (e.key === 'ArrowUp')
        elemToFocus =
          tabElements[focusIndex > 0 ? focusIndex - 1 : tabElementsCount];
      if (e.key === 'ArrowDown')
        elemToFocus =
          tabElements[focusIndex < tabElementsCount ? focusIndex + 1 : 0];
      elemToFocus.focus();
    };
    document.addEventListener('keydown', handleKeyUpDown);
    return () => {
      document.removeEventListener('keydown', handleKeyUpDown);
    };
  }, [repoItems, orgItems, userItems]);


  return (
    <>
      <CommonInput
        placeholder={types[0].placeholder}
        handleInputValueChange={handleInputValueChange}
      />
      <div id='analyze-selector-results-all'>
        <div className='border-b border-[var(--divide-color-default)] mt-4'>
          <label className='text-sm	font-semibold'>Developer</label>
          <CommonResultList
            loading={userLoading}
            error={userError}
            items={userItems.slice(0, limit)}
            getAvatarName={renderUserOrgLabel}
            renderLabel={renderUserOrgLabel}
            handleSelectItem={handleSelectUser}
            className='mt-0'
            skeletonCount={limit}
          />
        </div>
        <div className='border-b border-[var(--divide-color-default)] mt-4'>
          <label className='text-sm	font-semibold'>Repository</label>
          <CommonResultList
            loading={repoLoading}
            error={repoError}
            items={repoItems.slice(0, limit)}
            getAvatarName={renderRepoLabel}
            renderLabel={renderRepoLabel}
            handleSelectItem={handleSelectRepo}
            className='mt-0'
            skeletonCount={limit}
          />
        </div>
        <div className='mt-4'>
          <label className='text-sm	font-semibold'>Organization</label>
          <CommonResultList
            loading={orgLoading}
            error={orgError}
            items={orgItems.slice(0, limit)}
            getAvatarName={renderUserOrgLabel}
            renderLabel={renderUserOrgLabel}
            handleSelectItem={handleSelectOrg}
            className='mt-0'
            skeletonCount={limit}
          />
        </div>
      </div>
    </>
  );
}
