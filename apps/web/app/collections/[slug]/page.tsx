import { toCollectionSlug } from '@/lib/collections';
import { fetchCollections } from '@/utils/api';
import { getCollectionRanking } from '@/lib/server/internal-api';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CollectionDetail } from './content';
import { BreadcrumbListJsonLd, CollectionPageJsonLd } from '@/components/json-ld';

export const revalidate = 3600;

const COLLECTION_DESC = 'Last 28 days / Monthly ranking of repos in this collection by stars, pull requests, issues. Historical Ranking by Popularity.';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const collections = await fetchCollections();
  const collection = collections.find((c) => toCollectionSlug(c.name) === slug);
  if (!collection) return { title: 'Collection Not Found' };
  return {
    title: `${collection.name} - Ranking`,
    description: COLLECTION_DESC,
    alternates: { canonical: `/collections/${slug}` },
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
  try {
    initialRankingData = await getCollectionRanking(collection.id, 'stars', 'last-28-days');
  } catch {
    // DB unavailable, client will fetch
  }

  return (
    <>
      <CollectionPageJsonLd name={collection.name} description={COLLECTION_DESC} slug={slug} />
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
