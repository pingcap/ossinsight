export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

const SITE_URL = process.env.SITE_URL || 'https://ossinsight.io';

export function BlogPostJsonLd({
  title,
  description,
  slug,
  date,
  authors,
  image,
  keywords,
}: {
  title: string;
  description: string;
  slug: string;
  date: string;
  authors?: string[];
  image?: string;
  keywords?: string[];
}) {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': ['BlogPosting', 'TechArticle'],
        headline: title,
        description,
        url: `${SITE_URL}/blog/${slug}`,
        datePublished: date,
        dateModified: date,
        ...(image ? { image } : {}),
        ...(keywords?.length ? { keywords: keywords.join(', ') } : {}),
        ...(authors?.length
          ? { author: authors.map((name) => ({ '@type': 'Person', name })) }
          : {}),
        publisher: {
          '@type': 'Organization',
          name: 'OSSInsight',
          url: SITE_URL,
          logo: {
            '@type': 'ImageObject',
            url: `${SITE_URL}/logo.png`,
          },
        },
        isPartOf: {
          '@type': 'Blog',
          name: 'OSSInsight Blog',
          url: `${SITE_URL}/blog`,
        },
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': `${SITE_URL}/blog/${slug}`,
        },
      }}
    />
  );
}

export function LearningResourceJsonLd({
  title,
  description,
  slug,
  date,
  keywords,
  image,
}: {
  title: string;
  description: string;
  slug: string;
  date?: string;
  keywords?: string[];
  image?: string;
}) {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'LearningResource',
        name: title,
        description,
        url: `${SITE_URL}/blog/${slug}`,
        ...(date ? { datePublished: date } : {}),
        ...(image ? { image } : {}),
        ...(keywords?.length ? { keywords: keywords.join(', ') } : {}),
        educationalUse: 'professional development',
        learningResourceType: 'article',
        provider: {
          '@type': 'Organization',
          name: 'OSSInsight',
          url: SITE_URL,
        },
        isPartOf: {
          '@type': 'Blog',
          name: 'OSSInsight Blog',
          url: `${SITE_URL}/blog`,
        },
      }}
    />
  );
}

export function ApiDocJsonLd({
  title,
  description,
  slug,
}: {
  title: string;
  description: string;
  slug: string;
}) {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'TechArticle',
        headline: title,
        description,
        url: `${SITE_URL}/docs/api/${slug}`,
        publisher: {
          '@type': 'Organization',
          name: 'OSSInsight',
          url: SITE_URL,
        },
      }}
    />
  );
}
