import React, { ComponentType, memo } from 'react';
import { DocSidebarItemsExpandedStateProvider } from '@docusaurus/theme-common/internal';
import DocSidebarItem from '@/compat/theme/DocSidebarItem';

import type { Props } from '@/compat/theme/DocSidebarItems';

import styles from './styles.module.css';
import { notNullish } from '@/utils/value';

declare module '@/compat/theme/DocSidebarItems' {
  interface Props {
    Footer: ComponentType | undefined;
  }
}

// TODO this item should probably not receive the "activePath" props
// TODO this triggers whole sidebar re-renders on navigation
function DocSidebarItems ({ items, Footer, ...props }: Props): JSX.Element {
  return (
    <DocSidebarItemsExpandedStateProvider>
      {items.map((item: Props['items'][number], index: number) => (
        <DocSidebarItem key={index} item={item} index={index} {...props} />
      ))}
      {notNullish(Footer) && <li className={styles.sidebarFooter}><Footer /></li>}
    </DocSidebarItemsExpandedStateProvider>
  );
}

// Optimize sidebar at each "level"
export default memo(DocSidebarItems);
