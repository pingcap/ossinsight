import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Collection';
export const size = { width: 800, height: 418 };
export const dynamic = 'force-dynamic';
export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const name = decodeURIComponent(slug).replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  const poppinsMedium = fetch(new URL('./Poppins-Medium.ttf', import.meta.url)).then(r => r.arrayBuffer());
  const poppinsSemiBold = fetch(new URL('./Poppins-SemiBold.ttf', import.meta.url)).then(r => r.arrayBuffer());

  return new ImageResponse(
    (
      <div style={{
        background: '#52099B', width: '100%', height: '100%', display: 'flex',
        flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
        fontFamily: 'Poppins', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 6, backgroundColor: '#FA1EFF' }} />
        <div style={{ position: 'absolute', left: -200, top: -200, width: 800, height: 800, backgroundImage: 'radial-gradient(circle, rgba(255,99,174,0.12) 0%, transparent 70%)', borderRadius: 9999 }} />
        <div style={{ position: 'absolute', right: -100, top: -100, width: 600, height: 600, backgroundImage: 'radial-gradient(circle, rgba(189,8,252,0.15) 0%, transparent 70%)', borderRadius: 9999 }} />

        <div style={{ fontSize: 16, fontWeight: 500, color: 'rgba(255,255,255,0.5)', marginBottom: 12 }}>COLLECTION</div>
        <div style={{ fontSize: 40, fontWeight: 600, color: 'white', textAlign: 'center', maxWidth: 600 }}>{name}</div>
        <div style={{ fontSize: 16, fontWeight: 500, color: 'rgba(255,255,255,0.5)', marginTop: 16 }}>Rankings & Trends on OSSInsight</div>
        <div style={{ position: 'absolute', bottom: 20, right: 40, fontSize: 18, fontWeight: 500, color: 'rgba(255,255,255,0.4)' }}>ossinsight.io</div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: 'Poppins', data: await poppinsMedium, style: 'normal' as const, weight: 500 as const },
        { name: 'Poppins', data: await poppinsSemiBold, style: 'normal' as const, weight: 600 as const },
      ],
    },
  );
}
