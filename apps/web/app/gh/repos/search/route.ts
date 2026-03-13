import { searchRepos, jsonDataResponse, corsPreflightResponse } from '@/lib/server/internal-api';

export const runtime = 'edge';

export async function OPTIONS() {
  return corsPreflightResponse();
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const keyword = searchParams.get('keyword') ?? '';
  const data = await searchRepos(keyword);
  return jsonDataResponse(data);
}
