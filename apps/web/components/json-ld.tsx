export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

const SITE_URL = process.env.SITE_URL || 'https://ossinsight.io';

export function WebSiteJsonLd() {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'OSSInsight',
        url: SITE_URL,
        description: 'OSSInsight analyzes billions of GitHub events and provides insights for open source software.',
        publisher: {
          '@type': 'Organization',
          name: 'PingCAP',
          url: 'https://pingcap.com',
        },
        potentialAction: {
          '@type': 'SearchAction',
          target: `${SITE_URL}/explore/?q={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
      }}
    />
  );
}

export function CollectionPageJsonLd({
  name,
  description,
  slug,
}: {
  name: string;
  description: string;
  slug: string;
}) {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name,
        description,
        url: `${SITE_URL}/collections/${slug}`,
        isPartOf: { '@type': 'WebSite', name: 'OSSInsight', url: SITE_URL },
      }}
    />
  );
}

export function FAQPageJsonLd({ items }: { items: { question: string; answer: string }[] }) {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: items.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.answer,
          },
        })),
      }}
    />
  );
}

export function OrganizationJsonLd() {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'OSSInsight',
        url: SITE_URL,
        logo: `${SITE_URL}/logo.png`,
        description: 'OSSInsight analyzes billions of GitHub events and provides insights for open source software.',
        parentOrganization: {
          '@type': 'Organization',
          name: 'PingCAP',
          url: 'https://pingcap.com',
        },
        sameAs: [
          'https://github.com/pingcap/ossinsight',
          'https://twitter.com/OSSInsight',
        ],
      }}
    />
  );
}

export function BreadcrumbListJsonLd({
  items,
}: {
  items: { name: string; url?: string }[];
}) {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: item.name,
          ...(item.url ? { item: item.url.startsWith('http') ? item.url : `${SITE_URL}${item.url}` } : {}),
        })),
      }}
    />
  );
}

export function SoftwareApplicationJsonLd({
  repoName,
  description,
  stars,
  language,
}: {
  repoName: string;
  description?: string;
  stars?: number;
  language?: string;
}) {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'SoftwareSourceCode',
        name: repoName,
        description,
        codeRepository: `https://github.com/${repoName}`,
        programmingLanguage: language,
        ...(stars != null
          ? {
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: Math.min(5, Math.round((stars / 10000) * 5 * 10) / 10),
                bestRating: 5,
                ratingCount: stars,
              },
            }
          : {}),
      }}
    />
  );
}
