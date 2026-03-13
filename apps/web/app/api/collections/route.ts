import {
  jsonDataResponse,
  normalizeCollectionSort,
  jsonResponse,
  listCollections,
  searchCollections,
} from '@/lib/server/internal-api';

export const runtime = 'edge';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const keyword = searchParams.get('q') ?? searchParams.get('keyword') ?? '';
  const sort = normalizeCollectionSort(searchParams.get('sort'));
  const hasPaginationRequest =
    searchParams.has('page') ||
    searchParams.has('pageSize') ||
    searchParams.has('q') ||
    searchParams.has('keyword') ||
    searchParams.has('sort');

  if (!hasPaginationRequest) {
    const data = await listCollections();
    return jsonDataResponse(data);
  }

  const result = await searchCollections({
    keyword,
    page: searchParams.get('page') ?? undefined,
    pageSize: searchParams.get('pageSize') ?? undefined,
    sort,
  });

  return jsonResponse(result);
}
