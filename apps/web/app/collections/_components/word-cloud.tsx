'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import NextLink from 'next/link';
import { toCollectionSlug } from '@/lib/collections';

import type { Collection } from '@/utils/api';

// Cast to avoid JSX type errors from @types/react version mismatch
const Link = NextLink as unknown as React.ComponentType<any>;

type CloudWord = {
  id: number;
  text: string;
  slug: string;
  x: number;
  y: number;
  rotate: number;
};

type LayoutWord = {
  text?: string;
  slug?: string;
  id?: number;
  x?: number;
  y?: number;
  rotate?: number;
};

const WORD_CLOUD_COLORS = [
  'rgb(31, 119, 180)',
  'rgb(255, 127, 14)',
  'rgb(44, 160, 44)',
  'rgb(214, 39, 40)',
  'rgb(148, 103, 189)',
  'rgb(140, 86, 75)',
  'rgb(227, 119, 194)',
  'rgb(127, 127, 127)',
  'rgb(188, 189, 34)',
  'rgb(23, 190, 207)',
] as const;

export function CollectionsWordCloud({ collections }: { collections: Collection[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 400 });
  const [words, setWords] = useState<CloudWord[]>([]);

  const items = useMemo(
    () =>
      collections.map((collection) => ({
        id: collection.id,
        text: collection.name,
        slug: toCollectionSlug(collection.name),
        value: 16,
      })),
    [collections],
  );

  const colorBySlug = useMemo(
    () =>
      new Map(
        items.map((item, index) => [
          item.slug,
          WORD_CLOUD_COLORS[index % WORD_CLOUD_COLORS.length],
        ]),
      ),
    [items],
  );

  useEffect(() => {
    const element = containerRef.current;
    if (!element) {
      return;
    }

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) {
        return;
      }

      const nextWidth = Math.floor(entry.contentRect.width);
      if (nextWidth > 0) {
        setSize({ width: nextWidth, height: 400 });
      }
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (size.width === 0 || items.length === 0) {
      return;
    }

    let disposed = false;
    let stop: (() => void) | undefined;

    const build = async () => {
      const mod = await import('d3-cloud');
      const cloud = (mod.default ?? mod) as any;

      let seed = 0;
      const random = () => {
        const x = Math.sin(seed++) * 10000;
        return x - Math.floor(x);
      };

      const layout = cloud()
        .size([size.width, size.height])
        .words(items)
        .padding(8)
        .font('system-ui')
        .fontStyle('italic')
        .fontWeight('bold')
        .fontSize(() => 16)
        .rotate(() => (Math.floor(random() * 2) - 1) * 90)
        .random(random)
        .on('end', (nextWords: LayoutWord[]) => {
          if (disposed) {
            return;
          }

          setWords(
            nextWords
              .filter((word) => word.text && word.slug)
              .map((word) => ({
                id: word.id ?? 0,
                text: word.text ?? '',
                slug: word.slug ?? '',
                x: word.x ?? 0,
                y: word.y ?? 0,
                rotate: word.rotate ?? 0,
              })),
          );
        });

      stop = () => layout.stop();
      layout.start();
    };

    void build();

    return () => {
      disposed = true;
      stop?.();
    };
  }, [items, size.height, size.width]);

  return (
    <div ref={containerRef} className="relative h-[400px] w-full overflow-hidden">
      {words.map((word) => (
        <Link
          key={`${word.id}-${word.slug}`}
          href={`/collections/${word.slug}`}
          className="absolute whitespace-nowrap text-[16px] font-bold italic opacity-60 transition-opacity hover:opacity-100 focus-visible:opacity-100"
          style={{
            color: colorBySlug.get(word.slug) ?? WORD_CLOUD_COLORS[0],
            left: `calc(50% + ${word.x}px)`,
            top: `calc(50% + ${word.y}px)`,
            transform: `translate(-50%, -50%) rotate(${word.rotate}deg)`,
          }}
        >
          {word.text}
        </Link>
      ))}
    </div>
  );
}
