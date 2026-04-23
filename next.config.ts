// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "image.tmdb.org",
        pathname: "/t/p/**",
      },
      {
        protocol: "https",
        hostname: "xrlccuedpnuqjhztrsmv.supabase.co", // ✅ your Supabase project domain
      },
    ],
  },
  serverExternalPackages: ["@cloudflare/workers-types"],
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
