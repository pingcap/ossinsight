'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import ShareButtons from '@/components/ShareButtons';

const LANGUAGE_COLORS: Record<string, string> = {
  JavaScript: '#f1e05a', Java: '#b07219', Python: '#3572A5', PHP: '#4F5D95',
  'C++': '#f34b7d', 'C#': '#178600', TypeScript: '#3178c6', Shell: '#89e051',
  C: '#555555', Ruby: '#701516', Rust: '#dea584', Go: '#00ADD8',
  Kotlin: '#A97BFF', HCL: '#844FBA', PowerShell: '#012456', CMake: '#DA3434',
  Groovy: '#4298b8', PLpgSQL: '#336790', TSQL: '#e38c00', Dart: '#00B4AB',
  Swift: '#F05138', HTML: '#e34c26', CSS: '#563d7c', Elixir: '#6e4a7e',
  Haskell: '#5e5086', Solidity: '#AA6746', Assembly: '#6E4C13', R: '#198CE7',
  Scala: '#c22d40', Julia: '#a270ba', Lua: '#000080', Clojure: '#db5855',
  Erlang: '#B83998', 'Common Lisp': '#3fb68b', 'Emacs Lisp': '#c065db',
  OCaml: '#ef7a08', MATLAB: '#e16737', 'Objective-C': '#438eff',
  Perl: '#0298c3', Fortran: '#4d41b1',
};

const nf = new Intl.NumberFormat('en');

interface TrendingContentProps {
  repos: Array<{
    repo_id: number;
    repo_name: string;
    language: string;
    description: string;
    stars: number;
    forks: number;
    total_score: number;
  }>;
  period: string;
  language: string;
  languages: string[];
  periods: Array<{ value: string; label: string }>;
}

export function TrendingContent({ repos, period, language, languages, periods }: TrendingContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateFilter = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if ((key === 'language' && value === 'All') || (key === 'period' && value === 'past_week')) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.push(`/trending?${params.toString()}`);
  }, [router, searchParams]);

  const totalStars = repos.reduce((sum, r) => sum + (r.stars ?? 0), 0);

  return (
    <div className="mx-auto max-w-[1280px] px-6 py-8">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">
            🔥 Trending Repositories
          </h1>
          <p className="mt-2 text-base text-[#7c7c7c]">
            The most popular open source projects on GitHub right now, ranked by community activity.
          </p>
        </div>
        <ShareButtons
          url="/trending"
          title="Trending GitHub Repositories on OSSInsight"
          className="shrink-0 mt-1"
        />
      </div>

      {/* Cross-links */}
      <nav aria-label="Related pages" className="mb-6 flex flex-wrap items-center gap-4 text-sm text-[#7c7c7c]">
        <Link href="/languages" className="transition-colors hover:text-white">
          Browse by Language →
        </Link>
        <span className="text-[#333]">·</span>
        <Link href="/collections" className="transition-colors hover:text-white">
          Browse Collections →
        </Link>
      </nav>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-center gap-4">
        {/* Period tabs */}
        <div className="flex items-center rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] p-1">
          {periods.map((p) => (
            <button
              key={p.value}
              onClick={() => updateFilter('period', p.value)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                period === p.value
                  ? 'bg-[#333] text-white'
                  : 'text-[#7c7c7c] hover:text-white'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Language selector */}
        <Select value={language} onValueChange={(value) => updateFilter('language', value)}>
          <SelectTrigger size="sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Languages</SelectItem>
            {languages.map((lang) => (
              <SelectItem key={lang} value={lang}>
                <span className="flex items-center gap-2">
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: LANGUAGE_COLORS[lang] ?? '#8b8b8b' }}
                  />
                  {lang}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Stats bar */}
      {repos.length > 0 && (
        <div className="mb-6 flex items-center gap-6 rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] px-6 py-3">
          <div>
            <span className="text-xl font-bold text-white">{repos.length}</span>
            <span className="ml-2 text-xs text-[#7c7c7c] uppercase tracking-wider">Repos</span>
          </div>
          <div className="h-6 w-px bg-[#333]" />
          <div>
            <span className="text-xl font-bold text-[#ffe895]">{nf.format(totalStars)}</span>
            <span className="ml-2 text-xs text-[#7c7c7c] uppercase tracking-wider">Total Stars</span>
          </div>
          {language !== 'All' && (
            <>
              <div className="h-6 w-px bg-[#333]" />
              <div className="flex items-center gap-2">
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: LANGUAGE_COLORS[language] ?? '#8b8b8b' }}
                />
                <span className="text-sm text-white">{language}</span>
              </div>
            </>
          )}
        </div>
      )}

      {/* Table */}
      {repos.length === 0 ? (
        <p className="mt-10 text-sm text-[#7c7c7c]">No trending repositories found.</p>
      ) : (
        <>
          <div className="hidden sm:grid sm:grid-cols-[3rem_1fr_6rem_6rem] gap-2 px-4 py-2 text-xs font-medium uppercase tracking-wider text-[#555] border-b border-[#2a2a2a]">
            <div>Rank</div>
            <div>Repository</div>
            <div className="text-right">Stars</div>
            <div className="text-right">Forks</div>
          </div>

          <div className="divide-y divide-[#1e1e1e]">
            {repos.map((repo, index) => {
              const owner = repo.repo_name.split('/')[0] ?? '';
              const repoLang = repo.language;

              return (
                <div
                  key={repo.repo_id}
                  className="group grid grid-cols-1 sm:grid-cols-[3rem_1fr_6rem_6rem] gap-2 items-center px-4 py-3 hover:bg-[#1a1a1a] transition-colors"
                >
                  <div className="hidden sm:block text-sm font-medium text-[#7c7c7c]">
                    {index + 1}
                  </div>

                  <div className="flex items-center gap-3 min-w-0">
                    <span className="sm:hidden text-sm font-medium text-[#555] w-6 shrink-0">{index + 1}</span>
                    <img
                      src={`https://github.com/${owner}.png`}
                      alt=""
                      aria-hidden="true"
                      width={32}
                      height={32}
                      className="h-8 w-8 shrink-0 rounded-full"
                      loading="lazy"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/analyze/${repo.repo_name}`}
                          className="text-sm font-medium text-white hover:text-[#ffe895] transition-colors truncate"
                        >
                          {repo.repo_name}
                        </Link>
                        {repoLang && (
                          <Link
                            href={`/languages/${encodeURIComponent(repoLang)}`}
                            className="hidden sm:inline-flex items-center gap-1 shrink-0 rounded-full border border-[#333] px-2 py-0.5 text-[10px] text-[#7c7c7c] transition-colors hover:border-[#555] hover:text-white"
                          >
                            <span
                              className="h-2 w-2 rounded-full"
                              style={{ backgroundColor: LANGUAGE_COLORS[repoLang] ?? '#8b8b8b' }}
                            />
                            {repoLang}
                          </Link>
                        )}
                      </div>
                      {repo.description && (
                        <p className="text-xs text-[#555] truncate max-w-lg mt-0.5">
                          {repo.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="hidden sm:block text-right text-sm text-[#ffe895]">
                    {nf.format(repo.stars)}
                  </div>

                  <div className="hidden sm:block text-right text-sm text-[#7c7c7c]">
                    {nf.format(repo.forks)}
                  </div>

                  <div className="sm:hidden flex items-center gap-4 ml-9 text-xs text-[#7c7c7c]">
                    <span className="text-[#ffe895]">⭐ {nf.format(repo.stars)}</span>
                    <span>🍴 {nf.format(repo.forks)}</span>
                    {repoLang && (
                      <span className="flex items-center gap-1">
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: LANGUAGE_COLORS[repoLang] ?? '#8b8b8b' }}
                        />
                        {repoLang}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
