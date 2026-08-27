import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'StayNTour - Authentic Bed & Breakfasts & Boutique Stays',
    short_name: 'StayNTour',
    description: 'Find your next stay effortlessly. Book verified Bed and Breakfasts & boutique vacation stays in the USA.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#1E3A8A',
    icons: [
      {
        src: '/icon.png',
        sizes: '64x64',
        type: 'image/png',
      },
      {
        src: '/icon.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
