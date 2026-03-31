import { ImageResponse } from 'next/og';
import { fetchCollections } from '@/utils/api';
import { toCollectionSlug } from '@/lib/collections';
import { listCollectionPreviewRepos } from '@/lib/server/internal-api';

export const runtime = 'nodejs';
export const alt = 'Collection Rankings - OSSInsight';
export const size = { width: 1200, height: 630 };
export const dynamic = 'force-dynamic';
export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // Resolve collection name from slug
  let collectionName = decodeURIComponent(slug).replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  let topRepos: string[] = [];

  try {
    const collections = await fetchCollections();
    const collection = collections.find((c) => toCollectionSlug(c.name) === slug);
    if (collection) {
      collectionName = collection.name;
      const previews = await listCollectionPreviewRepos([collection.id]);
      topRepos = previews
        .filter((p) => p.collection_id === collection.id)
        .sort((a, b) => a.repo_rank - b.repo_rank)
        .slice(0, 5)
        .map((p) => p.repo_name.split('/')[1] ?? p.repo_name);
    }
  } catch (error) {
    console.warn(`[collections/${slug}/opengraph-image] Failed to fetch collection data:`, error);
  }

  const poppinsMedium = fetch(new URL('./Poppins-Medium.ttf', import.meta.url)).then((r) =>
    r.arrayBuffer(),
  );
  const poppinsSemiBold = fetch(new URL('./Poppins-SemiBold.ttf', import.meta.url)).then((r) =>
    r.arrayBuffer(),
  );

  return new ImageResponse(
    (
      <div
        style={{
          background: '#1a1a1b',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          fontFamily: 'Poppins',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Accent top bar */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: 8,
            backgroundColor: '#f7df83',
          }}
        />
        {/* Background glows */}
        <div
          style={{
            position: 'absolute',
            left: -300,
            top: -300,
            width: 900,
            height: 900,
            backgroundImage:
              'radial-gradient(circle, rgba(247,223,131,0.07) 0%, transparent 70%)',
            borderRadius: 9999,
          }}
        />

        {/* Label */}
        <div
          style={{
            fontSize: 16,
            fontWeight: 500,
            color: '#f7df83',
            letterSpacing: 3,
            textTransform: 'uppercase',
            marginBottom: 16,
          }}
        >
          Collection · OSSInsight
        </div>

        {/* Collection name */}
        <div
          style={{
            fontSize: 52,
            fontWeight: 600,
            color: '#ffffff',
            textAlign: 'center',
            maxWidth: 900,
            marginBottom: 28,
            lineHeight: 1.15,
          }}
        >
          {collectionName}
        </div>

        {/* Top repos */}
        {topRepos.length > 0 && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              gap: 12,
              flexWrap: 'wrap',
              justifyContent: 'center',
              maxWidth: 900,
            }}
          >
            {topRepos.map((repo, i) => (
              <div
                key={i}
                style={{
                  backgroundColor: 'rgba(247,223,131,0.12)',
                  border: '1px solid rgba(247,223,131,0.25)',
                  borderRadius: 8,
                  padding: '6px 16px',
                  fontSize: 16,
                  fontWeight: 500,
                  color: 'rgba(255,255,255,0.8)',
                }}
              >
                {repo}
              </div>
            ))}
          </div>
        )}

        {/* Subtitle */}
        <div
          style={{
            fontSize: 17,
            fontWeight: 400,
            color: 'rgba(255,255,255,0.45)',
            marginTop: 28,
          }}
        >
          Rankings &amp; Trends · Updated in real time
        </div>

        {/* Footer */}
        <div
          style={{
            position: 'absolute',
            bottom: 28,
            right: 48,
            fontSize: 15,
            fontWeight: 500,
            color: 'rgba(255,255,255,0.3)',
          }}
        >
          ossinsight.io
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: 'Poppins',
          data: await poppinsMedium,
          style: 'normal' as const,
          weight: 500 as const,
        },
        {
          name: 'Poppins',
          data: await poppinsSemiBold,
          style: 'normal' as const,
          weight: 600 as const,
        },
      ],
    },
  );
}
