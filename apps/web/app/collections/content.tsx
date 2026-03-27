'use client';

import React, { useDeferredValue, useEffect, useMemo, useTransition } from 'react';
import NextLink from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ArrowDown as ArrowDownIcon, ArrowUp as ArrowUpIcon, ChevronLeft as ChevronLeftIcon, ChevronRight as ChevronRightIcon, Search as SearchIcon } from 'lucide-react';

// Cast to avoid JSX type errors from @types/react version mismatch
const Link = NextLink as unknown as React.ComponentType<any>;
const ArrowDown = ArrowDownIcon as React.ComponentType<any>;
const ArrowUp = ArrowUpIcon as React.ComponentType<any>;
const ChevronLeft = ChevronLeftIcon as React.ComponentType<any>;
const ChevronRight = ChevronRightIcon as React.ComponentType<any>;
const Search = SearchIcon as React.ComponentType<any>;
import { CollectionsWordCloud } from './_components/word-cloud';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toCollectionSlug, type CollectionSort } from '@/lib/collections';
import { cn } from '@/lib/utils';
import type { Collection } from '@/utils/api';

type HotItem = {
  id: number;
  name: string;
  visits: number;
  repos: number;
  rank: number;
  rank_changes: number;
  repo_name: string;
  repo_id: number;
};

type PaginationState = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

type CollectionListItem = Collection & {
  past_month_visits?: number;
};

function buildPagination(currentPage: number, totalPages: number) {
  if (totalPages <= 1) {
    return [];
  }

  const items = new Set<number>([1, totalPages]);

  for (let page = currentPage - 1; page <= currentPage + 1; page += 1) {
    if (page > 1 && page < totalPages) {
      items.add(page);
    }
  }

  return Array.from(items).sort((left, right) => left - right);
}

function RankChange({ value }: { value: number }) {
  if (!value) {
    return null;
  }

  const positive = value > 0;
  const Icon = positive ? ArrowUp : ArrowDown;

  return (
    <span className={cn('ml-1 inline-flex items-center text-xs', positive ? 'text-[#52ff52]' : 'text-[#e30c34]')}>
      <Icon className="mr-0.5 h-3 w-3" />
      {Math.abs(value)}
    </span>
  );
}

function CollectionCard({
  collection,
  items,
}: {
  collection: CollectionListItem;
  items: HotItem[];
}) {
  const router = useRouter();
  const slug = toCollectionSlug(collection.name);

  return (
    <article
      className="group/card cursor-pointer rounded-lg border-2 border-dashed border-[#3c3c3c] bg-transparent p-4 transition-[box-shadow,transform] hover:-translate-y-px hover:shadow-[0_18px_42px_-28px_rgba(0,0,0,0.85)]"
      onClick={() => router.push(`/collections/${slug}`)}
      style={{ contentVisibility: 'auto', containIntrinsicSize: '240px' }}
    >
      <p className="text-base text-white">{collection.name}</p>
      <p className="mb-3 mt-2 text-sm text-[#7c7c7c]">{items[0]?.repos ?? 0} repositories</p>

      {items.slice(0, 3).map((item) => {
        const owner = item.repo_name.split('/')[0] ?? item.repo_name;

        return (
          <div key={item.repo_id} className="mt-2 flex items-center" onClick={(event) => event.stopPropagation()}>
            <div className="w-12 shrink-0 text-sm text-white">
              {item.rank}
              <RankChange value={item.rank_changes} />
            </div>
            <img
              src={`https://github.com/${owner}.png`}
              alt=""
              aria-hidden="true"
              width={32}
              height={32}
              className="mr-2 h-8 w-8 shrink-0 rounded-full"
              loading="lazy"
            />
            <Link
              href={`/analyze/${item.repo_name}`}
              className="site-link truncate text-sm"
            >
              {item.repo_name}
            </Link>
          </div>
        );
      })}

      <div className="mt-3 text-sm" onClick={(event) => event.stopPropagation()}>
        <Button
          asChild
          variant="ghost"
          size="xs"
          className="h-auto rounded-none px-0 py-0 text-[13px] font-medium tracking-[0.02em] text-[#ffe895] shadow-none hover:bg-transparent hover:text-[#fff2bd]"
        >
          <Link href={`/collections/${slug}`} className="inline-flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className="inline-flex h-4 w-4 items-center justify-center text-[#8fb5ff] transition-transform duration-200 group-hover/card:translate-x-0.5"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </span>
            <span>See All</span>
            <span
              aria-hidden="true"
              className="h-px w-4 bg-current/45 transition-[width,opacity] duration-200 group-hover/card:w-6 group-hover/card:opacity-100"
            />
          </Link>
        </Button>
      </div>
    </article>
  );
}

function CollectionsToolbar({
  keyword,
  sort,
  pagination,
}: {
  keyword: string;
  sort: CollectionSort;
  pagination: PaginationState;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [draftKeyword, setDraftKeyword] = React.useState(keyword);
  const deferredKeyword = useDeferredValue(draftKeyword.trim());
  const [isPending, startTransition] = useTransition();
  const activeSort = sort === 'az' ? 'az' : 'recent';

  useEffect(() => {
    setDraftKeyword(keyword);
  }, [keyword]);

  const applyParams = (next: { keyword?: string; sort?: 'recent' | 'az'; page?: number }) => {
    const params = new URLSearchParams(searchParams.toString());
    const nextKeyword = next.keyword ?? keyword;
    const nextSort = next.sort ?? activeSort;
    const nextPage = next.page ?? 1;

    if (nextKeyword) {
      params.set('q', nextKeyword);
    } else {
      params.delete('q');
      params.delete('keyword');
    }

    if (nextSort === 'recent') {
      params.delete('sort');
    } else {
      params.set('sort', nextSort);
    }

    if (nextPage <= 1) {
      params.delete('page');
    } else {
      params.set('page', String(nextPage));
    }

    startTransition(() => {
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname);
    });
  };

  useEffect(() => {
    if (deferredKeyword === keyword) {
      return;
    }

    const timer = window.setTimeout(() => {
      applyParams({ keyword: deferredKeyword, page: 1 });
    }, 250);

    return () => window.clearTimeout(timer);
  }, [deferredKeyword, keyword]);

  return (
    <div className="my-4 flex flex-wrap items-center gap-3">
      <div className="inline-flex items-center rounded-md border border-[#3c3c3c] p-1">
        <button
          type="button"
          onClick={() => applyParams({ sort: 'recent', page: 1 })}
          className={cn(
            'inline-flex items-center gap-1 rounded px-3 py-1.5 text-sm transition',
            activeSort === 'recent' ? 'bg-white/10 text-white' : 'text-[#c6c6d0] hover:text-white',
          )}
        >
          NEW
          <ArrowDown className="h-3.5 w-3.5" />
        </button>
        <div className="mx-1 h-6 w-px bg-[#3c3c3c]" />
        <button
          type="button"
          onClick={() => applyParams({ sort: 'az', page: 1 })}
          className={cn(
            'rounded px-3 py-1.5 text-sm transition',
            activeSort === 'az' ? 'bg-white/10 text-white' : 'text-[#c6c6d0] hover:text-white',
          )}
        >
          A - Z
        </button>
      </div>

      <div className="min-w-0 flex-1" />

      <div className="relative w-full min-w-[220px] sm:w-[240px]">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7c7c7c]" />
        <Input
          value={draftKeyword}
          onChange={(event) => setDraftKeyword(event.target.value)}
          placeholder="Search..."
          className="h-9 rounded-md border-[#3c3c3c] bg-transparent pl-10 shadow-none focus-visible:border-[#555866] focus-visible:bg-transparent focus-visible:ring-0"
        />
      </div>

      <Button
        asChild
        variant="outline"
        className="h-9 rounded-md border-[#5d5531] bg-transparent px-3 text-sm text-[#ffe895] shadow-none hover:border-[#ffe895]/55 hover:bg-transparent hover:text-[#fff2bd]"
      >
        <a
          href="https://github.com/pingcap/ossinsight/blob/main/CONTRIBUTING.md#add-a-collection"
          target="_blank"
          rel="noopener noreferrer"
        >
          + NEW COLLECTION
        </a>
      </Button>

      {isPending && (
        <span className="w-full text-right text-xs uppercase tracking-[0.18em] text-[#7c7c7c]">
          Refreshing
        </span>
      )}

      {pagination.totalPages > 1 && (
        <div className="w-full text-sm text-[#7c7c7c]">
          Showing {(pagination.page - 1) * pagination.pageSize + 1}-
          {Math.min(pagination.page * pagination.pageSize, pagination.total)} of {pagination.total}
        </div>
      )}
    </div>
  );
}

function CollectionsPagination({ pagination }: { pagination: PaginationState }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const pages = buildPagination(pagination.page, pagination.totalPages);

  if (pagination.totalPages <= 1) {
    return null;
  }

  const hrefForPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (page <= 1) {
      params.delete('page');
    } else {
      params.set('page', String(page));
    }
    const query = params.toString();
    return query ? `${pathname}?${query}` : pathname;
  };

  return (
    <nav className="mt-6 flex w-full flex-wrap items-center justify-center gap-2 text-sm">
      <Button
        asChild
        variant="ghost"
        size="sm"
        className={cn('h-8 rounded-md px-2 text-[#c6c6d0] hover:bg-white/5 hover:text-white', !pagination.hasPreviousPage && 'pointer-events-none opacity-40')}
      >
        <Link href={hrefForPage(Math.max(1, pagination.page - 1))}>
          <ChevronLeft className="h-4 w-4" />
        </Link>
      </Button>

      {pages.map((page, index) => {
        const previousPage = pages[index - 1];
        const showGap = previousPage && page - previousPage > 1;

        return (
          <React.Fragment key={page}>
            {showGap && <span className="px-1 text-[#7c7c7c]">...</span>}
            <Button
              asChild
              variant="ghost"
              size="sm"
              className={cn(
                'h-8 rounded-md px-2.5 text-[#c6c6d0] shadow-none hover:bg-white/5 hover:text-white',
                page === pagination.page && 'bg-white/10 text-white hover:bg-white/10',
              )}
            >
              <Link href={hrefForPage(page)}>{page}</Link>
            </Button>
          </React.Fragment>
        );
      })}

      <Button
        asChild
        variant="ghost"
        size="sm"
        className={cn('h-8 rounded-md px-2 text-[#c6c6d0] hover:bg-white/5 hover:text-white', !pagination.hasNextPage && 'pointer-events-none opacity-40')}
      >
        <Link href={hrefForPage(Math.min(pagination.totalPages, pagination.page + 1))}>
          <ChevronRight className="h-4 w-4" />
        </Link>
      </Button>
    </nav>
  );
}

export function CollectionsList({
  collections,
  allCollections,
  hotItems,
  previewItems,
  keyword,
  sort,
  pagination,
}: {
  collections: CollectionListItem[];
  allCollections: Collection[];
  hotItems: HotItem[];
  previewItems: HotItem[];
  keyword: string;
  sort: CollectionSort;
  pagination: PaginationState;
}) {
  const groupedHotItems = useMemo(() => {
    return hotItems.reduce<Map<number, HotItem[]>>((result, item) => {
      const collectionItems = result.get(item.id) ?? [];
      collectionItems.push(item);
      result.set(item.id, collectionItems);
      return result;
    }, new Map());
  }, [hotItems]);

  const groupedPreviewItems = useMemo(() => {
    return previewItems.reduce<Map<number, HotItem[]>>((result, item) => {
      const collectionItems = result.get(item.id) ?? [];
      collectionItems.push(item);
      result.set(item.id, collectionItems);
      return result;
    }, new Map());
  }, [previewItems]);

  return (
    <div className="mx-auto max-w-[1280px] px-6 py-8 sm:px-8">
      <h1 className="text-center text-[30px] font-semibold leading-none tracking-[-0.045em] text-[#f7f7f4] [text-shadow:0_1px_0_rgba(255,255,255,0.05),0_18px_34px_rgba(0,0,0,0.34)] sm:text-[36px] xl:text-[40px]">
        Explore Collections
      </h1>
      <p className="mx-auto mb-2 mt-3 max-w-3xl text-center text-[15px] leading-7 text-[#c6c6d0] xl:max-w-[68rem] xl:whitespace-nowrap">
        Find insights about the monthly or historical rankings and trends in technical fields with curated repository lists.
      </p>

      <CollectionsWordCloud collections={allCollections} />

      <CollectionsToolbar keyword={keyword} sort={sort} pagination={pagination} />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {collections.map((collection) => (
          <CollectionCard
            key={collection.id}
            collection={collection}
            items={groupedHotItems.get(collection.id) ?? groupedPreviewItems.get(collection.id) ?? []}
          />
        ))}
      </div>

      <CollectionsPagination pagination={pagination} />
    </div>
  );
}
