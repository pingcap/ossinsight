import { listExplorerTags } from '@/lib/server/explorer-api';

export const runtime = 'edge';

export async function GET() {
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
    console.error(error);

    return new Response(JSON.stringify({ message: 'Internal Server Error' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
    });
  }
}
