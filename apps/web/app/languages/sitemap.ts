import type { MetadataRoute } from 'next';
import { LANGUAGES } from '@/lib/server/internal-api';

const SITE_URL = process.env.SITE_URL || 'https://ossinsight.io';

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/languages`,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ];

  for (const lang of LANGUAGES) {
    entries.push({
      url: `${SITE_URL}/languages/${encodeURIComponent(lang)}`,
      changeFrequency: 'weekly',
      priority: 0.7,
    });
  }

  return entries;
}
