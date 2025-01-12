import type { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'AGSPACE',
    short_name: 'AG',
    description: 'AGSPACE je aplikace pro správu interních procesů.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    scope: '/',
    theme_color: '#000000',
    icons: [
      {
        src: "/icons/icon-96x96.png", 
        sizes: "96x96",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-128x128.png",
        sizes: "128x128",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-256x256.png",
        sizes: "256x256",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-384x384.png",
        sizes: "384x384",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      } ],
      screenshots: [
      {
        src: "/screenshots/screenshot1.png",
        sizes: "616x1086",
        type: "image/png",
        form_factor: "narrow"
      },
      {
        src: "/screenshots/screenshot2.png",
        sizes: "1951x1093",
        type: "image/png",
        form_factor: "wide"
      }
    ],
  }
}