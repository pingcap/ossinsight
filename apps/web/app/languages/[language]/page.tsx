import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BreadcrumbListJsonLd, ItemListJsonLd } from '@/components/json-ld';
import ShareButtons from '@/components/ShareButtons';
import {
  LANGUAGES,
  isValidLanguage,
  getTrendingReposByLanguage,
} from '@/lib/server/internal-api';

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

export const revalidate = 3600;
export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ language: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { language: rawLang } = await params;
  const language = decodeURIComponent(rawLang);

  if (!isValidLanguage(language)) {
    return {};
  }

  const title = `${language} — Trending GitHub Repos | OSSInsight`;
  const description = `Discover the most popular and fastest-growing ${language} repositories on GitHub. Real-time rankings powered by 10B+ GitHub events.`;

  return {
    title,
    description,
    keywords: ['OSSInsight', 'GitHub', language, 'trending', 'repositories', 'open source'],
    openGraph: { title, description },
    twitter: { title, description, card: 'summary_large_image' },
    alternates: { canonical: `/languages/${encodeURIComponent(language)}` },
  };
}

const nf = new Intl.NumberFormat('en');

export default async function LanguagePage({ params }: PageProps) {
  const { language: rawLang } = await params;
  const language = decodeURIComponent(rawLang);

  if (!isValidLanguage(language)) {
    notFound();
  }

  let repos: Array<{
    repo_id: number;
    repo_name: string;
    language: string;
    description: string;
    stars: number;
    forks: number;
    total_score: number;
  }> = [];

  try {
    repos = await getTrendingReposByLanguage(language, 'past_month');
  } catch (err) {
    console.error(`[languages/${language}] query failed:`, err);
  }

  // Find other languages for sidebar navigation
  const currentIndex = LANGUAGES.indexOf(language as any);
  const relatedLanguages = LANGUAGES.filter((_, i) => i !== currentIndex).slice(0, 12);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${language} Trending Repositories`,
    description: `Top ${language} repositories on GitHub ranked by community activity.`,
    url: `https://ossinsight.io/languages/${encodeURIComponent(language)}`,
    isPartOf: {
      '@type': 'WebSite',
      name: 'OSSInsight',
      url: 'https://ossinsight.io',
    },
  };

  // Compute aggregate stats
  const totalStars = repos.reduce((sum, r) => sum + (r.stars ?? 0), 0);
  const totalForks = repos.reduce((sum, r) => sum + (r.forks ?? 0), 0);

  return (
    <>
      <BreadcrumbListJsonLd items={[
        { name: 'Home', url: '/' },
        { name: 'Languages', url: '/languages' },
        { name: language },
      ]} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {repos.length > 0 && (
        <ItemListJsonLd
          name={`Trending ${language} Repositories`}
          items={repos.map((r) => ({
            name: r.repo_name,
            url: `https://ossinsight.io/analyze/${r.repo_name}`,
          }))}
        />
      )}

      <div className="mx-auto max-w-[1280px] px-6 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link href="/languages" className="text-sm text-[#7c7c7c] hover:text-white transition-colors">
            ← All Languages
          </Link>
        </div>

        <div className="flex gap-8">
          {/* Main content */}
          <div className="min-w-0 flex-1">
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-4">
                <span
                  className="h-6 w-6 shrink-0 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.15)]"
                  style={{ backgroundColor: LANGUAGE_COLORS[language] ?? '#8b8b8b' }}
                />
                <h1 className="text-3xl font-bold text-white">
                  {language}
                </h1>
              </div>
              <ShareButtons
                url={`/languages/${encodeURIComponent(language)}`}
                title={`Trending ${language} repositories on OSSInsight`}
              />
            </div>
            <p className="text-base text-[#7c7c7c] mb-6">
              Trending {language} repositories on GitHub — ranked by total activity score (stars, forks, pushes, PRs) over the past month.
            </p>

            {/* Stats summary */}
            {repos.length > 0 && (
              <div className="mb-8 flex items-center gap-6 rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] px-6 py-4">
                <div>
                  <div className="text-2xl font-bold text-white">{repos.length}</div>
                  <div className="text-xs text-[#7c7c7c] uppercase tracking-wider">Trending Repos</div>
                </div>
                <div className="h-8 w-px bg-[#333]" />
                <div>
                  <div className="text-2xl font-bold text-[#ffe895]">{nf.format(totalStars)}</div>
                  <div className="text-xs text-[#7c7c7c] uppercase tracking-wider">Total Stars</div>
                </div>
                <div className="h-8 w-px bg-[#333]" />
                <div>
                  <div className="text-2xl font-bold text-[#8fb5ff]">{nf.format(totalForks)}</div>
                  <div className="text-xs text-[#7c7c7c] uppercase tracking-wider">Total Forks</div>
                </div>
              </div>
            )}

            {/* Ranking heading */}
            <h2 className="text-xl font-semibold text-white mb-4">
              🔥 Trending {language} Repos — Past Month
            </h2>

            {repos.length === 0 ? (
              <p className="mt-6 text-sm text-[#7c7c7c]">No trending repositories found for {language}.</p>
            ) : (
              <>
                {/* Table header */}
                <div className="hidden sm:grid sm:grid-cols-[3rem_1fr_6rem_6rem] gap-2 px-4 py-2 text-xs font-medium uppercase tracking-wider text-[#555] border-b border-[#2a2a2a]">
                  <div>Rank</div>
                  <div>Repository</div>
                  <div className="text-right">Stars</div>
                  <div className="text-right">Forks</div>
                </div>

                {/* Table rows */}
                <div className="divide-y divide-[#1e1e1e]">
                  {repos.map((repo, index) => {
                    const owner = repo.repo_name.split('/')[0] ?? '';
                    return (
                      <div
                        key={repo.repo_id}
                        className="group grid grid-cols-1 sm:grid-cols-[3rem_1fr_6rem_6rem] gap-2 items-center px-4 py-3 hover:bg-[#1a1a1a] transition-colors"
                      >
                        {/* Rank */}
                        <div className="hidden sm:block text-sm font-medium text-[#7c7c7c]">
                          {index + 1}
                        </div>

                        {/* Repo info */}
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
                          <div className="min-w-0">
                            <Link
                              href={`/analyze/${repo.repo_name}`}
                              className="text-sm font-medium text-white hover:text-[#ffe895] transition-colors"
                            >
                              {repo.repo_name}
                            </Link>
                            {repo.description && (
                              <p className="text-xs text-[#555] truncate max-w-md mt-0.5">
                                {repo.description}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Stars */}
                        <div className="hidden sm:block text-right text-sm text-[#ffe895]">
                          {nf.format(repo.stars)}
                        </div>

                        {/* Forks */}
                        <div className="hidden sm:block text-right text-sm text-[#7c7c7c]">
                          {nf.format(repo.forks)}
                        </div>

                        {/* Mobile stats row */}
                        <div className="sm:hidden flex items-center gap-4 ml-9 text-xs text-[#7c7c7c]">
                          <span className="text-[#ffe895]">⭐ {nf.format(repo.stars)}</span>
                          <span>🍴 {nf.format(repo.forks)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Sidebar */}
          <aside className="hidden lg:block w-56 shrink-0">
            <div className="sticky top-20">
              <h3 className="text-sm font-semibold text-[#7c7c7c] uppercase tracking-wider mb-3">
                Other Languages
              </h3>
              <nav className="space-y-1">
                {relatedLanguages.map((lang) => (
                  <Link
                    key={lang}
                    href={`/languages/${encodeURIComponent(lang)}`}
                    className="flex items-center gap-2 rounded px-2 py-1.5 text-sm text-[#7c7c7c] hover:text-white hover:bg-[#1a1a1a] transition-colors"
                  >
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: LANGUAGE_COLORS[lang] ?? '#8b8b8b' }}
                    />
                    {lang}
                  </Link>
                ))}
                <Link
                  href="/languages"
                  className="block px-2 py-1.5 text-xs text-[#555] hover:text-white transition-colors"
                >
                  View all →
                </Link>
              </nav>

              <h3 className="mt-8 text-sm font-semibold text-[#7c7c7c] uppercase tracking-wider mb-3">
                Explore
              </h3>
              <nav aria-label="Related pages" className="space-y-1">
                <Link
                  href="/trending"
                  className="block rounded px-2 py-1.5 text-sm text-[#7c7c7c] hover:text-white hover:bg-[#1a1a1a] transition-colors"
                >
                  Trending Repos
                </Link>
                <Link
                  href="/collections"
                  className="block rounded px-2 py-1.5 text-sm text-[#7c7c7c] hover:text-white hover:bg-[#1a1a1a] transition-colors"
                >
                  Collections
                </Link>
              </nav>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
