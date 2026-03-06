import React from 'react';

export function useScrollPosition (effect: (args: { scrollY: number }) => void, _deps?: unknown[]) {
  React.useEffect(() => {
    effect({ scrollY: 0 });
  }, []);
}

export function useAnnouncementBar () {
  return { isActive: false };
}

export function useNavbarMobileSidebar () {
  return {
    toggle: () => {},
  };
}

export function useKeyboardNavigation () {
}

export function DocSidebarItemsExpandedStateProvider ({ children }: { children?: React.ReactNode }) {
  return <>{children}</>;
}

export function useDoc () {
  return {
    frontMatter: {},
    toc: [],
    metadata: {
      title: '',
    },
  };
}

export function useBlogPost () {
  return {
    isBlogPostPage: false,
    metadata: {
      title: '',
    },
  };
}

export function splitNavbarItems (items: any[]) {
  return {
    leftItems: items ?? [],
    rightItems: [],
  };
}

export function useColorModeToggle () {
  return {
    colorMode: 'light',
    setColorMode: () => {},
  };
}

export function useNavbarSecondaryMenu () {
  return {
    shown: false,
    hide: () => {},
    shownItems: [],
  };
}

export function ColorModeProvider ({ children }: { children?: React.ReactNode }) {
  return <>{children}</>;
}

export function TabGroupChoiceProvider ({ children }: { children?: React.ReactNode }) {
  return <>{children}</>;
}

export function AnnouncementBarProvider ({ children }: { children?: React.ReactNode }) {
  return <>{children}</>;
}

export function DocsPreferredVersionContextProvider ({ children }: { children?: React.ReactNode }) {
  return <>{children}</>;
}

export function ScrollControllerProvider ({ children }: { children?: React.ReactNode }) {
  return <>{children}</>;
}

export function NavbarProvider ({ children }: { children?: React.ReactNode }) {
  return <>{children}</>;
}

export function PluginHtmlClassNameProvider ({ children }: { children?: React.ReactNode }) {
  return <>{children}</>;
}
