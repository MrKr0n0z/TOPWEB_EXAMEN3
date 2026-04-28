import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return {
      beforeFiles: [],
      afterFiles: [
        {
          source: '/api/:path*',
          destination: 'https://sii.celaya.tecnm.mx/api/:path*',
        },
      ],
      fallback: [],
    };
  },
};

export default nextConfig;
