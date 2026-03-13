import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { DynamicCodeBlock } from 'fumadocs-ui/components/dynamic-codeblock';
import { MarkdownCopyButton, ViewOptionsPopover } from 'fumadocs-ui/layouts/docs/page';
import { Tab, Tabs } from 'fumadocs-ui/components/tabs';
import { TypeTable } from 'fumadocs-ui/components/type-table';
import { DocsBody, DocsDescription, DocsPage, DocsTitle } from 'fumadocs-ui/page';
import { buildApiExampleSnippets } from '@/lib/api-example-snippets';
import { getApiMethodBadgeClassName } from '@/lib/api-method-style';
import { githubUrl } from '@/lib/layout-options';
import { getApiDoc } from '@/lib/content';

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const doc = await getApiDoc(slug);

  if (!doc) {
    return {};
  }

  return {
    title: doc.title,
    description: doc.description,
  };
}

export default async function ApiDocDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const doc = await getApiDoc(slug);

  if (!doc) {
    notFound();
  }

  const parameterTypes = Object.fromEntries(
    doc.parameters.map((parameter, index) => [
      parameter.name ?? `parameter-${index}`,
      {
        default: parameter.schema?.default != null ? JSON.stringify(parameter.schema.default) : undefined,
        description: parameter.description ?? '-',
        required: parameter.required,
        type: parameter.schema?.type ?? 'unknown',
      },
    ]),
  );
  const examples = buildApiExampleSnippets(doc);

  return (
    <DocsPage
      breadcrumb={{
        enabled: true,
      }}
      footer={{
        enabled: false,
      }}
      tableOfContent={{
        enabled: false,
      }}
    >
      <DocsTitle>
        <span className="flex flex-wrap items-center gap-3">
          <span
            className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[13px] font-semibold uppercase tracking-[0.2em] ${getApiMethodBadgeClassName(doc.method)}`}
          >
            {doc.method}
          </span>
          {doc.title}
        </span>
      </DocsTitle>
      {doc.tags.length > 0 ? (
        <div className="not-prose mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs uppercase tracking-[0.2em] text-[#8f8f95]">
          {doc.tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
      ) : null}
      <div className="not-prose mb-6 flex flex-wrap items-center gap-2 border-b border-fd-border pb-6 pt-1">
        <MarkdownCopyButton markdownUrl={`/docs/api/${doc.slug}.mdx`} />
        <ViewOptionsPopover
          githubUrl={`${githubUrl}/blob/main/${doc.sourcePath}`}
          markdownUrl={`/docs/api/${doc.slug}.mdx`}
        />
      </div>
      <DocsDescription>{doc.description}</DocsDescription>
      <DocsBody>
        {doc.parameters.length > 0 && (
          <>
            <h2>Parameters</h2>
            <div className="not-prose">
              <TypeTable type={parameterTypes} />
            </div>
          </>
        )}

        <h2>Usage</h2>
        <div className="not-prose">
          <Tabs items={['curl', 'python', 'typescript']} defaultValue="curl">
            <Tab value="curl">
              <DynamicCodeBlock lang="bash" code={examples.curl} codeblock={{ title: 'cURL' }} />
            </Tab>

            <Tab value="python">
              <DynamicCodeBlock lang="python" code={examples.python} codeblock={{ title: 'Python' }} />
            </Tab>

            <Tab value="typescript">
              <DynamicCodeBlock lang="ts" code={examples.typescript} codeblock={{ title: 'TypeScript' }} />
            </Tab>
          </Tabs>
        </div>

        {doc.responseExample && (
          <>
            <h2>Example Response</h2>
            <p>Status: <code>{doc.responseStatus}</code></p>
            <DynamicCodeBlock lang="json" code={doc.responseExample} codeblock={{ title: 'Response' }} />
          </>
        )}
      </DocsBody>
    </DocsPage>
  );
}
