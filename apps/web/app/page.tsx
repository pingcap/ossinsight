import type { Metadata } from 'next';
import { HomeContent } from './home-content';
import { FAQPageJsonLd, SiteApplicationJsonLd } from '@/components/json-ld';
import { FAQ_ITEMS } from './faq-data';

export const metadata: Metadata = {
  title: {
    absolute: 'OSSInsight - Open Source Software Insight',
  },
  description: 'Real-time analytics for 10B+ GitHub events. Analyze any repo, compare projects, and discover trending open source software. Free & open source.',
  openGraph: {
    title: 'OSSInsight - Open Source Software Insight',
    description: 'Real-time analytics for 10B+ GitHub events. Analyze any repo, compare projects, and discover trending open source software.',
    images: [{ url: '/seo-widgets-homepage.jpeg', width: 1200, height: 630 }],
  },
  twitter: {
    title: 'OSSInsight - Open Source Software Insight',
    description: 'Real-time analytics for 10B+ GitHub events. Analyze any repo, compare projects, and discover trending open source software.',
    card: 'summary_large_image',
    images: ['/seo-widgets-homepage.jpeg'],
  },
};

export default function HomePage() {
  return (
    <>
      <SiteApplicationJsonLd />
      <FAQPageJsonLd items={FAQ_ITEMS} />
      <div className="sr-only">
        <h1>OSSInsight — Open Source Software Insight</h1>
        <p>
          OSSInsight is a free analytics platform that tracks over 10 billion GitHub events in real time.
          It provides deep insights into open source repositories, developers, and organizations — including
          stars, commits, pull requests, issues, contributors, and community health metrics.
          Powered by TiDB and built by PingCAP.
        </p>
        <p>
          Use the Data Explorer to query GitHub data with natural language. Browse 100+ curated Collections
          ranking repositories in domains like databases, AI frameworks, and web frameworks. Analyze any
          GitHub repository or compare two projects side by side.
        </p>
      </div>
      <HomeContent />
    </>
  );
}
