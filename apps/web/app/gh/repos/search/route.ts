import {withRequestAudit} from '@/lib/server/request-audit';
import { searchRepos, jsonDataResponse, corsPreflightResponse } from '@/lib/server/internal-api';

export const runtime = 'edge';

async function handleOPTIONS() {
  return corsPreflightResponse();
}

async function handleGET(req: Request) {
  const { searchParams } = new URL(req.url);
  const keyword = searchParams.get('keyword') ?? '';
  const data = await searchRepos(keyword);
  return jsonDataResponse(data);
}

export const OPTIONS = withRequestAudit('OPTIONS /gh/repos/search', handleOPTIONS);

export const GET = withRequestAudit('GET /gh/repos/search', handleGET);
