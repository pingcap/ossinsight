import {withRequestAudit} from '@/lib/server/route-audit';
import { NextRequest } from 'next/server';
import { APIError } from '@/lib/data-service';
import { explainQuery, getQueryName } from '@/lib/data-service/routes';

interface Params {
  query: string | string[];
}

export const runtime = 'edge';

async function handleGET(req: NextRequest, reqCtx: { params: Promise<Params> }) {
  try {
    const params = await reqCtx.params;
    const queryName = getQueryName(params.query);
    const result = await explainQuery(queryName, req.nextUrl.searchParams);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
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

export const GET = withRequestAudit('GET /q/explain/[...query]', handleGET);
