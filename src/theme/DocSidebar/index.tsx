import React, { ComponentType } from 'react';
import { useWindowSize } from '@docusaurus/theme-common';
import DocSidebarDesktop from '@/compat/theme/DocSidebar/Desktop';
import DocSidebarMobile from '@/compat/theme/DocSidebar/Mobile';
import type { Props } from '@/compat/theme/DocSidebar';

declare module '@/compat/theme/DocSidebar' {
  interface Props {
    Footer?: ComponentType | undefined;
  }
}

export default function DocSidebar (props: Props): JSX.Element {
  const windowSize = useWindowSize();

  // Desktop sidebar visible on hydration: need SSR rendering
  const shouldRenderSidebarDesktop =
    windowSize === 'desktop' || windowSize === 'ssr';

  // Mobile sidebar not visible on hydration: can avoid SSR rendering
  const shouldRenderSidebarMobile = windowSize === 'mobile';

  return (
    <>
      {shouldRenderSidebarDesktop && <DocSidebarDesktop {...props} />}
      {shouldRenderSidebarMobile && <DocSidebarMobile {...props} />}
    </>
  );
}
