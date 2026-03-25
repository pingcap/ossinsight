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
  license,
  author,
}: {
  repoName: string;
  description?: string;
  stars?: number;
  language?: string;
  license?: string;
  author?: { type: 'Person' | 'Organization'; name: string; url?: string };
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
        ...(license ? { license } : {}),
        ...(author
          ? {
              author: {
                '@type': author.type,
                name: author.name,
                ...(author.url ? { url: author.url } : {}),
              },
            }
          : {}),
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

export function PersonJsonLd({
  name,
  login,
  bio,
  avatarUrl,
}: {
  name: string;
  login: string;
  bio?: string;
  avatarUrl?: string;
}) {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'Person',
        name,
        url: `https://github.com/${login}`,
        ...(bio ? { description: bio } : {}),
        ...(avatarUrl ? { image: avatarUrl } : {}),
        sameAs: [`https://github.com/${login}`],
      }}
    />
  );
}

export function SiteNavigationJsonLd() {
  const SITE_URL_LOCAL = process.env.SITE_URL || 'https://ossinsight.io';
  const navItems = [
    { name: 'Home', url: `${SITE_URL_LOCAL}/` },
    { name: 'Data Explorer', url: `${SITE_URL_LOCAL}/explore` },
    { name: 'Collections', url: `${SITE_URL_LOCAL}/collections` },
    { name: 'Trending', url: `${SITE_URL_LOCAL}/trending` },
    { name: 'Languages', url: `${SITE_URL_LOCAL}/languages` },
    { name: 'Blog', url: `${SITE_URL_LOCAL}/blog` },
  ];
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: 'Site Navigation',
        itemListElement: navItems.map((item, index) => ({
          '@type': 'SiteNavigationElement',
          position: index + 1,
          name: item.name,
          url: item.url,
        })),
      }}
    />
  );
}

export function ItemListJsonLd({
  name,
  items,
}: {
  name: string;
  items: { name: string; url: string }[];
}) {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name,
        numberOfItems: items.length,
        itemListElement: items.map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: item.name,
          url: item.url,
        })),
      }}
    />
  );
}

export function AggregateRatingJsonLd({
  itemName,
  itemUrl,
  ratingValue,
  ratingCount,
}: {
  itemName: string;
  itemUrl: string;
  ratingValue: number;
  ratingCount: number;
}) {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: itemName,
        url: itemUrl.startsWith('http') ? itemUrl : `${SITE_URL}${itemUrl}`,
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: Math.max(1, Math.min(5, ratingValue)),
          bestRating: 5,
          worstRating: 1,
          ratingCount,
        },
      }}
    />
  );
}

export function DatasetJsonLd({
  name,
  description,
  url,
}: {
  name: string;
  description: string;
  url: string;
}) {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'Dataset',
        name,
        description,
        url,
        creator: {
          '@type': 'Organization',
          name: 'OSSInsight',
          url: SITE_URL,
          parentOrganization: {
            '@type': 'Organization',
            name: 'PingCAP',
            url: 'https://pingcap.com',
          },
        },
        license: 'https://creativecommons.org/licenses/by/4.0/',
        isAccessibleForFree: true,
        temporalCoverage: '2011/..',
        variableMeasured: [
          'GitHub stars',
          'Pull requests',
          'Issues',
          'Commits',
          'Contributors',
          'Forks',
        ],
      }}
    />
  );
}
