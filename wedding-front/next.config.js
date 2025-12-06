/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Désactiver ESLint pendant le build pour la production
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Garder la vérification TypeScript
    ignoreBuildErrors: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
      },
      {
        protocol: 'https',
        hostname: 'kawepla.kaporelo.com',
      }
    ],
  },
};

const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
});

module.exports = withPWA(nextConfig);
