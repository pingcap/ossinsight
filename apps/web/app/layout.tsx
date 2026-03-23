import siteConfig from '@/site.config';
import type { Metadata } from 'next';
import './globals.css';
import Script from 'next/script';
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import { QueryProvider } from '@/components/providers/query-provider';
import { AppShell } from '@/components/app-shell';
import { OrganizationJsonLd, WebSiteJsonLd } from '@/components/json-ld';

const geist = Geist({subsets:['latin'],variable:'--font-sans'});


// import { Inter } from 'next/font/google'

// const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL || 'https://ossinsight.io'),
  title: {
    default: 'OSSInsight - Open Source Software Insight',
    template: '%s | OSSInsight',
  },
  description: 'OSSInsight analyzes billions of GitHub events and provides insights for open source software.',
  icons: ['/favicon.png'],
  openGraph: {
    siteName: 'OSS Insight',
    locale: 'en_US',
    type: 'website',
    title: 'OSSInsight - Open Source Software Insight',
    description: 'OSSInsight analyzes billions of GitHub events and provides insights for open source software.',
  },
  twitter: {
    card: 'summary_large_image',
    creator: '@ossinsight',
    title: 'OSSInsight - Open Source Software Insight',
    description: 'OSSInsight analyzes billions of GitHub events and provides insights for open source software.',
  },
  alternates: {
    canonical: '/',
  },
};

const GTAG_ID = siteConfig.ga.tag;

export default function RootLayout ({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
    <head>
      <link rel="alternate" type="text/plain" href="/llms.txt" title="LLM-friendly site description" />
      <link rel="alternate" type="text/plain" href="/llms-full.txt" title="LLM-friendly full documentation" />
      <link rel="search" type="application/opensearchdescription+xml" href="/opensearch.xml" title="OSSInsight" />
    </head>
    <body
      // className={inter.className}
    >
    <OrganizationJsonLd />
    <WebSiteJsonLd />
    <QueryProvider>
    <Script id="google-analytics" src={`https://www.googletagmanager.com/gtag/js?id=${GTAG_ID}`} />
    <Script id="google-analytics-config">
      {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
 
          gtag('config', '${GTAG_ID}');
        `}
    </Script>
    <AppShell>{children}</AppShell>
    </QueryProvider>
    </body>
    </html>
  );
}
