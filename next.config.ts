import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 明确使用 Turbopack（Next.js 16 默认）
  turbopack: {},
  images: {
    unoptimized: true,
  },
};

module.exports = {
  experimental: {
    serverActions: {
      bodySizeLimit: '1mb',
    },
  },
}

export default nextConfig;
