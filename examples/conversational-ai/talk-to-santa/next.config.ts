import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/:path*",
        destination: "https://elevenlabs.io/santa",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
