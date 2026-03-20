import type { Metadata } from 'next';
import { BreadcrumbListJsonLd } from '@/components/json-ld';
import {
  LANGUAGES,
  PERIODS,
  isValidPeriod,
  getTrendingRepos,
} from '@/lib/server/internal-api';
import { TrendingContent } from './content';

export const revalidate = 3600;
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Trending GitHub Repositories | OSSInsight',
  description: 'Discover the hottest open source projects on GitHub right now. Daily, weekly, and monthly trending repos ranked by community activity, powered by 10B+ GitHub events.',
  keywords: ['GitHub', 'trending', 'repositories', 'open source', 'popular', 'stars', 'OSSInsight'],
  openGraph: {
    title: 'Trending GitHub Repositories | OSSInsight',
    description: 'Discover the hottest open source projects on GitHub right now.',
  },
  twitter: {
    title: 'Trending GitHub Repositories | OSSInsight',
    description: 'Discover the hottest open source projects on GitHub right now.',
    card: 'summary_large_image',
  },
  alternates: { canonical: '/trending' },
};

interface PageProps {
  searchParams: Promise<{ period?: string; language?: string }>;
}

export default async function TrendingPage({ searchParams }: PageProps) {
  const { period: rawPeriod, language: rawLanguage } = await searchParams;
  const period = rawPeriod && isValidPeriod(rawPeriod) ? rawPeriod : 'past_week';
  const language = rawLanguage && (LANGUAGES as readonly string[]).includes(rawLanguage) ? rawLanguage : 'All';

  let repos: Array<{
    repo_id: number;
    repo_name: string;
    language: string;
    description: string;
    stars: number;
    forks: number;
    total_score: number;
  }> = [];

  try {
    repos = await getTrendingRepos(language, period);
  } catch (err) {
    console.error('[trending] query failed:', err);
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Trending GitHub Repositories',
    description: 'Most popular and fastest-growing repositories on GitHub.',
    url: 'https://ossinsight.io/trending',
    isPartOf: {
      '@type': 'WebSite',
      name: 'OSSInsight',
      url: 'https://ossinsight.io',
    },
  };

  return (
    <>
      <BreadcrumbListJsonLd items={[
        { name: 'Home', url: '/' },
        { name: 'Trending' },
      ]} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <TrendingContent
        repos={repos}
        period={period}
        language={language}
        languages={LANGUAGES as unknown as string[]}
        periods={PERIODS as unknown as Array<{ value: string; label: string }>}
      />
    </>
  );
}
