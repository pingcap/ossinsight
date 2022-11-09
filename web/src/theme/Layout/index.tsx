import React from 'react';
import clsx from 'clsx';
import ErrorBoundary from '@docusaurus/ErrorBoundary';
import { PageMetadata, ThemeClassNames } from '@docusaurus/theme-common';
import { useKeyboardNavigation } from '@docusaurus/theme-common/internal';
import SkipToContent from '@theme/SkipToContent';
import AnnouncementBar from '@theme/AnnouncementBar';
import Navbar from '@theme/Navbar';
import Footer from '@theme/Footer';
import LayoutProvider from '@theme/Layout/Provider';
import ErrorPageContent from '@theme/ErrorPageContent';
import type { Props } from '@theme/Layout';
import styles from './styles.module.css';
import VideoAds from '@site/src/components/Ads/VideoAds';
import CustomFooter from '@site/src/components/Footer';

declare module '@theme/Layout' {
  interface Props {
    keywords?: string | string[];
    image?: string;
    header?: JSX.Element;
    side?: JSX.Element;
    sideWidth?: string;
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
  } = props;

  useKeyboardNavigation();

  return (
    <LayoutProvider>
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
          {children}
        </ErrorBoundary>
      </div>

      {!noFooter && customFooter && <CustomFooter sideWidth={sideWidth} />}
      {!noFooter && <Footer sideWidth={sideWidth} />}
      <VideoAds thumbnailUrl="/img/video-ads-thumbnail.png" url="https://www.youtube.com/embed/6ofDBgXh4So?enablejsapi=1" delay={6000} />
    </LayoutProvider>
  );
}
