import {withRequestAudit} from '@/lib/server/route-audit';
import { NextRequest, NextResponse } from 'next/server';

async function handleGET(_req: NextRequest, { params }: { params: Promise<{ owner: string }> }) {
  const { owner } = await params;
  const url = `https://github.com/${encodeURIComponent(owner)}.png?size=80`;

  try {
    const res = await fetch(url, { redirect: 'follow' });
    if (!res.ok) return new NextResponse(null, { status: 404 });

    const buffer = await res.arrayBuffer();
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': res.headers.get('content-type') || 'image/png',
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
      },
    });
  } catch {
    return new NextResponse(null, { status: 502 });
  }
}

export const GET = withRequestAudit('GET /api/avatar/[owner]', handleGET);
