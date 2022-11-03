import React, { ComponentType, useState } from 'react';
import clsx from 'clsx';
import { ThemeClassNames } from '@docusaurus/theme-common';
import {
  useAnnouncementBar,
  useScrollPosition,
} from '@docusaurus/theme-common/internal';
import DocSidebarItems from '@theme/DocSidebarItems';
import type { Props } from '@theme/DocSidebar/Desktop/Content';

import styles from './styles.module.css';

declare module '@theme/DocSidebar/Desktop/Content' {
  interface Props {
    Footer: ComponentType | undefined;
  }
}

function useShowAnnouncementBar () {
  const { isActive } = useAnnouncementBar();
  const [showAnnouncementBar, setShowAnnouncementBar] = useState(isActive);

  useScrollPosition(
    ({ scrollY }) => {
      if (isActive) {
        setShowAnnouncementBar(scrollY === 0);
      }
    },
    [isActive],
  );
  return isActive && showAnnouncementBar;
}

export default function DocSidebarDesktopContent ({
  path,
  sidebar,
  className,
  Footer,
}: Props): JSX.Element {
  const showAnnouncementBar = useShowAnnouncementBar();

  return (
    <nav
      className={clsx(
        'menu thin-scrollbar',
        styles.menu,
        showAnnouncementBar && styles.menuWithAnnouncementBar,
        className,
      )}>
      <ul className={clsx(ThemeClassNames.docs.docSidebarMenu, 'menu__list')}>
        <DocSidebarItems items={sidebar} activePath={path} level={1} Footer={Footer} />
      </ul>
    </nav>
  );
}
