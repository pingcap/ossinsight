import { getRepoByName } from '@/lib/server/internal-api';
import { notFound } from 'next/navigation';
import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Repository Comparison';
export const size = { width: 800, height: 418 };
export const dynamic = 'force-dynamic';
export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ owner1: string; repo1: string; owner2: string; repo2: string }> }) {
  const { owner1: rawOwner1, repo1: rawRepo1, owner2: rawOwner2, repo2: rawRepo2 } = await params;
  const owner1 = decodeURIComponent(rawOwner1);
  const repo1 = decodeURIComponent(rawRepo1);
  const owner2 = decodeURIComponent(rawOwner2);
  const repo2 = decodeURIComponent(rawRepo2);

  const [repoInfo, vsRepoInfo] = await Promise.all([
    getRepoByName(owner1, repo1),
    getRepoByName(owner2, repo2),
  ]);

  if (!repoInfo || !vsRepoInfo) {
    notFound();
  }

  const nf = new Intl.NumberFormat('en');

  return new ImageResponse(
    (
      <div
        style={{
          background: '#52099B',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: 'sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Top accent bar */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 6, backgroundColor: '#FA1EFF' }} />

        {/* Background gradient circles */}
        <div style={{ display: 'flex', position: 'absolute', left: 0, top: 0, width: '100%', height: '100%' }}>
          <div style={{ position: 'absolute', left: -200, top: -200, width: 800, height: 800, backgroundImage: 'radial-gradient(circle, rgba(255,99,174,0.12) 0%, transparent 70%)', borderRadius: 9999 }} />
          <div style={{ position: 'absolute', right: -100, top: -100, width: 600, height: 600, backgroundImage: 'radial-gradient(circle, rgba(189,8,252,0.15) 0%, transparent 70%)', borderRadius: 9999 }} />
        </div>

        {/* Comparison layout */}
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 60, gap: 32, padding: '0 40px' }}>
          {/* Repo 1 */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
            <img
              src={`https://github.com/${rawOwner1}.png`}
              width={64}
              height={64}
              style={{ borderRadius: 32, border: '2px solid rgba(255,255,255,0.3)' }}
            />
            <div style={{ fontSize: 22, fontWeight: 600, color: 'white', marginTop: 12, textAlign: 'center' }}>
              {owner1}/{repo1}
            </div>
            {repoInfo.language && (
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', marginTop: 4 }}>
                {repoInfo.language}
              </div>
            )}
            <div style={{ display: 'flex', gap: 24, marginTop: 16 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ fontSize: 12, color: '#FF9C65' }}>Stars</div>
                <div style={{ fontSize: 24, fontWeight: 600, color: 'white' }}>{nf.format(repoInfo.stars)}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ fontSize: 12, color: '#FF6FB4' }}>Forks</div>
                <div style={{ fontSize: 24, fontWeight: 600, color: 'white' }}>{nf.format(repoInfo.forks)}</div>
              </div>
            </div>
          </div>

          {/* VS divider */}
          <div style={{ fontSize: 36, fontWeight: 700, color: '#FA1EFF' }}>VS</div>

          {/* Repo 2 */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
            <img
              src={`https://github.com/${rawOwner2}.png`}
              width={64}
              height={64}
              style={{ borderRadius: 32, border: '2px solid rgba(255,255,255,0.3)' }}
            />
            <div style={{ fontSize: 22, fontWeight: 600, color: 'white', marginTop: 12, textAlign: 'center' }}>
              {owner2}/{repo2}
            </div>
            {vsRepoInfo.language && (
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', marginTop: 4 }}>
                {vsRepoInfo.language}
              </div>
            )}
            <div style={{ display: 'flex', gap: 24, marginTop: 16 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ fontSize: 12, color: '#FF9C65' }}>Stars</div>
                <div style={{ fontSize: 24, fontWeight: 600, color: 'white' }}>{nf.format(vsRepoInfo.stars)}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ fontSize: 12, color: '#FF6FB4' }}>Forks</div>
                <div style={{ fontSize: 24, fontWeight: 600, color: 'white' }}>{nf.format(vsRepoInfo.forks)}</div>
              </div>
            </div>
          </div>
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
    { ...size },
  );
}
