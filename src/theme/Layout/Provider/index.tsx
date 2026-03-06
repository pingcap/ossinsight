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
import ThemeAdaptor from '@/components/ThemeAdaptor';

type Props = {
  children?: React.ReactNode;
};

const Provider = composeProviders([
  ColorModeProvider,
  AnnouncementBarProvider,
  TabGroupChoiceProvider,
  ScrollControllerProvider,
  DocsPreferredVersionContextProvider,
  PluginHtmlClassNameProvider,
  NavbarProvider,
  ThemeAdaptor,
]);

export default function LayoutProvider ({ children }: Props): JSX.Element {
  return <Provider>{children}</Provider>;
}
