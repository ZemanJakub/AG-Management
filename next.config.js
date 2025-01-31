/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
      serverActions: {
        bodySizeLimit: "50mb", // Nastavení limitu na 10 MB
      },
    },
      images: {
          remotePatterns: [
            {
              protocol: 'https',
              hostname: '**', // Povolení všech HTTPS obrázků
            },
          ],
        }
  }
  
  module.exports = nextConfig
  