import React from 'react';
import { composeProviders } from '@docusaurus/theme-common';
import {
  ColorModeProvider,
  TabGroupChoiceProvider,
  AnnouncementBarProvider,
  DocsPreferredVersionContextProvider,
  ScrollControllerProvider,
  NavbarProvider,
  PluginHtmlClassNameProvider,
} from '@docusaurus/theme-common/internal';
import type { Props } from '@theme/Layout/Provider';
import ThemeAdaptor from '@site/src/components/ThemeAdaptor';
import { UserInfoProvider } from '@site/src/context/user';

const Provider = composeProviders([
  ColorModeProvider,
  AnnouncementBarProvider,
  TabGroupChoiceProvider,
  ScrollControllerProvider,
  DocsPreferredVersionContextProvider,
  PluginHtmlClassNameProvider,
  NavbarProvider,
  ThemeAdaptor,
  UserInfoProvider,
]);

export default function LayoutProvider ({ children }: Props): JSX.Element {
  return <Provider>{children}</Provider>;
}
