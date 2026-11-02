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
    const params = await reqCtx.params;
    const queryName = getQueryName(params.query);
    const result = await runQuery(queryName, req.nextUrl.searchParams);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store',
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
        },
      });
    }

    if (error instanceof APIError) {
      return new Response(JSON.stringify({ message: error.publicMessage }), {
        status: error.statusCode,
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

export const GET = withRequestAudit('GET /q/[...query]', handleGET);
