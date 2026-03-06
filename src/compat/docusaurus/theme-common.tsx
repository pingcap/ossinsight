import React, { ComponentType } from 'react';

export const ThemeClassNames = {
  docs: {
    docSidebarMenu: 'docSidebarMenu',
  },
  wrapper: {
    main: 'main-wrapper',
  },
};

export function PageMetadata ({
  title,
}: {
  title?: string;
  description?: string;
  keywords?: string | string[];
  image?: string;
}) {
  if (typeof document !== 'undefined' && title) {
    document.title = title;
  }
  return null;
}

type ProviderComponent = ComponentType<{ children?: React.ReactNode }> | any;

export function composeProviders (providers: ProviderComponent[]) {
  return providers.reduceRight((Accumulated, Current) => {
    return function ComposedProvider ({ children }: { children?: React.ReactNode }) {
      return React.createElement(
        Current as ComponentType<any>,
        null,
        React.createElement(Accumulated as ComponentType<any>, null, children)
      );
    };
  }, ({ children }: { children?: React.ReactNode }) => <>{children}</>);
}

export function useThemeConfig () {
  return {
    navbar: {
      hideOnScroll: false,
      items: [],
    },
    announcementBar: {
      isActive: false,
    },
    footer: {
      links: [],
      logo: undefined,
      copyright: '',
      style: undefined,
    },
  };
}

export function useWindowSize () {
  return 'desktop';
}

export function useAnnouncementBar () {
  return { isActive: false };
}

export function NavbarSecondaryMenuFiller ({
  component: Component,
  props,
}: {
  component: any;
  props: any;
}) {
  return <Component {...props} />;
}

export type NavbarSecondaryMenuComponent<T = any> = ComponentType<T>;
