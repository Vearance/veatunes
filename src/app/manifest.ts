import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Veatunes',
    short_name: 'Veatunes',
    description: 'A beautiful Navidrome client built with Next.js',
    start_url: '/',
    display: 'standalone',
    background_color: '#09090b',
    theme_color: '#09090b',
    orientation: 'portrait-primary',
    icons: [
      {
        src: '/favicon/logo-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/favicon/logo-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/favicon/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
        purpose: 'apple touch icon' as any
      },
    ],
  }
}
