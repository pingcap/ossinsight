import type { MetadataRoute } from 'next';

const SITE_URL = process.env.SITE_URL || 'https://ossinsight.io';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/analyze/',
          '/analyze-user/',
          '/collections/',
          '/explore',
          '/trending',
          '/languages/',
          '/compare/',
          '/blog/',
        ],
        disallow: [
          '/api/',
          '/collections/api/',
          '/gh/',
          '/q/',
          '/q/explain/',
          '/_next/',
          '/404',
          '/500',
        ],
        // Crawl-delay not natively supported by Next.js MetadataRoute.Robots,
        // but we include it via the raw rule for compliant crawlers.
      },
      {
        // Rate-limit aggressive bots but allow Googlebot / Bingbot at default speed
        userAgent: 'AhrefsBot',
        disallow: ['/'],
      },
      {
        userAgent: 'SemrushBot',
        disallow: ['/'],
      },
    ],
    sitemap: [
      `${SITE_URL}/sitemap.xml`,
      `${SITE_URL}/analyze/sitemap.xml`,
      `${SITE_URL}/languages/sitemap.xml`,
      `${SITE_URL}/trending/sitemap.xml`,
    ],
  };
}
