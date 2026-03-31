import { OG_IMAGE_SIZE, OG_GRADIENT_STYLE } from '@/lib/og-image';
import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Developer Analytics';
export const size = OG_IMAGE_SIZE;
export const dynamic = 'force-dynamic';
export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ login: string }> }) {
  const { login: rawLogin } = await params;
  const login = decodeURIComponent(rawLogin);

  const poppinsMedium = fetch(new URL('./Poppins-Medium.ttf', import.meta.url)).then(r => r.arrayBuffer());
  const poppinsSemiBold = fetch(new URL('./Poppins-SemiBold.ttf', import.meta.url)).then(r => r.arrayBuffer());

  return new ImageResponse(
    (
      <div style={{
        background: '#52099B', width: '100%', height: '100%', display: 'flex',
        flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'Poppins', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 6, backgroundColor: '#FA1EFF' }} />
        <div style={OG_GRADIENT_STYLE} />
        <div style={{ position: 'absolute', right: -100, top: -100, width: 600, height: 600, backgroundImage: 'radial-gradient(circle, rgba(189,8,252,0.15) 0%, transparent 70%)', borderRadius: 9999 }} />

        <img
          src={`https://github.com/${login}.png`}
          width={96}
          height={96}
          style={{ borderRadius: 48, border: '3px solid rgba(255,255,255,0.3)', marginBottom: 16 }}
        />
        <div style={{ fontSize: 36, fontWeight: 600, color: 'white' }}>{login}</div>
        <div style={{ fontSize: 16, fontWeight: 500, color: 'rgba(255,255,255,0.5)', marginTop: 8 }}>Developer Analytics on OSSInsight</div>
        <div style={{ fontSize: 14, fontWeight: 500, color: 'rgba(255,255,255,0.35)', marginTop: 24 }}>
          Contributions · Pull Requests · Code Reviews · Activity
        </div>
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
