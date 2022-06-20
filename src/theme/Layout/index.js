/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import clsx from 'clsx';
import ErrorBoundary from '@docusaurus/ErrorBoundary';
import SkipToContent from '@theme/SkipToContent';
import AnnouncementBar from '@theme/AnnouncementBar';
import Navbar from '@theme/Navbar';
import Footer from '@theme/Footer';
import LayoutProviders from '@theme/LayoutProviders';
import LayoutHead from '@theme/LayoutHead';
import useKeyboardNavigation from '@theme/hooks/useKeyboardNavigation';
import {ThemeClassNames} from '@docusaurus/theme-common';
import ErrorPageContent from '@theme/ErrorPageContent';
import './styles.css';
import ThemeAdaptor from "../../components/ThemeAdaptor";
import HowItWorks from "../../components/Ads/HowItWorks";

function Layout(props) {
  const {children, noFooter, wrapperClassName, pageClassName, header, side, sideWidth} = props;
  useKeyboardNavigation();
  return (
    <LayoutProviders>
      <ThemeAdaptor>
        <LayoutHead {...props} />

        <SkipToContent />

        <AnnouncementBar />

        <Navbar />

        {header}
        {side}

        <div
          className={clsx(
            ThemeClassNames.wrapper.main,
            wrapperClassName,
            pageClassName,
          )}>
          <ErrorBoundary fallback={ErrorPageContent}>{children}</ErrorBoundary>
        </div>

        {!noFooter && (
          <div style={{ zIndex: 1 }}>
            <Footer />
          </div>
        )}

        <HowItWorks />
      </ThemeAdaptor>
    </LayoutProviders>
  );
}

export default Layout;
