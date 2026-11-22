const ASSET_ORIGIN = 'https://ossinsight-docs.vercel.app';

export function docsContentSecurityPolicy(nonce: string, development = false) {
  if (!/^[A-Za-z0-9+/=]{16,128}$/.test(nonce)) throw new Error('Invalid CSP nonce.');
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${development ? " 'unsafe-eval'" : ''}`,
    "script-src-attr 'none'",
    `style-src 'self' 'unsafe-inline' ${ASSET_ORIGIN}`,
    `font-src 'self' data: ${ASSET_ORIGIN}`,
    "img-src 'self' data: blob: https:",
    `connect-src 'self' ${ASSET_ORIGIN} https://ossinsight.io https://www.ossinsight.io https://api.ossinsight.io${development ? ' ws: wss:' : ''}`,
    `media-src 'self' ${ASSET_ORIGIN}`,
    "frame-src https://www.youtube.com https://www.youtube-nocookie.com",
    "worker-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    ...(!development ? ['upgrade-insecure-requests'] : []),
  ].join('; ');
}

export function isDocsHtmlPath(pathname: string) {
  if (/^\/(?:_next|api|blog-assets|img)(?:\/|$)/.test(pathname)
      || /^\/llms(?:[/.]|-)/.test(pathname)
      || ['/blog/feed.xml', '/robots.txt', '/sitemap.xml'].includes(pathname)) return false;
  if (/^\/docs(?:\/|$)/.test(pathname)) return !pathname.endsWith('.mdx');
  if (/^\/blog(?:\/|$)/.test(pathname)) return true;
  return !/\.(?:png|jpe?g|gif|webp|avif|svg|ico|css|js|map|woff2?|mp4|webm|pdf)$/i.test(pathname);
}
