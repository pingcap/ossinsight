import {withRequestAudit} from '@/lib/server/route-audit';
import { NextRequest } from 'next/server';
import { APIError, DegradedDataError } from '@/lib/data-service';
import { getQueryName, runQuery } from '@/lib/data-service/routes';

interface Params {
  query: string | string[];
}

export const runtime = 'edge';

async function handleGET(req: NextRequest, reqCtx: { params: Promise<Params> }) {
  try {
    const resolvedParams = await reqCtx.params;
    const queryName = getQueryName(resolvedParams.query);
    const result = await runQuery(queryName, req.nextUrl.searchParams);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'max-age=60',
        'CDN-Cache-Control': 'max-age=300',
        'Vercel-CDN-Cache-Control': 'max-age=3600',
      },
    });
  } catch (err) {
    if (err instanceof DegradedDataError) {
      return new Response(JSON.stringify(err.toResponseBody()), {
        status: err.statusCode,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          // Never let CDNs pin the incident body on this otherwise-cached route.
          'Cache-Control': 'no-store',
        },
      });
    }

    if (err instanceof APIError) {
      return new Response(JSON.stringify({ message: err.publicMessage }), {
        status: err.statusCode,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      });
    }

    return new Response(JSON.stringify({ message: 'Internal Server Error' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
    });
  }
}

export const GET = withRequestAudit('GET /api/queries/[...query]', handleGET);
