'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import NextLink from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronLeft as ChevronLeftIcon, ChevronRight as ChevronRightIcon } from 'lucide-react';

// Cast to avoid JSX type errors from @types/react version mismatch
const Link = NextLink as unknown as React.ComponentType<any>;
const ChevronLeft = ChevronLeftIcon as React.ComponentType<any>;
const ChevronRight = ChevronRightIcon as React.ComponentType<any>;
import { toCollectionSlug } from '@/lib/collections';
import type { Collection } from '@/utils/api';
import { cn } from '@/lib/utils';

export function CollectionSidebar({
  collections,
  currentSlug,
}: {
  collections: Collection[];
  currentSlug: string;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const activeRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const isTrends = pathname?.endsWith('/trends') || pathname?.endsWith('/trends/');

  const filteredCollections = useMemo(
    () => [...collections].sort((left, right) => left.name.localeCompare(right.name)),
    [collections],
  );

  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: 'center' });
  }, [currentSlug]);

  return (
    <aside
      className="sticky top-[60px] hidden h-[calc(100vh-60px)] shrink-0 overflow-hidden border-r border-[#30313a] bg-transparent transition-all lg:block"
      style={{ width: collapsed ? 30 : 300 }}
    >
      {collapsed ? (
        <button
          type="button"
          onClick={() => setCollapsed(false)}
          className="flex h-full w-full items-start justify-center pt-6 text-[#7c7c7c] transition hover:bg-white/5 hover:text-white"
          title="Expand collections sidebar"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      ) : (
        <div className="flex h-full flex-col">
          <div className="border-b border-[#30313a] px-4 py-4">
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm font-medium text-white">Collections</div>
              <button
                type="button"
                onClick={() => setCollapsed(true)}
                className="flex h-7 w-7 items-center justify-center rounded text-[#7c7c7c] transition hover:bg-white/5 hover:text-white"
                title="Collapse collections sidebar"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto px-2 py-3">
            {filteredCollections.map((collection) => {
              const slug = toCollectionSlug(collection.name);
              const isActive = slug === currentSlug;
              return (
                <div key={collection.id} ref={isActive ? activeRef : undefined} className="mb-1">
                  <Link
                    href={`/collections/${slug}`}
                    className={cn(
                      'block rounded px-3 py-2 text-[14px] leading-5 transition',
                      isActive
                        ? 'bg-white/5 font-medium text-white'
                        : 'text-[#c6c6d0] hover:bg-white/[0.04] hover:text-white',
                    )}
                  >
                    <span className="block truncate">{collection.name}</span>
                  </Link>
                  {isActive && (
                    <div className="mt-1 space-y-1 pl-4">
                      <Link
                        href={`/collections/${slug}`}
                        className={cn(
                          'block rounded px-3 py-1.5 text-xs transition',
                          !isTrends ? 'bg-white/[0.04] text-[#f7df83]' : 'text-[#7c7c7c] hover:text-white',
                        )}
                      >
                        Ranking
                      </Link>
                      <Link
                        href={`/collections/${slug}/trends`}
                        className={cn(
                          'block rounded px-3 py-1.5 text-xs transition',
                          isTrends ? 'bg-white/[0.04] text-[#f7df83]' : 'text-[#7c7c7c] hover:text-white',
                        )}
                      >
                        Popularity Trends
                      </Link>
                    </div>
                  )}
                </div>
              );
            })}

            {filteredCollections.length === 0 && (
              <div className="rounded-2xl border border-dashed border-white/10 px-4 py-6 text-center text-sm text-slate-500">
                No collections match this filter.
              </div>
            )}
          </nav>

          <div className="border-t border-[#30313a] px-4 py-4">
            <a
              href="https://github.com/pingcap/ossinsight/issues/new?template=add-a-collection.md"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[#7c7c7c] transition hover:text-white"
            >
              Add a Collection
            </a>
          </div>
        </div>
      )}
    </aside>
  );
}
