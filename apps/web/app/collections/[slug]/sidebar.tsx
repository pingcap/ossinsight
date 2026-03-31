'use client';

import React, { useEffect, useMemo, useRef } from 'react';
import NextLink from 'next/link';
import { usePathname } from 'next/navigation';
import { CollapsibleSidebar } from '@/components/CollapsibleSidebar';
import { toCollectionSlug } from '@/lib/collections';
import type { Collection } from '@/utils/api';
import { cn } from '@/lib/utils';

// Cast to avoid JSX type errors from @types/react version mismatch
const Link = NextLink as unknown as React.ComponentType<any>;

export function CollectionSidebar({
  collections,
  currentSlug,
}: {
  collections: Collection[];
  currentSlug: string;
}) {
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
    <CollapsibleSidebar>
      <nav className="flex-1 overflow-y-auto px-2 pt-4 pb-3">
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
                    ? 'text-white font-medium border-l-2 border-white'
                    : 'text-[#c6c6d0] hover:text-white',
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
                      !isTrends ? 'text-white' : 'text-[#7c7c7c] hover:text-white',
                    )}
                  >
                    Ranking
                  </Link>
                  <Link
                    href={`/collections/${slug}/trends`}
                    className={cn(
                      'block rounded px-3 py-1.5 text-xs transition',
                      isTrends ? 'text-white' : 'text-[#7c7c7c] hover:text-white',
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
          <div className="rounded-md border border-dashed border-white/10 px-4 py-6 text-center text-sm text-slate-500">
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
    </CollapsibleSidebar>
  );
}
