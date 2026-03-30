/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Disable x-powered-by header
  poweredByHeader: false,
  // Transpile NeoPop (ESM package)
  transpilePackages: ['@cred/neopop-web'],
  images: {
    remotePatterns: [],
  },
  // API proxy to FastAPI backend (dev only; in prod use NEXT_PUBLIC_API_URL)
  async rewrites() {
    return process.env.NODE_ENV === 'development'
      ? [
          {
            source: '/api/backend/:path*',
            destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/:path*`,
          },
        ]
      : [];
  },
};

module.exports = nextConfig;
