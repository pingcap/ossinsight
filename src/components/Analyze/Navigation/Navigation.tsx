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
      className={clsx('w-full flex md:flex-col md:w-[var(--site-left-nav-width)]', {
        'sticky overflow-x-auto lg:h-full md:pt-8': depth === 0,
      })}
    >
      {items.map((item) => {
        return (
          <React.Fragment key={item.id}>
            <li
              className={clsx(
                'flex md:flex-col items-center justify-start md:justify-center lg:justify-start',
                highlightId.includes(item.id)
                  ? 'text-[var(--color-primary)]'
                  : 'text-[var(--text-color-content)]',
                {
                  'border-b-2 border-[var(--color-primary)] md:border-r-2 md:border-b-0':
                    selectedId === item.id,
                },
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
};

export const DEFAULT_NAV_ID = 'overview';
