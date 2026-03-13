import type { MetadataRoute } from 'next';
import { listCollections } from '@/lib/server/internal-api';
import { toCollectionSlug } from '@/lib/collections';

const SITE_URL = process.env.SITE_URL || 'https://ossinsight.io';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];

  // Static pages
  const staticPages = [
    { path: '/', priority: 1.0 },
    { path: '/explore/', priority: 0.8 },
    { path: '/collections/', priority: 0.8 },
  ];

  for (const page of staticPages) {
    entries.push({
      url: `${SITE_URL}${page.path}`,
      changeFrequency: 'weekly',
      priority: page.priority,
    });
  }

  // Collections (dynamic from database)
  try {
    const collections = await listCollections();
    for (const collection of collections) {
      const slug = toCollectionSlug(collection.name);
      entries.push({
        url: `${SITE_URL}/collections/${slug}`,
        changeFrequency: 'weekly',
        priority: 0.6,
      });
      entries.push({
        url: `${SITE_URL}/collections/${slug}/trends`,
        changeFrequency: 'weekly',
        priority: 0.5,
      });
    }
  } catch {
    // Database may be unavailable during build
  }

  return entries;
}
