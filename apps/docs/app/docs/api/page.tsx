import type { Metadata } from 'next';
import { Callout } from 'fumadocs-ui/components/callout';
import { DynamicCodeBlock } from 'fumadocs-ui/components/dynamic-codeblock';
import { MarkdownCopyButton, ViewOptionsPopover } from 'fumadocs-ui/layouts/docs/page';
import { DocsBody, DocsDescription, DocsPage, DocsTitle } from 'fumadocs-ui/page';
import { getApiMethodBadgeClassName } from '@/lib/api-method-style';
import { githubUrl } from '@/lib/layout-options';
import { apiNavGroups, apiShowcaseLinks } from '@/lib/api-navigation';
import { getApiDocs, getApiOverview } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Public API',
  description: 'API reference for OSS Insight public endpoints.',
};

export default async function ApiDocsIndexPage() {
  const [overview, apiDocs] = await Promise.all([
    getApiOverview(),
    getApiDocs(),
  ]);
  const docsBySlug = new Map(apiDocs.map((doc) => [doc.slug, doc]));

  return (
    <DocsPage
      breadcrumb={{
        enabled: false,
      }}
      footer={{
        enabled: false,
      }}
      tableOfContent={{
        enabled: false,
      }}
    >
      <DocsTitle>{overview?.title ?? 'Public API'}</DocsTitle>
      {overview && (
        <div className="not-prose mb-6 flex flex-wrap items-center gap-2 border-b border-fd-border pb-6 pt-1">
          <MarkdownCopyButton markdownUrl="/docs/api.mdx" />
          <ViewOptionsPopover githubUrl={`${githubUrl}/blob/main/${overview.sourcePath}`} markdownUrl="/docs/api.mdx" />
        </div>
      )}
      <DocsDescription>
        {overview?.description ?? 'Reference pages for the public API endpoints exposed by OSS Insight.'}
      </DocsDescription>
      <DocsBody>
        <p>
          <strong>Version:</strong> <code>v1beta</code>
        </p>

        <p>
          OSSInsight Public APIs (beta) provide a convenient way to access insight data for open source projects on
          GitHub, supplementing the existing GitHub API.
        </p>

        <h2>Explore Endpoints</h2>
        {apiNavGroups.map((group) => (
          <section key={group.label} className="not-prose mt-8 border-t border-white/8 pt-4">
            <h3 className="mb-2 text-[17px] font-semibold text-fd-foreground">{group.label}</h3>
            <ul className="divide-y divide-white/8">
              {group.items.map((item) => {
                const doc = docsBySlug.get(item.slug);

                return (
                  <li key={item.slug}>
                    <a
                      href={`/docs/api/${item.slug}`}
                      className="group flex items-start gap-4 py-4 transition-colors"
                    >
                      <span
                        className={`mt-0.5 inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.2em] ${getApiMethodBadgeClassName(item.method)}`}
                      >
                        {item.method}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2 text-[14px] font-medium text-fd-foreground transition-colors group-hover:text-[#fff2bd]">
                          {item.label}
                          <span className="text-[#7c7c7c] transition-colors group-hover:text-[#ffe895]">›</span>
                        </span>
                        <span className="mt-1 block text-[13px] leading-6 text-[#a7a7ad]">
                          {doc?.description ?? doc?.path ?? ''}
                        </span>
                      </span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}

        <h2>Usage</h2>
        <p>
          The OSSInsight Public API follows the OpenAPI specification and can be called with tools like <code>curl</code>{' '}
          or any HTTP client library.
        </p>

        <Callout title="Base URL">
          <code>https://api.ossinsight.io/v1</code>
        </Callout>

        <h3>Authentication</h3>
        <p>
          No authentication is required for the beta version of the public API, though rate limits apply.
        </p>

        <h3>Rate Limit</h3>
        <p>Per IP address, the current limit is <strong>600 requests per hour</strong>.</p>
        <DynamicCodeBlock
          lang="bash"
          code={`x-ratelimit-limit: 600
x-ratelimit-remaining: 599`}
          codeblock={{ title: 'Headers' }}
        />
        <p>There is also a global limit of <strong>1000 requests per minute</strong>.</p>
        <DynamicCodeBlock
          lang="bash"
          code={`x-ratelimit-limit-minute: 1000
x-ratelimit-remaining-minute: 97`}
          codeblock={{ title: 'Headers' }}
        />

        <h3>Example</h3>
        <p>
          To find the countries or regions of stargazers in <code>pingcap/tidb</code>, you can call:
        </p>
        <DynamicCodeBlock
          lang="bash"
          code="curl https://api.ossinsight.io/v1/repos/pingcap/tidb/stargazers/countries"
          codeblock={{ title: 'cURL' }}
        />
        <details>
          <summary>Example Response</summary>
          <DynamicCodeBlock
            lang="json"
            code={`{
  "type": "sql_endpoint",
  "data": {
    "columns": [
      { "col": "country_or_area", "data_type": "CHAR", "nullable": true },
      { "col": "count", "data_type": "BIGINT", "nullable": true },
      { "col": "percentage", "data_type": "DECIMAL", "nullable": true }
    ],
    "rows": [
      { "count": "9183", "country_or_area": "CN", "percentage": "0.5936" },
      { "count": "1542", "country_or_area": "US", "percentage": "0.0997" },
      { "count": "471", "country_or_area": "JP", "percentage": "0.0304" }
    ]
  }
}`}
            codeblock={{ title: 'Response' }}
          />
        </details>

        <h2 id="showcase">Showcase</h2>
        <ul>
          {apiShowcaseLinks.map((item) => (
            <li key={item.href}>
              <a href={item.href}>{item.label}</a>: {item.description}
            </li>
          ))}
        </ul>

        <h2>Request New API</h2>
        <ul>
          <li>Email us at <a href="mailto:ossinsight@pingcap.com">ossinsight@pingcap.com</a>.</li>
          <li>
            Open an issue in the{' '}
            <a href="https://github.com/pingcap/ossinsight/issues/new?assignees=&labels=type%2Ffeature&projects=&template=feature_request.md&title=New%20API">
              OSSInsight GitHub repository
            </a>.
          </li>
        </ul>
      </DocsBody>
    </DocsPage>
  );
}
