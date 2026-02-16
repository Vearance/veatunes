import type { NextConfig } from "next";
import type { RemotePattern } from "next/dist/shared/lib/image-config";

const navidromeUrl = process.env.NAVIDROME_URL;
const navidromePublicUrl = process.env.NEXT_PUBLIC_NAVIDROME_URL;

if (!navidromeUrl) {
  throw new Error("NAVIDROME_URL is not defined");
}
if (!navidromePublicUrl) {
  throw new Error("NAVIDROME_PUBLIC_URL is not defined");
}

const url = new URL(navidromeUrl);
const publicUrl = new URL(navidromePublicUrl);

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
    {
        protocol: publicUrl.protocol.replace(":", "") as RemotePattern["protocol"],
        hostname: publicUrl.hostname,
        port: publicUrl.port,
        pathname: "/rest/**",
      },
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
