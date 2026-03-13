import { getRepoByName, jsonDataResponse } from '@/lib/server/internal-api';

export const runtime = 'edge';

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ owner: string; repo: string }> },
) {
  const { owner, repo } = await ctx.params;
  const data = await getRepoByName(decodeURIComponent(owner), decodeURIComponent(repo));

  if (!data) {
    return jsonDataResponse(null, { status: 404 });
  }

  return jsonDataResponse(data);
}
