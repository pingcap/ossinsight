import { getUserByLogin, jsonDataResponse } from '@/lib/server/internal-api';

export const runtime = 'edge';

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ username: string }> },
) {
  const { username } = await ctx.params;
  const data = await getUserByLogin(decodeURIComponent(username));

  if (!data) {
    return jsonDataResponse(null, { status: 404 });
  }

  return jsonDataResponse(data);
}
