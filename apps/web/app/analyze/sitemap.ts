import type { MetadataRoute } from 'next';
import { getTopReposForSitemap } from '@/lib/server/internal-api';

const SITE_URL = process.env.SITE_URL || 'https://ossinsight.io';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];

  try {
    const repos = await getTopReposForSitemap(10000);
    for (const repo of repos) {
      const [owner, name] = repo.repo_name.split('/');
      if (!owner || !name) continue;

      entries.push({
        url: `${SITE_URL}/analyze/${owner}/${name}`,
        changeFrequency: 'weekly',
        priority: 0.7,
      });
    }
  } catch (error) {
    console.warn('[analyze/sitemap] Failed to fetch top repos for sitemap:', error);
  }

  return entries;
}
