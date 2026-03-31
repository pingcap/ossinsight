import createMDX from "@next/mdx";
import withSvgr from "next-plugin-svgr";
import { fileURLToPath } from "url";
import { createRequire } from "module";
import path from "path";

const require = createRequire(import.meta.url);

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable trailing slashes — canonical URLs have no trailing slash.
  // Vercel will redirect /path/ → /path automatically when this is false (default).
  trailingSlash: false,
  outputFileTracingRoot: path.join(__dirname, '../../'),
  transpilePackages: ['@repo/site-shell'],
  typescript: {
    ignoreBuildErrors: true,
  },
  async redirects() {
    return []
  },
  async rewrites() {
    // Local dev: proxy to docs dev server
    if (process.env.NODE_ENV === 'development') {
      const docsOrigin = process.env.DOCS_ORIGIN || 'http://127.0.0.1:3002';
      return {
        beforeFiles: [
          { source: '/blog', destination: `${docsOrigin}/blog` },
          { source: '/blog/:path*', destination: `${docsOrigin}/blog/:path*` },
          { source: '/docs', destination: `${docsOrigin}/docs` },
          { source: '/docs/:path*', destination: `${docsOrigin}/docs/:path*` },
        ],
      };
    }
    // Production: handled by vercel.json rewrites
    return [];
  },
  pageExtensions: ['ts', 'tsx', 'mdx'],
  serverExternalPackages: ['@napi-rs/canvas'],
  turbopack: {
    resolveAlias: {
      '@tanstack/react-query': './node_modules/@tanstack/react-query',
    },
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
      '*.sql': {
        loaders: ['raw-loader'],
        as: '*.js',
      },
    },
  },
  webpack: (config, { isServer }) => {
    config.module.rules.push({
        test: /\.sql$/,
        use: 'raw-loader',
    })
    config.externals.push('@napi-rs/canvas')

    // Ensure shared packages use the same @tanstack/react-query instance as the app
    config.resolve.alias = {
      ...config.resolve.alias,
      '@tanstack/react-query': path.resolve(__dirname, 'node_modules/@tanstack/react-query'),
    };

    return config;
  },
  svgrOptions: {
    ref: true,
    svgo: false,
    replaceAttrValues: {
      fill: 'currentColor',
    },
  },
  images: {
    dangerouslyAllowSVG: true,
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

export default withSvgr(withMDX(nextConfig));
