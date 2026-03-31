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
          '/api/mcp',
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
      // Explicitly allow AI search crawlers
      {
        userAgent: 'GPTBot',
        allow: [
          '/',
          '/analyze/',
          '/collections/',
          '/explore',
          '/trending',
          '/llms.txt',
          '/llms-full.txt',
        ],
        disallow: ['/api/', '/collections/api/', '/gh/', '/q/', '/_next/'],
      },
      {
        userAgent: 'ChatGPT-User',
        allow: ['/'],
        disallow: ['/api/', '/collections/api/', '/gh/', '/q/', '/_next/'],
      },
      {
        userAgent: 'PerplexityBot',
        allow: ['/'],
        disallow: ['/api/', '/collections/api/', '/gh/', '/q/', '/_next/'],
      },
      {
        userAgent: 'Google-Extended',
        allow: ['/'],
        disallow: ['/api/', '/collections/api/', '/gh/', '/q/', '/_next/'],
      },
      {
        userAgent: 'Anthropic',
        allow: ['/'],
        disallow: ['/api/', '/collections/api/', '/gh/', '/q/', '/_next/'],
      },
      {
        userAgent: 'ClaudeBot',
        allow: ['/'],
        disallow: ['/api/', '/collections/api/', '/gh/', '/q/', '/_next/'],
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
