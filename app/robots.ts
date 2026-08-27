import { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXTAUTH_URL || 'https://stayntour.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/hotels/',
          '/search',
          '/about',
          '/contact',
          '/privacy',
          '/partner',
          '/bnb-images/',
        ],
        disallow: [
          '/admin/',
          '/property-owner/',
          '/property-panel/',
          '/receptionist/',
          '/api/',
          '/my-bookings/',
          '/profile/',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/admin/',
          '/property-owner/',
          '/property-panel/',
          '/receptionist/',
          '/api/',
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
