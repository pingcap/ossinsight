import siteConfig from '@/site.config';
import { SiteBanner } from '@/lib/ui/components/SiteBanner';
import { SiteHeader } from '@/lib/ui/components/SiteHeader';
import type { Metadata } from 'next';
import config from '@/site.config';
import './globals.scss';
import Script from 'next/script';
// import { Inter } from 'next/font/google'

// const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  icons: [
    '/favicon.png'
  ],
  openGraph: {
    siteName: 'OSS Insight',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    creator: '@ossinsight',
  },
};

const GTAG_ID = siteConfig.ga.tag;

export default function RootLayout ({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
    <body
      // className={inter.className}
    >
    <Script id="google-analytics" src={`https://www.googletagmanager.com/gtag/js?id=${GTAG_ID}`} />
    <Script id="google-analytics-config">
      {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
 
          gtag('config', '${GTAG_ID}');
        `}
    </Script>
    {config.banner && <SiteBanner banner={config.banner} />}
    <SiteHeader {...config.header} />
    {children}
    </body>
    </html>
  );
}
