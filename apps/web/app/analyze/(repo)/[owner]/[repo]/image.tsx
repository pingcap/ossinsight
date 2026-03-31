import { OG_IMAGE_SIZE, OG_GRADIENT_STYLE } from '@/lib/og-image';
import { getRepoByName } from '@/lib/server/internal-api';
import { notFound } from 'next/navigation';
import { ImageResponse } from 'next/og';

export const size = OG_IMAGE_SIZE;

export default async function Image({ params }: { params: Promise<{ owner: string; repo: string }> }) {
  const { owner: rawOwner, repo: rawRepo } = await params;
  const owner = decodeURIComponent(rawOwner);
  const repo = decodeURIComponent(rawRepo);
  const repoInfo = await getRepoByName(owner, repo);

  if (!repoInfo) {
    notFound();
  }

  const nf = new Intl.NumberFormat('en');

  const poppinsMedium = fetch(
    new URL('./Poppins-Medium.ttf', import.meta.url),
  ).then((res) => res.arrayBuffer());
  const poppinsSemiBold = fetch(
    new URL('./Poppins-SemiBold.ttf', import.meta.url),
  ).then((res) => res.arrayBuffer());

  return new ImageResponse(
    (
      <div
        style={{
          background: '#52099B',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: 'Poppins',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Top accent bar */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 6, backgroundColor: '#FA1EFF' }} />

        {/* Background gradient circles */}
        <div style={{ display: 'flex', position: 'absolute', left: 0, top: 0, width: '100%', height: '100%' }}>
          <div style={OG_GRADIENT_STYLE} />
          <div style={{ position: 'absolute', right: -100, top: -100, width: 600, height: 600, backgroundImage: 'radial-gradient(circle, rgba(189,8,252,0.15) 0%, transparent 70%)', borderRadius: 9999 }} />
        </div>

        {/* Avatar + repo name */}
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginTop: 50, marginLeft: 40, gap: 16 }}>
          <img
            alt={`${rawOwner} avatar`}
            src={`https://github.com/${rawOwner}.png`}
            width={72}
            height={72}
            style={{ borderRadius: 36, border: '2px solid rgba(255,255,255,0.3)' }}
          />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 36, fontWeight: 600, color: 'white', lineHeight: '42px' }}>
              {owner}/{repo}
            </div>
            {repoInfo.language && (
              <div style={{ fontSize: 16, fontWeight: 500, color: 'rgba(255,255,255,0.6)', marginTop: 4 }}>
                {repoInfo.language}
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        {repoInfo.description && (
          <div style={{
            fontSize: 16,
            fontWeight: 500,
            color: 'rgba(255,255,255,0.7)',
            marginTop: 20,
            marginLeft: 40,
            marginRight: 40,
            lineHeight: '22px',
            overflow: 'hidden',
            display: '-webkit-box',
            maxHeight: 44,
          }}>
            {repoInfo.description.length > 120
              ? repoInfo.description.slice(0, 120) + '...'
              : repoInfo.description}
          </div>
        )}

        {/* Stats row */}
        <div style={{ display: 'flex', flexDirection: 'row', gap: 48, marginTop: 40, marginLeft: 40 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: '#FF9C65' }}>Stars</div>
            <div style={{ fontSize: 32, fontWeight: 600, color: 'white' }}>
              {nf.format(repoInfo.stars)}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: '#FF6FB4' }}>Forks</div>
            <div style={{ fontSize: 32, fontWeight: 600, color: 'white' }}>
              {nf.format(repoInfo.forks)}
            </div>
          </div>
          {repoInfo.license && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ fontSize: 14, fontWeight: 500, color: '#8BBAFF' }}>License</div>
              <div style={{ fontSize: 24, fontWeight: 600, color: 'white', marginTop: 4 }}>
                {repoInfo.license}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          position: 'absolute',
          bottom: 20,
          right: 40,
          fontSize: 18,
          fontWeight: 500,
          color: 'rgba(255,255,255,0.5)',
        }}>
          ossinsight.io
        </div>
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
