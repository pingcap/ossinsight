import {withRequestAudit} from '@/lib/server/route-audit';
import { getUserByLogin, jsonDataResponse } from '@/lib/server/internal-api';

export const runtime = 'edge';

async function handleGET(
  _req: Request,
  ctx: { params: Promise<{ username: string }> },
) {
  const { username } = await ctx.params;
  const data = await getUserByLogin(username);

  if (!data) {
    return jsonDataResponse(null, { status: 404 });
  }

  return jsonDataResponse(data);
}

export const GET = withRequestAudit('GET /gh/users/[username]', handleGET);
