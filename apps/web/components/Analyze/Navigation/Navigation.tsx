'use client';
import { NavigationItem } from '@/components/Analyze/Navigation/NavigationItem';
import { ScrollspySection, useScrollspyCurrentSection, useScrollspySubscribeCurrentSection } from '@/components/Scrollspy';
import clsx from 'clsx';
import * as React from 'react';

export default function Navigation (props: { items: NavItemType[] }) {
  const currentSection = useScrollspyCurrentSection();
  const { items } = props;

  const highlightIdMemo = React.useMemo(() => {
    return calcSelectedIdParents(items, (currentSection?.id ?? getClientHash()) || null);
  }, [items, currentSection]);

  return (
    <>
      <NavList
        items={items}
        selectedId={currentSection?.id ?? null}
        highlightId={highlightIdMemo}
      />
    </>
  );
}

const setHashFromCurrentSection = (current: ScrollspySection | null) => {
  if (current) {
    history.replaceState(history.state, '', '#' + encodeURIComponent(current.id));
  }
};

const getClientHash = () => typeof location === 'undefined' ? undefined : decodeURIComponent(location.hash);

const NavList = (props: {
  items: NavItemType[];
  selectedId: string | null;
  depth?: number;
  highlightId?: string[];
}) => {
  const { items, selectedId, depth = 0, highlightId = [] } = props;
  useScrollspySubscribeCurrentSection(setHashFromCurrentSection);

  return (
    <ul
      className={clsx('flex w-full md:flex-col', {
        'overflow-x-auto md:h-full px-2 pt-4 pb-3': depth === 0,
        'mt-1 space-y-0.5 pl-4': depth > 0,
      })}
    >
      {items.map((item) => {
        if (item.isDivider) {
          return (
            <li key={item.id} className="hidden items-center gap-1.5 px-3 pb-1 pt-5 first:pt-0 md:flex">
              {item.Icon && <item.Icon width={14} height={14} className="text-[#7c7c7c]" />}
              <span className="text-[12px] font-medium uppercase tracking-[0.08em] text-[#7c7c7c]">{item.title}</span>
            </li>
          );
        }
        const isSelected = selectedId === item.id;
        const isHighlighted = highlightId.includes(item.id);
        return (
          <React.Fragment key={item.id}>
            <li
              className={clsx(
                'transition',
                isSelected
                  ? 'text-white font-medium border-l-2 border-white'
                  : isHighlighted
                    ? 'text-white'
                    : 'text-[#c6c6d0] hover:text-white',
              )}
            >
              <NavigationItem item={item} />

              {item.children && (
                <NavList
                  items={item.children}
                  selectedId={selectedId}
                  depth={depth + 1}
                  highlightId={highlightId}
                />
              )}
            </li>
          </React.Fragment>
        );
      })}
    </ul>
  );
};

const calcSelectedIdParents = (
  items: NavItemType[],
  selectedId: string | null,
): string[] => {
  const parents: string[] = [];
  const find = (items: NavItemType[], selectedId: string | null) => {
    for (const item of items) {
      if (item.id === selectedId) {
        parents.push(item.id);
        return true;
      }
      if (item.children) {
        if (find(item.children, selectedId)) {
          parents.push(item.id);
          return true;
        }
      }
    }
    return false;
  };
  find(items, selectedId);
  return parents;
};

export type NavItemType = {
  id: string;
  title: string;
  anchor?: string;
  Icon?: any;
  children?: NavItemType[];
  isDivider?: boolean;
};

export const DEFAULT_NAV_ID = 'overview';
