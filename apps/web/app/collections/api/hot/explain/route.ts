import { explainHotCollections } from '@/lib/server/internal-api';
import { createApiErrorResponse, jsonCachedResponse } from '@/lib/server/responses';

export const runtime = 'edge';

export async function GET() {
  try {
    const result = await explainHotCollections();
    return jsonCachedResponse(result);
  } catch (error) {
    return createApiErrorResponse(error);
  }
}
