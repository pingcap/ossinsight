import {withRequestAudit} from '@/lib/server/route-audit';
import { getHotCollections } from '@/lib/server/internal-api';
import { createApiErrorResponse, jsonCachedResponse } from '@/lib/server/responses';

export const runtime = 'edge';

async function handleGET() {
  try {
    const result = await getHotCollections();
    return jsonCachedResponse(result, {
      cdnCacheControl: 'max-age=300',
      vercelCdnCacheControl: 'max-age=3600',
    });
  } catch (error) {
    return createApiErrorResponse(error);
  }
}

export const GET = withRequestAudit('GET /collections/api/hot', handleGET);
