import type { MetadataRoute } from 'next';

const SITE_URL = process.env.SITE_URL || 'https://ossinsight.io';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
