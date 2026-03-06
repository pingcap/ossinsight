import createMDX from "@next/mdx";
import nextEnv from "@next/env";

const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd());

/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    const docsHost = process.env.DOCS_BLOG_BASE || 'https://ossinsight.io';
    return [
      {
        source: '/',
        destination: '/widgets',
        permanent: false,
      },
      {
        source: '/docs',
        destination: `${docsHost}/docs`,
        permanent: false,
      },
      {
        source: '/docs/:path*',
        destination: `${docsHost}/docs/:path*`,
        permanent: false,
      },
      {
        source: '/blog',
        destination: `${docsHost}/blog`,
        permanent: false,
      },
      {
        source: '/blog/:path*',
        destination: `${docsHost}/blog/:path*`,
        permanent: false,
      },
    ]
  },
  async rewrites() {
    return [
      { source: '/gh/:path*', destination: '/api/proxy/gh/:path*' },
      { source: '/collections/:path*', destination: '/api/proxy/collections/:path*' },
      { source: '/bot/:path*', destination: '/api/proxy/bot/:path*' },
      { source: '/user/:path*', destination: '/api/proxy/user/:path*' },
      { source: '/v1/:path*', destination: '/api/proxy/v1/:path*' },
      { source: '/public/:path*', destination: '/api/proxy/public/:path*' },
    ];
  },
  pageExtensions: ['ts', 'tsx', 'mdx'],
  experimental: {
    externalDir: true,
  },
  serverExternalPackages: ['@napi-rs/canvas'],
  turbopack: {
    resolveAlias: {
      "@site": "./src",
      "@docusaurus/Link": "./src/compat/docusaurus/Link.tsx",
      "@docusaurus/router": "./src/compat/docusaurus/router.tsx",
      "@docusaurus/Head": "./src/compat/docusaurus/Head.tsx",
      "@docusaurus/useDocusaurusContext": "./src/compat/docusaurus/useDocusaurusContext.ts",
      "@docusaurus/Translate": "./src/compat/docusaurus/Translate.tsx",
      "@docusaurus/isInternalUrl": "./src/compat/docusaurus/isInternalUrl.ts",
      "@docusaurus/BrowserOnly": "./src/compat/docusaurus/BrowserOnly.tsx",
      "@docusaurus/useGlobalData": "./src/compat/docusaurus/useGlobalData.ts",
      "@docusaurus/theme-common": "./src/compat/docusaurus/theme-common.tsx",
      "@docusaurus/theme-common/internal": "./src/compat/docusaurus/theme-common-internal.tsx",
      "@docusaurus/ErrorBoundary": "./src/compat/docusaurus/ErrorBoundary.tsx",
      "@docusaurus/types": "./src/compat/docusaurus/types.ts",
      "@docusaurus/plugin-google-gtag": "./src/compat/docusaurus/plugin-google-gtag.ts",
      "@docusaurus/plugin-content-docs": "./src/compat/docusaurus/plugin-content-docs.ts",
      "@docusaurus/plugin-client-redirects/lib/types": "./src/compat/docusaurus/plugin-client-redirects-types.ts",
      "@docusaurus/core/lib/client/exports/BrowserOnly": "./src/compat/docusaurus/BrowserOnly.tsx",
      "@docusaurus/core/lib/client/exports/useGlobalData": "./src/compat/docusaurus/useGlobalData.ts",
      "@theme/Layout": "./src/compat/theme/Layout.tsx",
      "@theme/NotFound": "./src/compat/theme/NotFound.tsx",
      "@theme/CodeBlock": "./src/compat/theme/CodeBlock.tsx",
      "@theme/Details": "./src/compat/theme/Details.tsx",
      "@theme/Icon/Arrow": "./src/compat/theme/IconArrow.tsx",
      "@theme/DocSidebar": "./src/compat/theme/DocSidebar.tsx",
    },
    rules: {
      "*.sql": {
        loaders: ["raw-loader"],
        as: "*.js",
      },
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.js",
      },
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'github.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
}


const withMDX = createMDX({
  options: {
    remarkPlugins: []
  }
});

export default withMDX(nextConfig);
