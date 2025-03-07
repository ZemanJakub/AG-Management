/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "50mb", // Nastavení limitu na 50 MB
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**", // Povolení všech HTTPS obrázků
      },
    ],
    // Přidáno: povolení lokálních obrázků ve složce public
    domains: ["localhost"],
  }
};

module.exports = nextConfig;
