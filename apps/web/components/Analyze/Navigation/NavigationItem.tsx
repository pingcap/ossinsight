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
    history.replaceState(history.state, '', '#' + encodeURIComponent(item.anchor));
  }, [item.anchor]);

  return (
    <button
      type="button"
      onClick={handleClick}
      className={twMerge(
        'flex w-full items-center justify-start gap-2 px-4 py-1.5 text-left transition-colors hover:text-white md:justify-center lg:justify-start',
        item.Icon ? 'text-sm font-normal' : 'text-sm md:pl-9',
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
        'flex w-full items-center justify-start gap-2 px-4 py-1.5 text-left md:justify-center lg:justify-start',
        item.Icon ? 'text-sm font-normal' : 'text-sm md:pl-9',
      )}
    >
      {item.Icon && <item.Icon width={16} height={16} />}
      <span>{item.title}</span>
    </div>
  );
}
