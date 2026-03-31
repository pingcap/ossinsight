'use client';

import { NavItemType } from '@/components/Analyze/Navigation/Navigation';
import clsx from 'clsx';
import * as React from 'react';
import { useCallback } from 'react';
import { twMerge } from 'tailwind-merge';

export function NavigationItem ({ item }: { item: NavItemType }) {
  if (item.anchor) {
    return <NavigationAnchorItem item={item as any} />;
  } else {
    return <NavigationTextItem item={item} />;
  }

}

function NavigationAnchorItem ({ item }: { item: NavItemType & { anchor: string } }) {
  const handleClick = useCallback(() => {
    document.getElementById(item.anchor)?.scrollIntoView({
      behavior: 'smooth',
    });
  }, [item.anchor]);

  return (
    <button
      type="button"
      onClick={handleClick}
      className={twMerge(
        'flex w-full items-center justify-start gap-2 px-3 py-2 text-left text-[14px] leading-5 transition-colors',
        !item.Icon && 'pl-8',
      )}
    >
      {item.Icon && <item.Icon width={16} height={16} />}
      <span>{item.title}</span>
    </button>
  );
}

function NavigationTextItem ({ item }: { item: NavItemType }) {
  return (
    <div
      className={clsx(
        'flex w-full items-center justify-start gap-2 px-3 py-2 text-left text-[14px] leading-5',
        !item.Icon && 'pl-8',
      )}
    >
      {item.Icon && <item.Icon width={16} height={16} />}
      <span>{item.title}</span>
    </div>
  );
}
