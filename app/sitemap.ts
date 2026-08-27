import { MetadataRoute } from 'next';
import mongoose from 'mongoose';

const BASE_URL = 'https://stayntour.com';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/stayntour';

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // revalidate every 1 hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/search`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/partner`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
  ];

  // Top USA Tourist Destination Search Routes
  const topCities = [
    'Key West', 'Charleston', 'Savannah', 'Bar Harbor', 'Aspen',
    'Gatlinburg', 'Newport', 'Cape May', 'Taos', 'Saratoga Springs',
    'Asheville', 'Fredericksburg', 'Mackinac Island', 'Anchorage', 'Sedona'
  ];

  const destinationRoutes: MetadataRoute.Sitemap = topCities.map((city) => ({
    url: `${BASE_URL}/search?query=${encodeURIComponent(city)}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.85,
  }));

  // Fetch dynamic Hotel / BnB URLs from MongoDB
  let hotelRoutes: MetadataRoute.Sitemap = [];
  try {
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(MONGODB_URI, {
        serverSelectionTimeoutMS: 4000,
      });
    }

    const hotelsCol = mongoose.connection.db?.collection('hotels');
    if (hotelsCol) {
      const hotels = await hotelsCol
        .find({}, { projection: { _id: 1, updatedAt: 1 } })
        .toArray();

      hotelRoutes = hotels.map((h) => ({
        url: `${BASE_URL}/hotels/${h._id.toString()}`,
        lastModified: h.updatedAt ? new Date(h.updatedAt) : new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      }));
    }
  } catch (error) {
    console.error('Error generating dynamic sitemap from MongoDB:', error);
  }

  return [...staticRoutes, ...destinationRoutes, ...hotelRoutes];
}
