import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Silence Recharts peer-dep warnings during build
  experimental: {},
};

export default nextConfig;
