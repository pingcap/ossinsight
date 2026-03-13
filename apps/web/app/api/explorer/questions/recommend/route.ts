import { NextRequest } from 'next/server';
import { listRecommendedExplorerQuestions } from '@/lib/server/explorer-api';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  try {
    const aiGenerated = parseBoolean(req.nextUrl.searchParams.get('aiGenerated'));
    const tagId = parseInteger(req.nextUrl.searchParams.get('tagId'));
    const n = parseInteger(req.nextUrl.searchParams.get('n'));
    const questions = await listRecommendedExplorerQuestions({
      aiGenerated,
      tagId,
      n,
    });

    return new Response(JSON.stringify(questions), {
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

function parseBoolean(value: string | null) {
  if (value == null) {
    return undefined;
  }

  if (value === 'true' || value === '1') {
    return true;
  }

  if (value === 'false' || value === '0') {
    return false;
  }

  return undefined;
}

function parseInteger(value: string | null) {
  if (value == null) {
    return undefined;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : undefined;
}
