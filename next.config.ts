import type { NextConfig } from "next";
import type { RemotePattern } from "next/dist/shared/lib/image-config";

const navidromeUrl = process.env.NAVIDROME_URL;

if (!navidromeUrl) {
  throw new Error("NAVIDROME_URL is not defined");
}

const url = new URL(navidromeUrl);

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: url.protocol.replace(":", "") as RemotePattern["protocol"],
        hostname: url.hostname,
        port: url.port,
        pathname: "/rest/**",
      },
    ],
  },
};

export default nextConfig;
