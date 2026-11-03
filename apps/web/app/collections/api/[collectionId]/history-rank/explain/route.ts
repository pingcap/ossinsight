import {withRequestAudit} from '@/lib/server/route-audit';
import { NextRequest } from 'next/server';
import {
  explainCollectionHistoryRank,
  parseCollectionId,
  parseCollectionMetric,
} from '@/lib/server/internal-api';
import { createApiErrorResponse, jsonCachedResponse } from '@/lib/server/responses';

interface Params {
  collectionId: string;
}

export const runtime = 'edge';

async function handleGET(req: NextRequest, reqCtx: { params: Promise<Params> }) {
  try {
    const { collectionId } = await reqCtx.params;
    const metric = parseCollectionMetric(req.nextUrl.searchParams.get('metric') ?? 'stars');
    const result = await explainCollectionHistoryRank(parseCollectionId(collectionId), metric);
    return jsonCachedResponse(result);
  } catch (error) {
    return createApiErrorResponse(error);
  }
}

export const GET = withRequestAudit('GET /collections/api/[collectionId]/history-rank/explain', handleGET);
