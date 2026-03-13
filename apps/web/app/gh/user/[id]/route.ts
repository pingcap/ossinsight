import { getUserById, jsonDataResponse } from '@/lib/server/internal-api';

export const runtime = 'edge';

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const data = await getUserById(id);

  if (!data) {
    return jsonDataResponse(null, { status: 404 });
  }

  return jsonDataResponse(data);
}
