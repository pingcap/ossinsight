import React from 'react';
import clsx from 'clsx';
import ErrorBoundary from '@docusaurus/ErrorBoundary';
import { PageMetadata, ThemeClassNames, composeProviders } from '@docusaurus/theme-common';
import { useKeyboardNavigation } from '@docusaurus/theme-common/internal';
import SkipToContent from '@theme/SkipToContent';
import AnnouncementBar from '@theme/AnnouncementBar';
import Navbar from '@theme/Navbar';
import Footer from '@theme/Footer';
import LayoutProvider from '@theme/Layout/Provider';
import ErrorPageContent from '@theme/ErrorPageContent';
import type { Props } from '@theme/Layout';
import styles from './styles.module.css';
import CustomFooter from '@site/src/components/Footer';
import { useNotificationsProvider } from '@site/src/components/Notifications';
import { AuthProvider } from '@site/src/context/user';

declare module '@theme/Layout' {
  interface Props {
    keywords?: string | string[];
    image?: string;
    header?: JSX.Element;
    side?: JSX.Element;
    sideWidth?: string;
    disableAuth?: boolean;
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
        <ErrorBoundary fallback={(params) => <ErrorPageContent {...params} />}>
          <NotificationProvider>
            {notificationEl}
            {children}
          </NotificationProvider>
        </ErrorBoundary>
      </div>

      {!noFooter && customFooter && <CustomFooter sideWidth={sideWidth} />}
      {!noFooter && <Footer sideWidth={sideWidth} />}
    </LayoutMemo>
  );
}
