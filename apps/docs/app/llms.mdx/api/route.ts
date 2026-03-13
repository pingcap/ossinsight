import { buildApiOverviewLLMText } from '@/lib/api-llm-text';
import { getApiOverview } from '@/lib/content';

export const revalidate = false;

export async function GET() {
  const overview = await getApiOverview();

  if (!overview) {
    return new Response('Not Found', { status: 404 });
  }

  return new Response(buildApiOverviewLLMText(overview), {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
    },
  });
}
