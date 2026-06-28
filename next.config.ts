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
        hostname: "lxjweyhofwpwihwckdts.supabase.co",
      },
    ],
  },
};

export default nextConfig;
