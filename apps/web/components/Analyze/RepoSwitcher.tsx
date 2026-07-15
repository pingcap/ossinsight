'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, ChevronDown, ExternalLink, Search } from 'lucide-react';
import { GHAvatar } from '@/components/ui/components/GHAvatar';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useRemoteList } from '@/components/ui/components/RemoteSelector/useRemoteList';
import type { RemoteRepoInfo } from '@/components/ui/components/GHRepoSelector';
import { searchRepo } from '@/components/ui/components/GHRepoSelector/utils';

interface RepoSwitcherProps {
  repoName: string;
  repoId: number;
  variant?: 'hero' | 'sticky';
}

const RECOMMENDED_REPOS_KEYWORD = 'recommend-repo-list-1-keyword';

function getSearchKeyword(query: string) {
  return query.trim() || RECOMMENDED_REPOS_KEYWORD;
}

export function RepoSwitcher({ repoName, repoId, variant = 'hero' }: RepoSwitcherProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const { reload, items, loading, error } = useRemoteList<RemoteRepoInfo>({
    getRemoteOptions: searchRepo,
    queryKeyPrefix: ['analyze', 'repo-switcher'],
    debounceMs: 250,
  });

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (nextOpen) {
      setQuery('');
      reload(RECOMMENDED_REPOS_KEYWORD);
    }
  };

  const selectRepo = (repo: RemoteRepoInfo) => {
    setOpen(false);
    if (repo.id !== repoId) {
      router.push(`/analyze/${repo.fullName}`);
    }
  };

  const isHero = variant === 'hero';

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={`Switch repository. Current repository: ${repoName}`}
          className={`group inline-flex min-w-0 items-center rounded-md text-[#e9eaee] transition-colors hover:bg-white/[0.05] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 ${
            isHero
              ? 'gap-2 px-1.5 py-1 text-[28px] font-semibold leading-tight'
              : 'gap-2.5 px-2 py-1 text-[15px] font-medium'
          }`}
        >
          {!isHero && <GHAvatar name={repoName} size={24} rounded={false} />}
          <span className="truncate">{repoName}</span>
          <ChevronDown
            className={`shrink-0 text-[#7c7c7c] transition-transform group-data-[state=open]:rotate-180 ${isHero ? 'h-5 w-5' : 'h-4 w-4'}`}
            aria-hidden="true"
          />
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        sideOffset={8}
        className="w-[min(24rem,calc(100vw-2rem))] gap-2 p-2"
      >
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7c7c7c]" aria-hidden="true" />
          <Input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              reload(getSearchKeyword(event.target.value));
            }}
            aria-label="Search repositories"
            autoComplete="off"
            spellCheck={false}
            placeholder="Search repositories…"
            className="h-9 pl-9"
          />
        </div>

        <div className="max-h-64 overflow-y-auto overscroll-contain py-1">
          {loading ? (
            <p className="px-3 py-6 text-center text-sm text-[#8f8f96]" aria-live="polite">Searching…</p>
          ) : error ? (
            <p className="px-3 py-6 text-center text-sm text-[#d8a0a0]">Repository search failed. Try again.</p>
          ) : items.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-[#8f8f96]">
              No repositories found.
            </p>
          ) : (
            <ul className="space-y-1">
              {items.map((repo) => {
                const selected = repo.id === repoId;
                return (
                  <li key={repo.id}>
                    <button
                      type="button"
                      onClick={() => selectRepo(repo)}
                      className="flex w-full min-w-0 items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm text-[#c6c6d0] transition-colors hover:bg-white/[0.06] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
                    >
                      <GHAvatar name={repo.fullName} size={24} />
                      <span className="min-w-0 flex-1 truncate">{repo.fullName}</span>
                      {selected && <Check className="h-4 w-4 shrink-0 text-[#FFE895]" aria-label="Current repository" />}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="border-t border-white/10 pt-2">
          <a
            href={`https://github.com/${repoName}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between rounded-md px-3 py-2 text-sm text-[#8f8f96] transition-colors hover:bg-white/[0.05] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
          >
            <span>View {repoName} on GitHub</span>
            <ExternalLink className="h-4 w-4 shrink-0" aria-hidden="true" />
          </a>
        </div>
      </PopoverContent>
    </Popover>
  );
}
