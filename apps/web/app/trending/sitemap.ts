import type { MetadataRoute } from 'next';

const SITE_URL = process.env.SITE_URL || 'https://ossinsight.io';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${SITE_URL}/trending`,
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ];
}
