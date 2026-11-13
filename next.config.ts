import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: false,
  serverExternalPackages: ["@react-pdf/renderer"],
};

export default nextConfig;