import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // رفع صورة الرخصة (حتى 5MB) عبر Server Actions
    serverActions: { bodySizeLimit: "6mb" },
  },
};

export default nextConfig;
