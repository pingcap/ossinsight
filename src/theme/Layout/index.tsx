import React from 'react';
import clsx from 'clsx';
import ErrorBoundary from '@docusaurus/ErrorBoundary';
import { PageMetadata, ThemeClassNames, composeProviders } from '@docusaurus/theme-common';
import { useKeyboardNavigation } from '@docusaurus/theme-common/internal';
import SkipToContent from '@theme/SkipToContent';
import AnnouncementBar from '@theme/AnnouncementBar';
import Navbar from '@theme/Navbar';
import Footer from '@theme/Footer';
import LayoutProvider from '@/compat/theme/Layout/Provider';
import ErrorPageContent from '@theme/ErrorPageContent';
import type { Props } from '@/compat/theme/Layout';
import styles from './styles.module.css';
import CustomFooter from '@/components/Footer';
import { useNotificationsProvider } from '@/components/Notifications';
import { AuthProvider } from '@/context/user';
import TiDBCloudLinkContext from '@/components/TiDBCloudLink/context';

declare module '@/compat/theme/Layout' {
  interface Props {
    keywords?: string | string[];
    image?: string;
    header?: JSX.Element;
    side?: JSX.Element;
    sideWidth?: string;
    disableAuth?: boolean;

    tidbCloudLinkCampaign?: string;
    tidbCloudLinkTrial?: boolean;
  }
}

export default function Layout (props: Props): JSX.Element {
  const {
    children,
    noFooter,
    wrapperClassName,
    // Not really layout-related, but kept for convenience/retro-compatibility
    title,
    description,
    keywords,
    image,
    header,
    side,
    sideWidth,
    customFooter,
    disableAuth,
    tidbCloudLinkTrial,
    tidbCloudLinkCampaign,
  } = props;

  useKeyboardNavigation();

  const { el: notificationEl, Provider: NotificationProvider } = useNotificationsProvider();

  const LayoutMemo = React.useMemo(() => {
    if (disableAuth) return LayoutProvider;
    return composeProviders([LayoutProvider, AuthProvider]);
  }, [disableAuth]);

  return (
    <LayoutMemo>
      <PageMetadata title={title} description={description} keywords={keywords} image={image} />

      <SkipToContent />

      <AnnouncementBar />

      <Navbar />

      {header}
      {side}

      <div
        className={clsx(
          ThemeClassNames.wrapper.main,
          styles.mainWrapper,
          wrapperClassName,
        )}>
        <ErrorBoundary fallback={(params: React.ComponentProps<typeof ErrorPageContent>) => <ErrorPageContent {...params} />}>
          <NotificationProvider>
            <TiDBCloudLinkContext.Provider value={{ campaign: tidbCloudLinkCampaign, trial: tidbCloudLinkTrial }}>
              {notificationEl}
              {children}
            </TiDBCloudLinkContext.Provider>
          </NotificationProvider>
        </ErrorBoundary>
      </div>

      {!noFooter && customFooter && <CustomFooter sideWidth={sideWidth} />}
      {!noFooter && <Footer sideWidth={sideWidth} />}
    </LayoutMemo>
  );
}
