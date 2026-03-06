import * as React from 'react';
import * as Headless from '@headlessui/react';
import { twJoin } from 'tailwind-merge';

const HTab = Headless.Tab;

export interface HeadlessTabsProps {
  children?: React.ReactElement<HeadlessTabProps>[];
  categories?: any[];
}

export function HeadlessTabs(props: HeadlessTabsProps) {
  const { categories, children } = props;

  return (
    <HTab.Group>
      <HTab.List className='flex space-x-1 rounded-xl bg-[var(--headless-tab-background)] p-1'>
        {categories?.map((category) => (
          <HTab
            key={category?.toString()}
            className={({ selected }) =>
              twJoin(
                'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                'ring-white ring-opacity-60 ring-offset-2 focus:outline-none focus:ring-2',
                selected
                  ? 'bg-[var(--headless-tab-active-background)] text-[var(--headless-tab-active-text)] shadow'
                  : 'text-[var(--headless-tab-text)] hover:bg-white/[0.12]'
              )
            }
          >
            {category}
          </HTab>
        ))}
      </HTab.List>
      <HTab.Panels className='mt-2'>{children}</HTab.Panels>
    </HTab.Group>
  );
}

export interface HeadlessTabProps {
  children?: React.ReactNode;
  className?: string;
}

export function HeadlessTab(props: HeadlessTabProps) {
  const { children, className } = props;

  return <HTab.Panel className={className}>{children}</HTab.Panel>;
}
