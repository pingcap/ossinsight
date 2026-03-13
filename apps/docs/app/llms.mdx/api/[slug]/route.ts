import { buildApiDocLLMText } from '@/lib/api-llm-text';
import { getApiDoc, getApiDocs } from '@/lib/content';

export const revalidate = false;

type RouteProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function GET(_request: Request, { params }: RouteProps) {
  const { slug } = await params;
  const page = await getApiDoc(slug);

  if (!page) {
    return new Response('Not Found', { status: 404 });
  }

  return new Response(buildApiDocLLMText(page), {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
    },
  });
}

export async function generateStaticParams() {
  const docs = await getApiDocs();
  return docs.map((doc) => ({ slug: doc.slug }));
}
