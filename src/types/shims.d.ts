declare module 'react-github-btn' {
  import { ComponentType } from 'react';
  const GitHubButton: ComponentType<Record<string, unknown>>;
  export default GitHubButton;
}

declare module 'is-hotkey' {
  const isHotkey: (hotkey: string | string[], event: KeyboardEvent) => boolean;
  export default isHotkey;
}

declare module 'react-cool-dimensions' {
  const useDimensions: (...args: any[]) => any;
  export default useDimensions;
}

declare module 'react-ace' {
  const AceEditor: any;
  export type IAceOptions = any;
  export default AceEditor;
}

declare module 'xss' {
  const xss: (input: string) => string;
  export default xss;
}

declare module 'd3-hierarchy' {
  const d3Hierarchy: any;
  export = d3Hierarchy;
}

declare module 'react-window' {
  export const FixedSizeList: any;
  export type ListChildComponentProps = any;
}

declare module 'd3-cloud' {
  type CloudWord = {
    text: string;
    size: number;
    x?: number;
    y?: number;
    rotate?: number;
    color?: string;
  };

  type CloudLayout = {
    canvas(fn: any): CloudLayout;
    size(size: [number, number]): CloudLayout;
    words(words: CloudWord[]): CloudLayout;
    padding(value: number): CloudLayout;
    rotate(value: number | (() => number)): CloudLayout;
    font(name: string): CloudLayout;
    fontSize(fn: (word: CloudWord) => number): CloudLayout;
    random(fn: () => number): CloudLayout;
    on(event: 'end', cb: (words: CloudWord[]) => void): CloudLayout;
    start(): void;
    stop(): void;
  };

  function cloud(): CloudLayout;

  namespace cloud {
    export type Word = CloudWord;
  }

  export default cloud;
}

declare module 'lodash' {
  const _: any;
  export = _;
}

declare module 'history' {
  const history: any;
  export = history;
}

declare module '@storybook/react' {
  export type Meta<T = any> = any;
  export type StoryObj<T = any> = any;
}

declare module '@faker-js/faker' {
  export const faker: any;
}

declare module 'react-router' {
  export const useRouteMatch: any;
}

declare module 'chart.js/types/utils' {
  export type DeepPartial<T> = any;
}

declare module 'webpack-bundle-analyzer' {
  export const BundleAnalyzerPlugin: any;
}

declare module '@docusaurus/types' {
  export type Plugin<T = any> = any;
  export type ClientModule = any;
  export type LoadContext = any;
  export type RouteConfig = any;
}

declare module '@docusaurus/plugin-google-gtag' {
  export type PluginOptions = any;
  const plugin: any;
  export default plugin;
}

declare module '@docusaurus/plugin-content-docs' {
  export type PropSidebar = any;
  export const useCurrentSidebarCategory: any;
}

declare module '@docusaurus/plugin-client-redirects/lib/types' {
  export type Options = any;
  export type PluginContext = any;
}

declare module '@docusaurus/theme-common' {
  export const ThemeClassNames: any;
  export const PageMetadata: any;
  export const composeProviders: any;
  export const useThemeConfig: any;
  export const useWindowSize: any;
  export const useAnnouncementBar: any;
  export const NavbarSecondaryMenuFiller: any;
  export type NavbarSecondaryMenuComponent<T = any> = any;
}

declare module '@docusaurus/theme-common/internal' {
  export const useScrollPosition: any;
  export const useAnnouncementBar: any;
  export const useNavbarMobileSidebar: any;
  export const useKeyboardNavigation: any;
  export const DocSidebarItemsExpandedStateProvider: any;
  export const useDoc: any;
  export const useBlogPost: any;
  export const splitNavbarItems: any;
  export const ColorModeProvider: any;
  export const TabGroupChoiceProvider: any;
  export const AnnouncementBarProvider: any;
  export const DocsPreferredVersionContextProvider: any;
  export const ScrollControllerProvider: any;
  export const NavbarProvider: any;
  export const PluginHtmlClassNameProvider: any;
}

declare module '@docusaurus/ErrorBoundary' {
  const ErrorBoundary: any;
  export default ErrorBoundary;
}

declare module '@theme/*' {
  export type Props = any;
  export type ComponentTypesObject = any;
  const ThemeComponent: any;
  export default ThemeComponent;
}
