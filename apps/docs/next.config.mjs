import { fileURLToPath } from "url";
import path from "path";
import { createMDX } from 'fumadocs-mdx/next';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const nextConfig = {
  assetPrefix: process.env.VERCEL_ENV === 'production' ? 'https://ossinsight-docs.vercel.app' : undefined,
  typescript: {
    ignoreBuildErrors: true,
  },
  allowedDevOrigins: ['127.0.0.1', 'localhost'],
  outputFileTracingRoot: path.join(__dirname, '../../'),
  transpilePackages: ['@repo/site-shell'],
  turbopack: {
    resolveAlias: {
      '@tanstack/react-query': './node_modules/@tanstack/react-query',
    },
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@tanstack/react-query': path.resolve(__dirname, 'node_modules/@tanstack/react-query'),
    };
    return config;
  },
  async rewrites() {
    return [
      {
        source: '/docs/api.mdx',
        destination: '/llms.mdx/api',
      },
      {
        source: '/docs/api/:slug.mdx',
        destination: '/llms.mdx/api/:slug',
      },
      {
        source: '/docs/:path*.mdx',
        destination: '/llms.mdx/docs/:path*',
      },
    ];
  },
};

export default withMDX(nextConfig);
