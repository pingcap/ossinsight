import React, {PropsWithChildren} from 'react'
import Layout, {Props as LayoutProps} from '@theme/Layout';
import ThemeAdaptor from "../../components/ThemeAdaptor";

export interface CustomPageProps extends LayoutProps {
}

export default function CustomPage({children, ...props}: PropsWithChildren<CustomPageProps>) {
  return (
    <Layout {...props}>
      <ThemeAdaptor>
        <div
          style={{
            '--ifm-container-width-xl': '1200px'
          }}
        >
          {children}
        </div>
      </ThemeAdaptor>
    </Layout>
  )
}