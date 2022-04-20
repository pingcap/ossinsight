import React, {PropsWithChildren} from 'react'
import Layout, {Props as LayoutProps} from '@theme/Layout';
import ThemeAdaptor from "../../components/ThemeAdaptor";
import Footer from "../../components/Footer";

export interface CustomPageProps extends LayoutProps {
  footer?: boolean
}

export default function CustomPage({children, footer = true, ...props}: PropsWithChildren<CustomPageProps>) {
  return (
    <Layout {...props}>
      <ThemeAdaptor>
        <div
          style={{
            '--ifm-container-width-xl': '1200px'
          }}
        >
          {children}
          {footer ? <Footer /> : undefined}
        </div>
      </ThemeAdaptor>
    </Layout>
  )
}