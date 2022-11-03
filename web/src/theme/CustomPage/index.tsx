import Layout, { Props as LayoutProps } from '@theme/Layout';
import React, { PropsWithChildren, useLayoutEffect } from 'react';
import Footer from '../../components/Footer';
import { notNullish } from '@site/src/utils/value';
import { Box } from '@mui/material';

declare module '@theme/Layout' {
  interface Props {
    header?: JSX.Element;
    side?: JSX.Element;
    sideWidth?: string;
  }
}

export interface CustomPageProps extends LayoutProps {
  footer?: boolean;
  dark?: boolean;
  header?: JSX.Element;
  sideWidth?: string;
  Side?: () => JSX.Element | null;
}

export default function CustomPage ({
  children,
  header,
  footer = true,
  dark,
  sideWidth,
  Side,
  ...props
}: PropsWithChildren<CustomPageProps>) {
  useLayoutEffect(() => {
    const id = location.hash.replace(/^#/, '');
    document.getElementById(id)?.scrollIntoView();
  }, []);

  return (
    <Layout
      {...props}
      header={header}
      sideWidth={sideWidth}
      side={(sideWidth && notNullish(Side))
        ? (
          <Box component="aside" width={sideWidth} position="sticky" top="calc(var(--ifm-navbar-height) + 76px)" height={0} zIndex={0}>
            <Box marginTop='-76px' height='calc(100vh - var(--ifm-navbar-height))'>
              <Side />
            </Box>
          </Box>
          )
        : undefined}
    >
      <div hidden style={{ height: 72 }} />
      <div style={{ paddingLeft: sideWidth, paddingRight: sideWidth }}>
        <main
          style={{
            '--ifm-container-width-xl': '1200px',
          }}
        >
          {children}
          {footer ? <Footer /> : undefined}
        </main>
      </div>
    </Layout>
  );
}
