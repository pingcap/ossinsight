import {withRequestAudit} from '@/lib/server/route-audit';
import { explainHotCollections } from '@/lib/server/internal-api';
import { createApiErrorResponse, jsonCachedResponse } from '@/lib/server/responses';

export const runtime = 'edge';

async function handleGET() {
  try {
    const result = await explainHotCollections();
    return jsonCachedResponse(result);
  } catch (error) {
    return createApiErrorResponse(error);
  }
}

export const GET = withRequestAudit('GET /collections/api/hot/explain', handleGET);
