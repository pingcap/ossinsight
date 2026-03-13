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

export async function GET(req: NextRequest, reqCtx: { params: Promise<Params> }) {
  try {
    const { collectionId } = await reqCtx.params;
    const metric = parseCollectionMetric(req.nextUrl.searchParams.get('metric') ?? 'stars');
    const result = await explainCollectionHistoryRank(parseCollectionId(collectionId), metric);
    return jsonCachedResponse(result);
  } catch (error) {
    return createApiErrorResponse(error);
  }
}
