'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowUp, ArrowDown, Star, TrendingUp, ChevronRight, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TrendingAIResponse, AIRepoItem } from './api/route';

const CATEGORIES = [
  { key: 'All', label: 'All' },
  { key: 'AI Agents', label: 'AI Agents' },
  { key: 'LLM Tools', label: 'LLM Tools' },
  { key: 'MCP Servers', label: 'MCP Servers' },
  { key: 'Coding Agents', label: 'Coding Agents' },
  { key: 'RAG', label: 'RAG' },
  { key: 'Inference', label: 'Inference' },
  { key: 'Vector DB', label: 'Vector DB' },
  { key: 'Vibe Coding', label: 'Vibe Coding' },
  { key: 'AI Assistants', label: 'AI Assistants' },
] as const;

const CATEGORY_COLORS: Record<string, string> = {
  'AI Agents': '#e9eaee',
  'LLM Tools': '#6ea8fe',
  'MCP Servers': '#7ecfb2',
  'Coding Agents': '#f0a07c',
  'RAG': '#a8d98a',
  'Inference': '#f4b962',
  'Vector DB': '#c4b1f0',
  'Vibe Coding': '#f08080',
  'AI Assistants': '#72c5f0',
};

const COLLECTION_SLUGS: Record<number, string> = {
  10098: 'ai-agent-frameworks',
  10076: 'llm-tools',
  10105: 'mcp-servers',
  10106: 'coding-agents',
  10108: 'rag-frameworks',
  10109: 'llm-inference-engines',
  10077: 'vector-search-engines',
  10107: 'vibe-coding-tools',
  10112: 'ai-coding-assistants',
};

type SortField = 'total' | 'growth';

function formatNumber(value: number): string {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  }
  return String(value);
}

function formatFullNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value);
}

function RepoAvatar({ repoName }: { repoName: string }) {
  const owner = repoName.split('/')[0];
  return (
    <img
      src={`https://github.com/${owner}.png?size=40`}
      alt={owner}
      width={20}
      height={20}
      className="rounded-full"
      loading="lazy"
    />
  );
}

export function TrendingAIContent({
  initialData,
  faqItems,
}: {
  initialData: TrendingAIResponse;
  faqItems: { question: string; answer: string }[];
}) {
  const [activeCategory, setActiveCategory] = useState('All');
  const [sortField, setSortField] = useState<SortField>('total');
  const [sortAsc, setSortAsc] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const filteredRepos = useMemo(() => {
    let repos = initialData.repos;
    if (activeCategory !== 'All') {
      repos = repos.filter((r) => r.category === activeCategory);
    }
    return [...repos].sort((a, b) => {
      const diff = sortAsc ? a[sortField] - b[sortField] : b[sortField] - a[sortField];
      return diff;
    });
  }, [initialData.repos, activeCategory, sortField, sortAsc]);

  const topMovers = useMemo(() => {
    return [...initialData.repos]
      .filter((r) => r.growth > 0)
      .sort((a, b) => b.growth - a.growth)
      .slice(0, 5);
  }, [initialData.repos]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1a1b]">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-[#363638] bg-gradient-to-b from-[#1a1a1b] to-[#121212] py-16 md:py-24">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 50% 0%, #e9eaee 0%, transparent 50%)' }} />
        <div className="relative mx-auto max-w-6xl px-4 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#363638] bg-[#212122] px-4 py-1.5 text-sm text-[#c6c6d0]">
            <Sparkles className="h-4 w-4 text-[#e9eaee]" />
            Updated hourly from 10B+ GitHub events
          </div>
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-[#e9eaee] md:text-5xl lg:text-6xl">
            Trending AI Repositories
            <br />
            <span className="text-[#e9eaee]">on GitHub — 2026</span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-[#7c7c7c]">
            Real-time rankings of the top AI open source projects across agent frameworks,
            LLM tools, MCP servers, coding agents, and more.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Category Filter Tabs */}
        <div className="mb-8 flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={cn(
                'rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
                activeCategory === cat.key
                  ? 'bg-white text-[#1f1e28]'
                  : 'border border-[#363638] bg-[#212122] text-[#c6c6d0] hover:border-white hover:text-white',
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Top Movers Section */}
        {activeCategory === 'All' && topMovers.length > 0 && (
          <section className="mb-10">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-[#e9eaee]">
              <TrendingUp className="h-5 w-5 text-[#7ecfb2]" />
              Top Movers — Last 28 Days
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {topMovers.map((repo, idx) => (
                <Link
                  key={repo.repo_name}
                  href={`/analyze/${repo.repo_name}`}
                  className="group rounded-lg border border-[#363638] bg-[#212122] p-4 transition-colors hover:border-white"
                >
                  <div className="mb-2 flex items-center gap-2">
                    <RepoAvatar repoName={repo.repo_name} />
                    <span className="truncate text-sm font-medium text-[#e9eaee] group-hover:text-white">
                      {repo.repo_name.split('/')[1]}
                    </span>
                  </div>
                  <div className="mb-1 text-xs text-[#7c7c7c]">{repo.repo_name.split('/')[0]}</div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-sm text-[#7ecfb2]">
                      <ArrowUp className="h-3 w-3" />
                      +{formatNumber(repo.growth)} stars
                    </span>
                    <span
                      className="rounded px-1.5 py-0.5 text-xs"
                      style={{
                        color: CATEGORY_COLORS[repo.category] ?? '#c6c6d0',
                        backgroundColor: `${CATEGORY_COLORS[repo.category] ?? '#c6c6d0'}15`,
                      }}
                    >
                      {repo.category}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Full Ranking Table */}
        <section className="mb-10">
          <h2 className="mb-4 text-lg font-semibold text-[#e9eaee]">
            {activeCategory === 'All' ? 'Top 50 AI Repositories' : `${activeCategory} Rankings`}
          </h2>
          <div className="overflow-x-auto rounded-lg border border-[#363638]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#363638] bg-[#212122]">
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#7c7c7c]">Rank</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#7c7c7c]">Repository</th>
                  <th
                    className="cursor-pointer px-4 py-3 text-right text-xs font-medium text-[#7c7c7c] hover:text-white"
                    onClick={() => handleSort('total')}
                  >
                    <span className="inline-flex items-center gap-1">
                      Stars
                      {sortField === 'total' && (sortAsc ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
                    </span>
                  </th>
                  <th
                    className="cursor-pointer px-4 py-3 text-right text-xs font-medium text-[#7c7c7c] hover:text-white"
                    onClick={() => handleSort('growth')}
                  >
                    <span className="inline-flex items-center gap-1">
                      Growth (28d)
                      {sortField === 'growth' && (sortAsc ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
                    </span>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#7c7c7c]">Category</th>
                </tr>
              </thead>
              <tbody>
                {filteredRepos.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-[#7c7c7c]">
                      No repositories found.
                    </td>
                  </tr>
                )}
                {filteredRepos.map((repo, idx) => (
                  <tr
                    key={repo.repo_name}
                    className="border-b border-[#29292a] transition-colors hover:bg-[#212122]"
                  >
                    <td className="px-4 py-3 text-[#7c7c7c]">{idx + 1}</td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/analyze/${repo.repo_name}`}
                        className="inline-flex items-center gap-2 text-[#e9eaee] hover:text-white"
                      >
                        <RepoAvatar repoName={repo.repo_name} />
                        <span className="font-medium">{repo.repo_name}</span>
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-right text-[#c6c6d0]">
                      <span className="inline-flex items-center gap-1">
                        <Star className="h-3 w-3 text-[#e9eaee]" />
                        {formatFullNumber(repo.total)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {repo.growth > 0 ? (
                        <span className="inline-flex items-center gap-1 text-[#7ecfb2]">
                          <ArrowUp className="h-3 w-3" />
                          +{formatFullNumber(repo.growth)}
                        </span>
                      ) : (
                        <span className="text-[#7c7c7c]">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="rounded px-2 py-0.5 text-xs"
                        style={{
                          color: CATEGORY_COLORS[repo.category] ?? '#c6c6d0',
                          backgroundColor: `${CATEGORY_COLORS[repo.category] ?? '#c6c6d0'}15`,
                        }}
                      >
                        {repo.category}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Category Breakdown */}
        <section className="mb-10">
          <h2 className="mb-4 text-lg font-semibold text-[#e9eaee]">Category Breakdown</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {initialData.categories.map((cat) => {
              const slug = COLLECTION_SLUGS[cat.id];
              return (
                <div
                  key={cat.id}
                  className="rounded-lg border border-[#363638] bg-[#212122] p-5"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <h3
                      className="font-semibold"
                      style={{ color: CATEGORY_COLORS[cat.category] ?? '#e9eaee' }}
                    >
                      {cat.category}
                    </h3>
                    <span className="text-sm text-[#7c7c7c]">{cat.count} repos</span>
                  </div>
                  {cat.topRepo && (
                    <p className="mb-3 text-sm text-[#c6c6d0]">
                      Top: <Link href={`/analyze/${cat.topRepo}`} className="hover:text-white">{cat.topRepo}</Link>
                    </p>
                  )}
                  {slug && (
                    <Link
                      href={`/collections/${slug}`}
                      className="inline-flex items-center gap-1 text-sm text-[#e9eaee] hover:underline"
                    >
                      View full collection <ChevronRight className="h-3 w-3" />
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mb-10">
          <h2 className="mb-4 text-lg font-semibold text-[#e9eaee]">
            ❓ Frequently Asked Questions
          </h2>
          <div className="space-y-2">
            {faqItems.map((item, i) => {
              const isOpen = openFaq === i;
              return (
                <div
                  key={item.question}
                  className="rounded-md border border-white/[0.07] overflow-hidden"
                  style={{ backgroundColor: isOpen ? '#242526' : '#1a1a1b' }}
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-white/[0.04]"
                  >
                    <span className="text-[15px] font-medium text-[#e3e3e3]">
                      {item.question}
                    </span>
                    <span
                      aria-hidden="true"
                      className="shrink-0 text-white transition-transform duration-200"
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
      </div>
    </div>
  );
}
