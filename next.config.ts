import { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    webpackBuildWorker: true,
    parallelServerBuildTraces: true,
    parallelServerCompiles: true,
  },
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
