import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '161.33.170.91',
        port: '4533',
        pathname: '/rest/**',
      },
    ],
  },
};

export default nextConfig;
