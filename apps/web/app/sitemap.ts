import type { MetadataRoute } from 'next';
import { listCollections, listCollectionPreviewRepos } from '@/lib/server/internal-api';
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

  // Repo comparisons generated from collections (top repos in each collection, pairwise)
  try {
    const allCollections = await listCollections();
    const collectionIds = allCollections.map((c) => c.id);
    if (collectionIds.length > 0) {
      const previews = await listCollectionPreviewRepos(collectionIds);
      // Group by collection, generate pairs from top repos
      const byCollection = new Map<number, string[]>();
      for (const p of previews) {
        const list = byCollection.get(p.collection_id) ?? [];
        list.push(p.repo_name);
        byCollection.set(p.collection_id, list);
      }
      const seen = new Set<string>();
      for (const repos of byCollection.values()) {
        for (let i = 0; i < repos.length; i++) {
          for (let j = i + 1; j < repos.length; j++) {
            const key = [repos[i], repos[j]].sort().join('|');
            if (!seen.has(key)) {
              seen.add(key);
              entries.push({
                url: `${SITE_URL}/compare/${repos[i]}/${repos[j]}`,
                changeFrequency: 'weekly',
                priority: 0.6,
              });
            }
          }
        }
      }
    }
  } catch {
    // Database may be unavailable during build
  }

  return entries;
}
