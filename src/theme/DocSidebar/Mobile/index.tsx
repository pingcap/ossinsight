import React from 'react';
import clsx from 'clsx';
import {
  NavbarSecondaryMenuFiller,
  type NavbarSecondaryMenuComponent,
  ThemeClassNames,
} from '@docusaurus/theme-common';
import { useNavbarMobileSidebar } from '@docusaurus/theme-common/internal';
import DocSidebarItems from '@/compat/theme/DocSidebarItems';

type Props = {
  sidebar?: any[];
  path?: string;
  Footer?: React.ComponentType | undefined;
};

// eslint-disable-next-line react/function-component-definition
const DocSidebarMobileSecondaryMenu: NavbarSecondaryMenuComponent<Props> = ({
  sidebar,
  path,
  Footer,
}: Props) => {
  const mobileSidebar = useNavbarMobileSidebar();
  return (
    <ul className={clsx(ThemeClassNames.docs.docSidebarMenu, 'menu__list')}>
      <DocSidebarItems
        items={sidebar}
        activePath={path}
        onItemClick={(item: { type: string; href?: string }) => {
          // Mobile sidebar should only be closed if the category has a link
          if (item.type === 'category' && item.href) {
            mobileSidebar.toggle();
          }
          if (item.type === 'link') {
            mobileSidebar.toggle();
          }
        }}
        level={1}
        Footer={Footer}
      />
    </ul>
  );
};

function DocSidebarMobile (props: Props) {
  return (
    <NavbarSecondaryMenuFiller
      component={DocSidebarMobileSecondaryMenu}
      props={props}
    />
  );
}

export default React.memo(DocSidebarMobile);
