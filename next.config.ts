import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  serverExternalPackages: ["@cloudflare/workers-types"],
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
