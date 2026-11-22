import {withRequestAudit} from '@/lib/server/route-audit';
import { jsonDataResponse, searchUsers, corsPreflightResponse } from '@/lib/server/internal-api';

import {normalizeSearchKeyword, invalidSearchResponse} from '@/lib/server/search-keyword';

export const runtime = 'edge';

async function handleOPTIONS() {
  return corsPreflightResponse();
}

async function handleGET(req: Request) {
  const { searchParams } = new URL(req.url);
  const keyword = normalizeSearchKeyword(searchParams.get('keyword') ?? '');
  if (keyword === null || searchParams.getAll('keyword').length > 1) return invalidSearchResponse();
  const data = await searchUsers(keyword, 'user');
  return jsonDataResponse(data);
}

export const OPTIONS = withRequestAudit('OPTIONS /gh/users/search', handleOPTIONS);

export const GET = withRequestAudit('GET /gh/users/search', handleGET);
