import type { MetadataRoute } from 'next';
import { getBlogPosts, getApiDocs } from '@/lib/content';

const SITE_URL = process.env.SITE_URL || 'https://ossinsight.io';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];

  // Blog listing
  entries.push({
    url: `${SITE_URL}/blog`,
    changeFrequency: 'weekly',
    priority: 0.7,
  });

  // Blog posts (with lastModified from post date)
  try {
    const posts = await getBlogPosts();
    for (const post of posts) {
      entries.push({
        url: `${SITE_URL}/blog/${post.slug}`,
        lastModified: post.date ? new Date(post.date) : undefined,
        changeFrequency: 'monthly',
        priority: 0.6,
      });
    }
  } catch {
    // Content may be unavailable
  }

  // Docs static pages
  const docsPages = [
    { path: '/docs/about', priority: 0.5 },
    { path: '/docs/faq', priority: 0.5 },
  ];

  for (const page of docsPages) {
    entries.push({
      url: `${SITE_URL}${page.path}`,
      changeFrequency: 'monthly',
      priority: page.priority,
    });
  }

  // API docs
  entries.push({
    url: `${SITE_URL}/docs/api`,
    changeFrequency: 'weekly',
    priority: 0.6,
  });

  try {
    const apiDocs = await getApiDocs();
    for (const doc of apiDocs) {
      entries.push({
        url: `${SITE_URL}/docs/api/${doc.slug}`,
        changeFrequency: 'monthly',
        priority: 0.5,
      });
    }
  } catch {
    // Content may be unavailable
  }

  return entries;
}
