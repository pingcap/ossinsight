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
}: {
  title: string;
  description: string;
  slug: string;
  date: string;
  authors?: string[];
}) {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: title,
        description,
        url: `${SITE_URL}/blog/${slug}`,
        datePublished: date,
        ...(authors?.length
          ? { author: authors.map((name) => ({ '@type': 'Person', name })) }
          : {}),
        publisher: {
          '@type': 'Organization',
          name: 'OSSInsight',
          url: SITE_URL,
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
