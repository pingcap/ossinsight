import {withRequestAudit} from '@/lib/server/route-audit';
import { getRepoById, jsonDataResponse } from '@/lib/server/internal-api';

export const runtime = 'edge';

async function handleGET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const data = await getRepoById(id);

  if (!data) {
    return jsonDataResponse(null, { status: 404 });
  }

  return jsonDataResponse(data);
}

export const GET = withRequestAudit('GET /gh/repositories/[id]', handleGET);
