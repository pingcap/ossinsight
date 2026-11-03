import {withRequestAudit} from '@/lib/server/route-audit';
import { getRepoByName, jsonDataResponse } from '@/lib/server/internal-api';

export const runtime = 'edge';

async function handleGET(
  _req: Request,
  ctx: { params: Promise<{ owner: string; repo: string }> },
) {
  const { owner, repo } = await ctx.params;
  const data = await getRepoByName(owner, repo);

  if (!data) {
    return jsonDataResponse(null, { status: 404 });
  }

  return jsonDataResponse(data);
}

export const GET = withRequestAudit('GET /gh/repo/[owner]/[repo]', handleGET);
