import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow importing from sibling workspace packages
  transpilePackages: ["@ossinsight/db"],
  experimental: {
    // Enable React 19 features
    reactCompiler: false,
  },
};

export default nextConfig;
