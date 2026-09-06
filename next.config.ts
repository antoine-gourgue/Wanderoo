import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "photo.hotellook.com" }],
  },
};

export default nextConfig;
