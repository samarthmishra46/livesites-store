import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  images: {
    // The assistant's poster is the avatar's own still, served by Anam.
    remotePatterns: [{ protocol: "https", hostname: "lab.anam.ai", pathname: "/api/avatars/**" }],
    // Anam sends max-age=300; the still only changes when the avatar does.
    minimumCacheTTL: 86_400,
  },
};

export default nextConfig;
