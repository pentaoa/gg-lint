import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 明确使用 Turbopack（Next.js 16 默认）
  turbopack: {},
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
