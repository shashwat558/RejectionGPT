import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com"

      },
      {
        protocol: "https",
        hostname: "www.google.com"
      },
      { protocol: "https", hostname: "i.pravatar.cc" }
    ]
  }
};

export default nextConfig;
