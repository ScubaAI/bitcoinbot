/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'bitcoin.org',
      },
    ],
  },
  // Si usas Prisma en el edge runtime, necesitas esto:
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.ignoreWarnings = [
        { module: /node_modules\/@prisma\/client/ },
      ];
    }
    return config;
  },
};

module.exports = nextConfig;