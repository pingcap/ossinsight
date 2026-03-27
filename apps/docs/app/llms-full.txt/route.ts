import { buildApiDocLLMText, buildApiOverviewLLMText } from '@/lib/api-llm-text';
import { getLLMText } from '@/lib/get-llm-text';
import { type ApiDoc, getApiDoc, getApiDocs, getApiOverview } from '@/lib/content';
import { source } from '@/lib/source';

export const revalidate = false;

export async function GET() {
  const [docsPages, apiOverview, apiSummaries] = await Promise.all([
    Promise.all(source.getPages().map(getLLMText)),
    getApiOverview(),
    getApiDocs(),
  ]);
  const apiPages = await Promise.all(apiSummaries.map(async (summary) => getApiDoc(summary.slug)));
  const pages = [
    ...docsPages,
    ...(apiOverview ? [buildApiOverviewLLMText(apiOverview)] : []),
    ...apiPages.filter((page): page is ApiDoc => page != null).map(buildApiDocLLMText),
  ];

  return new Response(pages.join('\n\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}
