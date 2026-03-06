import React from 'react';
import clsx from 'clsx';
import { useThemeConfig } from '@docusaurus/theme-common';
import Logo from '@theme/Logo';
import CollapseButton from '@/compat/theme/DocSidebar/Desktop/CollapseButton';
import Content from '@/compat/theme/DocSidebar/Desktop/Content';

import styles from './styles.module.css';

type Props = {
  path?: string;
  sidebar?: any[];
  onCollapse?: () => void;
  isHidden?: boolean;
  Footer?: React.ComponentType | undefined;
};

function DocSidebarDesktop ({ path, sidebar, onCollapse, isHidden, Footer }: Props) {
  const {
    navbar: { hideOnScroll },
    docs: {
      sidebar: { hideable },
    },
  } = useThemeConfig();

  return (
    <div
      className={clsx(
        styles.sidebar,
        hideOnScroll && styles.sidebarWithHideableNavbar,
        isHidden && styles.sidebarHidden,
      )}>
      {hideOnScroll && <Logo tabIndex={-1} className={styles.sidebarLogo} />}
      <Content path={path} sidebar={sidebar} Footer={Footer} />
      {hideable && <CollapseButton onClick={onCollapse} />}
    </div>
  );
}

export default React.memo(DocSidebarDesktop);
