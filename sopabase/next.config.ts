import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async rewrites() {
    return [
      {
        source: '/api/chat',
        destination: 'http://localhost:5000/api/chat',
      },
    ];
  },
};

export default nextConfig;
