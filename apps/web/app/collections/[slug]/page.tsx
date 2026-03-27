import { toCollectionSlug } from '@/lib/collections';
import { fetchCollections } from '@/utils/api';
import { getCollectionRanking } from '@/lib/server/internal-api';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CollectionDetail } from './content';
import { AggregateRatingJsonLd, BreadcrumbListJsonLd, CollectionPageJsonLd, FAQPageJsonLd } from '@/components/json-ld';

export const revalidate = 3600;

const COLLECTION_DESC = 'Last 28 days / Monthly ranking of repos in this collection by stars, pull requests, issues. Historical Ranking by Popularity.';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const collections = await fetchCollections();
  const collection = collections.find((c) => toCollectionSlug(c.name) === slug);
  if (!collection) return { title: 'Collection Not Found' };
  const ogTitle = `${collection.name} - GitHub Repository Rankings`;
  return {
    title: `${collection.name} - Ranking`,
    description: COLLECTION_DESC,
    alternates: { canonical: `/collections/${slug}` },
    openGraph: {
      title: ogTitle,
      description: COLLECTION_DESC,
    },
    twitter: {
      title: ogTitle,
      description: COLLECTION_DESC,
    },
  };
}

export default async function CollectionSlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const collections = await fetchCollections();
  const collection = collections.find((c) => toCollectionSlug(c.name) === slug);

  if (!collection) {
    notFound();
  }

  // Pre-fetch default ranking data (stars + last-28-days) for SSR
  let initialRankingData = null;
  let totalStarsInCollection: number | null = null;
  try {
    initialRankingData = await getCollectionRanking(collection.id, 'stars', 'last-28-days');
    // Compute total lifetime stars across all repos in collection for AggregateRating
    if (initialRankingData?.data && Array.isArray(initialRankingData.data)) {
      const sum = (initialRankingData.data as Array<{ total?: number }>)
        .reduce((acc, row) => acc + (typeof row.total === 'number' ? row.total : 0), 0);
      if (sum > 0) totalStarsInCollection = sum;
    }
  } catch (error) {
    console.warn(`[collections/${slug}] Failed to pre-fetch ranking data:`, error);
  }

  const collectionFaq = [
    {
      question: `What is the ${collection.name} collection?`,
      answer: `The ${collection.name} collection is a curated list of GitHub repositories in the ${collection.name} category, ranked by stars, pull requests, issues, and contributors.`,
    },
    {
      question: `How are ${collection.name} repositories ranked?`,
      answer: 'Repositories are ranked by stars, pull requests, issues, and pull request creators over the last 28 days and month-to-month comparisons.',
    },
    {
      question: 'How often is the ranking updated?',
      answer: 'Rankings are updated in near real-time based on GitHub events processed by OSSInsight.',
    },
  ];

  return (
    <>
      <CollectionPageJsonLd name={collection.name} description={COLLECTION_DESC} slug={slug} />
      <FAQPageJsonLd items={collectionFaq} />
      {totalStarsInCollection != null && (
        <AggregateRatingJsonLd
          itemName={`${collection.name} Collection`}
          itemUrl={`/collections/${slug}`}
          ratingCount={totalStarsInCollection}
          ratingValue={Math.min(5, Math.round((totalStarsInCollection / 500000) * 5 * 10) / 10)}
        />
      )}
      <BreadcrumbListJsonLd items={[
        { name: 'Home', url: '/' },
        { name: 'Collections', url: '/collections' },
        { name: collection.name },
      ]} />
      <div className="sr-only">
        <h1>{collection.name} — Open Source Repository Rankings</h1>
        <p>
          Rankings and trends for the {collection.name} collection on OSSInsight.
          This page shows the top GitHub repositories in the {collection.name} category,
          ranked by stars, pull requests, issues, and pull request creators.
          Data includes last 28 days and month-to-month comparisons, plus year-to-year historical rankings since 2011.
        </p>
        <p>
          OSSInsight tracks over 10 billion GitHub events to provide real-time rankings.
          Each repository links to a detailed analytics page with stars, commits, contributors, and more.
        </p>
      </div>
      <CollectionDetail collection={collection} initialRankingData={initialRankingData} />
    </>
  );
}
