import { NextRequest } from 'next/server';
import {
  explainCollectionRanking,
  parseCollectionId,
  parseCollectionRankRange,
  parseCollectionRankingMetric,
} from '@/lib/server/internal-api';
import { createApiErrorResponse, jsonCachedResponse } from '@/lib/server/responses';

interface Params {
  collectionId: string;
}

export const runtime = 'edge';

export async function GET(req: NextRequest, reqCtx: { params: Promise<Params> }) {
  try {
    const { collectionId } = await reqCtx.params;
    const metric = parseCollectionRankingMetric(req.nextUrl.searchParams.get('metric') ?? 'stars');
    const range = parseCollectionRankRange(req.nextUrl.searchParams.get('range') ?? 'last-28-days');
    const result = await explainCollectionRanking(parseCollectionId(collectionId), metric, range);
    return jsonCachedResponse(result);
  } catch (error) {
    return createApiErrorResponse(error);
  }
}
