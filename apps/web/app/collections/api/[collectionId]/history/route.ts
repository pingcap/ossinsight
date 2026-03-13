import { NextRequest } from 'next/server';
import {
  getCollectionHistory,
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
    const result = await getCollectionHistory(parseCollectionId(collectionId), metric);

    return jsonCachedResponse(result, {
      cdnCacheControl: 'max-age=300',
      vercelCdnCacheControl: 'max-age=3600',
    });
  } catch (error) {
    return createApiErrorResponse(error);
  }
}
