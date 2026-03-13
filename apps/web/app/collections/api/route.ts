import {
  jsonDataResponse,
  listCollections,
  normalizeCollectionSort,
  searchCollections,
} from '@/lib/server/internal-api';
import { createApiErrorResponse, jsonCachedResponse } from '@/lib/server/responses';

export const runtime = 'edge';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const keyword = searchParams.get('q') ?? searchParams.get('keyword') ?? '';
    const sort = normalizeCollectionSort(searchParams.get('sort'));
    const hasSearchRequest =
      searchParams.has('page') ||
      searchParams.has('pageSize') ||
      searchParams.has('q') ||
      searchParams.has('keyword') ||
      searchParams.has('sort');

    if (!hasSearchRequest) {
      const data = await listCollections();
      return jsonDataResponse(data, {
        headers: {
          'CDN-Cache-Control': 'max-age=300',
          'Vercel-CDN-Cache-Control': 'max-age=3600',
        },
      });
    }

    const result = await searchCollections({
      keyword,
      page: searchParams.get('page') ?? undefined,
      pageSize: searchParams.get('pageSize') ?? undefined,
      sort,
    });

    return jsonCachedResponse(result, {
      cdnCacheControl: 'max-age=300',
      vercelCdnCacheControl: 'max-age=3600',
    });
  } catch (error) {
    return createApiErrorResponse(error);
  }
}
