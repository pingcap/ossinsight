import type { Metadata } from 'next';
import { RootProvider } from 'fumadocs-ui/provider/next';
import { Geist } from 'next/font/google';
import { SharedSiteHeader } from '@/components/shared-site-header';
import { QueryProvider } from '@/components/query-provider';
import './globals.css';

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL || 'https://ossinsight.io'),
  title: {
    default: 'OSS Insight Docs',
    template: '%s | OSS Insight Docs',
  },
  description: 'Blog posts, product guides, and public API documentation for OSS Insight.',
  icons: ['/favicon.png'],
  openGraph: {
    siteName: 'OSS Insight',
    locale: 'en_US',
    type: 'website',
    title: 'OSS Insight Docs',
    description: 'Blog posts, product guides, and public API documentation for OSS Insight.',
  },
  twitter: {
    card: 'summary_large_image',
    creator: '@ossinsight',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geist.variable} dark`}
      style={{ colorScheme: 'dark' }}
      suppressHydrationWarning
    >
      <head>
        {/* Preconnect hints for Core Web Vitals */}
        <link rel="preconnect" href="https://avatars.githubusercontent.com" />
        <link rel="dns-prefetch" href="https://avatars.githubusercontent.com" />
        <link rel="preconnect" href="https://github.com" />
        <link rel="dns-prefetch" href="https://github.com" />
        <link rel="alternate" type="application/rss+xml" title="OSSInsight Blog" href="/blog/feed.xml" />
      </head>
      <body className="min-h-screen bg-fd-background text-fd-foreground antialiased">
        <QueryProvider>
          <RootProvider
            search={{
              enabled: true,
            }}
            theme={{
              defaultTheme: 'dark',
              enableSystem: false,
              enabled: true,
            }}
          >
            <SharedSiteHeader />
            {children}
          </RootProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
