import {withRequestAudit} from '@/lib/server/route-audit';
import { NextRequest } from 'next/server';
import { APIError, DegradedDataError } from '@/lib/data-service';
import { getQueryName, runQuery } from '@/lib/data-service/routes';
import { corsHeaders, corsPreflight } from '@/lib/cors';

interface Params {
  query: string | string[];
}

export const runtime = 'edge';

async function handleOPTIONS(req: NextRequest) {
  return corsPreflight(req.headers.get('origin'));
}

async function handleGET(req: NextRequest, reqCtx: { params: Promise<Params> }) {
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
    if (error instanceof DegradedDataError) {
      return new Response(JSON.stringify(error.toResponseBody()), {
        status: DegradedDataError.RESPONSE_STATUS,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Cache-Control': 'no-store',
        Warning: '199 - "degraded data: star-event derived ranking unavailable"',
          ...cors,
        },
      });
    }

    if (error instanceof APIError) {
      return new Response(JSON.stringify({ message: error.publicMessage }), {
        status: error.statusCode,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          ...cors,
        },
      });
    }

    return new Response(JSON.stringify({ message: 'Internal Server Error' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        ...cors,
      },
    });
  }
}

export const OPTIONS = withRequestAudit('OPTIONS /api/q/[...query]', handleOPTIONS);

export const GET = withRequestAudit('GET /api/q/[...query]', handleGET);
