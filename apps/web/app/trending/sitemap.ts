export const dynamic = 'force-dynamic';
import {withSitemapAudit} from '@/lib/server/route-audit';
import type { MetadataRoute } from 'next';

const SITE_URL = process.env.SITE_URL || 'https://ossinsight.io';

function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${SITE_URL}/trending`,
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ];
}

export default withSitemapAudit('GET /trending/sitemap.xml', sitemap);
