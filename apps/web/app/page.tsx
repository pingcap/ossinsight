import type { Metadata } from 'next';
import { HomeContent } from './home-content';
import { FAQPageJsonLd, SiteApplicationJsonLd, WebPageJsonLd } from '@/components/json-ld';
import { FAQ_ITEMS } from './faq-data';
import ShareButtons from '@/components/ShareButtons';
import AIHomeContent from './ai-home-content';
import { getCategoryData, getAITrending, getTrendingForTreemap } from './ai-home-data';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: {
    absolute: 'OSSInsight — AI Agent Analytics & Open Source GitHub Intelligence',
  },
  description: 'Track AI agent frameworks, LLM tools, MCP servers & 10B+ GitHub events. Compare repos, discover trending projects, and get real-time open source intelligence. Free & open source.',
  keywords: [
    'open source analytics', 'GitHub insights', 'AI agent frameworks',
    'trending repositories', 'repository comparison', 'developer analytics',
    'AI coding tools', 'MCP servers', 'LLM frameworks', 'open source AI',
    'RAG frameworks', 'open source intelligence',
  ],
  openGraph: {
    title: 'OSSInsight — AI Agent Analytics & Open Source GitHub Intelligence',
    description: 'Track AI agent frameworks, LLM tools, MCP servers & 10B+ GitHub events. Compare repos, discover trending projects, and get real-time open source intelligence.',
    images: [{ url: '/seo-widgets-homepage.jpeg', width: 1200, height: 630, alt: 'OSSInsight — AI Agent Analytics & Open Source GitHub Intelligence' }],
  },
  twitter: {
    title: 'OSSInsight — AI Agent Analytics & Open Source GitHub Intelligence',
    description: 'Track AI agent frameworks, LLM tools, MCP servers & 10B+ GitHub events.',
    card: 'summary_large_image',
    images: ['/seo-widgets-homepage.jpeg'],
  },
};

export default async function HomePage() {
  const [categories, trendingRepos] = await Promise.all([
    getCategoryData(),
    getTrendingForTreemap(),
  ]);

  return (
    <>
      <WebPageJsonLd />
      <SiteApplicationJsonLd />
      <FAQPageJsonLd items={FAQ_ITEMS} />
      <div className="sr-only">
        <h1>OSSInsight — Open Source Software Insight</h1>
        <p>
          OSSInsight is a free analytics platform that tracks over 10 billion GitHub events in real time.
          It provides deep insights into open source repositories, developers, and organizations — including
          stars, commits, pull requests, issues, contributors, and community health metrics.
        </p>
      </div>
      <HomeContent
        aiSection={
          <AIHomeContent
            categories={categories}
            trendingRepos={trendingRepos}
          />
        }
      />
      <ShareButtons url="/" title="OSSInsight — AI Open Source Intelligence" />
    </>
  );
}
