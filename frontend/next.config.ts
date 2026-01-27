import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  // Note: In Next.js 16, ESLint is no longer run during build by default, 
  // so the 'eslint' config block is removed.
};

export default nextConfig;
