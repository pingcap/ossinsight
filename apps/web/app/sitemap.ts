import type { MetadataRoute } from 'next';
import { readdirSync } from 'fs';
import { join } from 'path';
import { listCollections, listCollectionPreviewRepos } from '@/lib/server/internal-api';
import { toCollectionSlug } from '@/lib/collections';

const SITE_URL = process.env.SITE_URL || 'https://ossinsight.io';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];

  // Static pages — canonical URLs without trailing slash for /explore and /collections
  const staticPages: Array<{ path: string; priority: number; images?: string[] }> = [
    {
      path: '/',
      priority: 1.0,
      images: [`${SITE_URL}/seo-widgets-homepage.jpeg`],
    },
    { path: '/explore', priority: 0.8 },
    { path: '/collections', priority: 0.8 },
    { path: '/trending', priority: 0.8 },
    { path: '/trending/ai', priority: 0.9 },
  ];

  for (const page of staticPages) {
    entries.push({
      url: `${SITE_URL}${page.path}`,
      changeFrequency: 'weekly',
      priority: page.priority,
      ...(page.images ? { images: page.images } : {}),
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
        images: [`${SITE_URL}/collections/${slug}/opengraph-image`],
      });
      entries.push({
        url: `${SITE_URL}/collections/${slug}/trends`,
        changeFrequency: 'weekly',
        priority: 0.5,
      });
    }
  } catch (error) {
    console.warn('[sitemap] Failed to fetch collections for sitemap:', error);
  }

  // Blog posts (read slugs from docs content directory)
  try {
    const blogDir = join(process.cwd(), '..', 'docs', 'content', 'blog');
    const slugs = readdirSync(blogDir, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name);

    // Blog index page
    entries.push({
      url: `${SITE_URL}/blog`,
      changeFrequency: 'weekly',
      priority: 0.7,
    });

    for (const slug of slugs) {
      entries.push({
        url: `${SITE_URL}/blog/${slug}`,
        changeFrequency: 'monthly',
        priority: 0.6,
      });
    }
  } catch (error) {
    console.warn('[sitemap] Failed to read blog posts for sitemap:', error);
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
  } catch (error) {
    console.warn('[sitemap] Failed to fetch comparison repos for sitemap:', error);
  }

  return entries;
}
