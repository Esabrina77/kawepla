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
};

module.exports = nextConfig;
