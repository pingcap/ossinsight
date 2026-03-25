import { toCollectionSlug } from '@/lib/collections';
import { fetchCollections } from '@/utils/api';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CollectionTrends } from './content';

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const collections = await fetchCollections();
  const collection = collections.find((c) => toCollectionSlug(c.name) === slug);
  if (!collection) return { title: 'Collection Not Found' };
  return {
    title: `${collection.name} - Popularity Trends`,
    description: 'The following dynamic charts show the popularity trends of GitHub repositories in this collection. You can display the popularity of repositories based on the number of stars, pull requests, pull request creators, and issues.',
    alternates: { canonical: `/collections/${slug}/trends` },
  };
}

export default async function CollectionTrendsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const collections = await fetchCollections();
  const collection = collections.find((c) => toCollectionSlug(c.name) === slug);

  if (!collection) {
    notFound();
  }

  return <CollectionTrends collection={collection} />;
}
