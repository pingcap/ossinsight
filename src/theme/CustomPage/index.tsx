import React, { PropsWithChildren, useLayoutEffect } from 'react';
import Layout, {Props as LayoutProps} from '@theme/Layout';
import Footer from "../../components/Footer";
import StatusBar from '../../components/StatusBar';

declare module '@theme/Layout' {
  interface Props {
    header?: JSX.Element
  }
}

export interface CustomPageProps extends LayoutProps {
  footer?: boolean
  dark?: boolean
  header?: JSX.Element
}

export default function CustomPage({children, header, footer = true, dark, ...props}: PropsWithChildren<CustomPageProps>) {

  useLayoutEffect(() => {
    const id = location.hash.replace(/^#/, '')
    document.getElementById(id)?.scrollIntoView({
      block: 'center'
    })
  }, [])

  return (
    <Layout {...props} header={header}>
      <div hidden style={{ height: 72 }} />
      <div
        style={{
          '--ifm-container-width-xl': '1200px'
      }}
      >
        {children}
        {footer ? <Footer /> : undefined}
      </div>
      <StatusBar/>
    </Layout>
  )
}