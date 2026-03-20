import { NextRequest } from 'next/server';
import { APIError } from '@/lib/data-service';
import { getQueryName, runQuery } from '@/lib/data-service/routes';
import { corsHeaders, corsPreflight } from '@/lib/cors';

interface Params {
  query: string | string[];
}

export const runtime = 'edge';

export async function OPTIONS(req: NextRequest) {
  return corsPreflight(req.headers.get('origin'));
}

export async function GET(req: NextRequest, reqCtx: { params: Promise<Params> }) {
  const origin = req.headers.get('origin');
  const cors = corsHeaders(origin);

  try {
    const params = await reqCtx.params;
    const queryName = getQueryName(params.query);
    const result = await runQuery(queryName, req.nextUrl.searchParams);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store',
        ...cors,
      },
    });
  } catch (error) {
    if (error instanceof APIError) {
      return new Response(JSON.stringify({ message: error.message }), {
        status: error.statusCode,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          ...cors,
        },
      });
    }

    console.error(error);
    return new Response(JSON.stringify({ message: 'Internal Server Error' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        ...cors,
      },
    });
  }
}
