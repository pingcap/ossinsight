import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { DocsBody, DocsDescription, DocsPage, DocsTitle } from 'fumadocs-ui/page';
import { MarkdownCopyButton, ViewOptionsPopover } from 'fumadocs-ui/layouts/docs/page';
import { githubUrl } from '@/lib/layout-options';
import { source } from '@/lib/source';

type PageProps = {
  params: Promise<{
    slug?: string[];
  }>;
};

export function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  if (!slug || slug.length === 0) {
    return {
      title: 'OSS Insight Docs',
      description: 'Product guides and public API documentation for OSS Insight.',
    };
  }

  const page = source.getPage(slug);

  if (!page) {
    return {};
  }

  return {
    title: page.data.title,
    description: page.data.description,
  };
}

export default async function DocsContentPage({ params }: PageProps) {
  const { slug } = await params;

  if (!slug || slug.length === 0) {
    redirect('/docs/about');
  }

  const page = source.getPage(slug);

  if (!page) {
    notFound();
  }

  const MdxContent = page.data.body;
  const markdownUrl = `${page.url}.mdx`;
  const githubFileUrl = `${githubUrl}/blob/main/apps/docs/content/docs/${page.data.info.path}`;

  return (
    <DocsPage toc={page.data.toc} full={false}>
      <DocsTitle>{page.data.title}</DocsTitle>
      <div className="not-prose mb-6 flex flex-wrap items-center gap-2 border-b border-fd-border pb-6 pt-1">
        <MarkdownCopyButton markdownUrl={markdownUrl} />
        <ViewOptionsPopover githubUrl={githubFileUrl} markdownUrl={markdownUrl} />
      </div>
      <DocsDescription>{page.data.description}</DocsDescription>
      <DocsBody>
        <MdxContent />
      </DocsBody>
    </DocsPage>
  );
}
