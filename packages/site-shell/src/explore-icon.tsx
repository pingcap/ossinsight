'use client';

const styles = `
@keyframes explore-icon-container {
  0% { opacity: 1; }
  50% { opacity: 0.7; transform: scale(1.3) rotate(180deg); }
  100% { opacity: 1; transform: rotate(360deg); }
}
@keyframes explore-icon-outer {
  0% { transform: scale(0.8); }
  33% { transform: scale(1.2) rotate(-120deg); }
  66% { transform: scale(1.1) rotate(-240deg); }
  100% { transform: scale(0.8) rotate(-360deg); }
}
@keyframes explore-icon-inner {
  0% { opacity: 0.7; transform: scale(1.2); }
  33% { opacity: 0.8; transform: scale(0.9) rotate(120deg); }
  66% { opacity: 0.9; transform: scale(0.9) rotate(240deg); }
  100% { opacity: 0.7; transform: scale(1.2) rotate(360deg); }
}
`;

export default function ExploreIcon({ width = 20, height = 20 }: { width?: number; height?: number }) {
  const scale = width / 23;
  return (
    <span style={{ display: 'inline-flex', width, height, alignItems: 'center', justifyContent: 'center', verticalAlign: 'middle' }}>
      <style>{styles}</style>
      <span style={{
        display: 'inline-block', position: 'relative', width: 23 * scale, height: 23 * scale,
        backgroundImage: 'url(/img/explore-logo-layer-0.png)', backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center', backgroundSize: 'contain',
        animation: 'explore-icon-container infinite 14.3s linear',
      }}>
        <span style={{
          position: 'absolute', display: 'block', width: 22 * scale, height: 22 * scale,
          backgroundImage: 'url(/img/explore-logo-layer-1.png)', backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center', backgroundSize: 'contain',
          left: 1 * scale, top: 1 * scale,
          animation: 'explore-icon-outer infinite 6s linear',
          transformOrigin: 'center center',
        }} />
        <span style={{
          position: 'absolute', display: 'block', width: 17 * scale, height: 17 * scale,
          backgroundImage: 'url(/img/explore-logo-layer-2.png)', backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center', backgroundSize: 'contain',
          left: 2.5 * scale, top: 2.5 * scale,
          animation: 'explore-icon-inner infinite 8s linear',
          transformOrigin: 'center center',
        }} />
      </span>
    </span>
  );
}
