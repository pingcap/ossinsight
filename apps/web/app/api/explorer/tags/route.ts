import {withRequestAudit} from '@/lib/server/route-audit';
import { listExplorerTags } from '@/lib/server/explorer-api';

export const runtime = 'edge';

async function handleGET() {
  try {
    const tags = await listExplorerTags();

    return new Response(JSON.stringify(tags), {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'max-age=60',
        'CDN-Cache-Control': 'max-age=300',
        'Vercel-CDN-Cache-Control': 'max-age=3600',
      },
    });
  } catch (error) {


    return new Response(JSON.stringify({ message: 'Internal Server Error' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
    });
  }
}

export const GET = withRequestAudit('GET /api/explorer/tags', handleGET);
