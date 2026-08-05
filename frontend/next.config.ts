import type { NextConfig } from "next";
import path from "path";

const backendInternal =
  process.env.BACKEND_INTERNAL_URL ?? "http://localhost:4000";

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname),

  /** Enable persistent webpack filesystem cache — dramatically faster
   *  page compilations after the first build (near-instant hot reload). */
  webpack(config, { dev }) {
    if (dev) {
      config.cache = {
        type: "filesystem",
        buildDependencies: {
          config: [__filename],
        },
      };
    }
    return config;
  },

  /** Proxy /api/v1/* → FastAPI backend so the browser never hits CORS */
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${backendInternal}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
