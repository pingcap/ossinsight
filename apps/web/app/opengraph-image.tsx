import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'OSSInsight - Open Source Software Insight';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
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
        {/* Background glow */}
        <div
          style={{
            position: 'absolute',
            left: -300,
            top: -300,
            width: 900,
            height: 900,
            backgroundImage:
              'radial-gradient(circle, rgba(247,223,131,0.08) 0%, transparent 70%)',
            borderRadius: 9999,
          }}
        />
        <div
          style={{
            position: 'absolute',
            right: -200,
            bottom: -200,
            width: 700,
            height: 700,
            backgroundImage:
              'radial-gradient(circle, rgba(247,223,131,0.06) 0%, transparent 70%)',
            borderRadius: 9999,
          }}
        />

        {/* Logo / brand */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: 24,
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              backgroundColor: '#f7df83',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 20,
            }}
          >
            <div
              style={{
                fontSize: 36,
                fontWeight: 700,
                color: '#1a1a1b',
              }}
            >
              O
            </div>
          </div>
          <div
            style={{
              fontSize: 52,
              fontWeight: 600,
              color: '#ffffff',
              letterSpacing: '-1px',
            }}
          >
            OSSInsight
          </div>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 26,
            fontWeight: 500,
            color: '#f7df83',
            textAlign: 'center',
            maxWidth: 800,
            marginBottom: 20,
          }}
        >
          Open Source Software Insight
        </div>

        {/* Description */}
        <div
          style={{
            fontSize: 18,
            fontWeight: 400,
            color: 'rgba(255,255,255,0.6)',
            textAlign: 'center',
            maxWidth: 720,
          }}
        >
          Real-time analytics for 10B+ GitHub events · Analyze repos · Compare projects · Explore trends
        </div>

        {/* Footer */}
        <div
          style={{
            position: 'absolute',
            bottom: 28,
            right: 48,
            fontSize: 16,
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
