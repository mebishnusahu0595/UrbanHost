/**
 * High-performance Geo & Reverse Geocoding Utility with In-Memory Caching
 */

interface GeoResult {
  address: string;
  city: string;
  state: string;
  country: string;
  lat?: number;
  lng?: number;
}

// In-memory LRU cache to prevent duplicate external API requests
const geoCache = new Map<string, { data: GeoResult; timestamp: number }>();
const ipCache = new Map<string, { data: GeoResult; timestamp: number }>();
const CACHE_TTL_MS = 1000 * 60 * 60 * 24; // 24 hours

/**
 * Normalizes coordinates to ~100 meter resolution for efficient caching
 */
function getCoordCacheKey(lat: number, lng: number): string {
  return `${lat.toFixed(3)},${lng.toFixed(3)}`;
}

/**
 * Reverse geocode latitude and longitude to human-readable address, city, state, country
 */
export async function reverseGeocode(lat: number, lng: number): Promise<GeoResult> {
  const cacheKey = getCoordCacheKey(lat, lng);
  const cached = geoCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  const fallback: GeoResult = {
    address: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
    city: "Unknown City",
    state: "Unknown State",
    country: "United States",
    lat,
    lng,
  };

  try {
    // 1. Primary: BigDataCloud free client reverse geocoding API (Fast & highly reliable)
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);

    const bdcRes = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`,
      { signal: controller.signal }
    );
    clearTimeout(timeout);

    if (bdcRes.ok) {
      const data = await bdcRes.json();
      const city = data.city || data.locality || data.principalSubdivision || "Unknown City";
      const state = data.principalSubdivision || data.countrySubdivisionCode || "";
      const country = data.countryName || "United States";
      const address = [city, state, country].filter(Boolean).join(", ");

      const result: GeoResult = {
        address,
        city,
        state,
        country,
        lat,
        lng,
      };

      geoCache.set(cacheKey, { data: result, timestamp: Date.now() });
      return result;
    }
  } catch (error) {
    // Attempt OpenStreetMap Nominatim fallback
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3000);

      const nomRes = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14&addressdetails=1`,
        {
          headers: { "User-Agent": "StayNTour-App/1.0 (info@stayntour.com)" },
          signal: controller.signal,
        }
      );
      clearTimeout(timeout);

      if (nomRes.ok) {
        const data = await nomRes.json();
        const addr = data.address || {};
        const city = addr.city || addr.town || addr.village || addr.suburb || "Unknown City";
        const state = addr.state || "";
        const country = addr.country || "United States";
        const address = data.display_name || [city, state, country].filter(Boolean).join(", ");

        const result: GeoResult = {
          address,
          city,
          state,
          country,
          lat,
          lng,
        };

        geoCache.set(cacheKey, { data: result, timestamp: Date.now() });
        return result;
      }
    } catch (nomErr) {
      console.warn("Reverse geocode fallback error:", nomErr);
    }
  }

  return fallback;
}

/**
 * Resolve location from IP address (for users who decline GPS or guest tracking)
 */
export async function getIpLocation(ip: string): Promise<GeoResult> {
  const cleanIp = ip.replace(/^::ffff:/, "").trim();

  // Return default for local/private IPs
  if (
    !cleanIp ||
    cleanIp === "127.0.0.1" ||
    cleanIp === "::1" ||
    cleanIp.startsWith("192.168.") ||
    cleanIp.startsWith("10.") ||
    cleanIp.startsWith("172.")
  ) {
    return {
      address: "Local Network",
      city: "New York",
      state: "New York",
      country: "United States",
      lat: 40.7128,
      lng: -74.006,
    };
  }

  const cached = ipCache.get(cleanIp);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);

    const res = await fetch(`http://ip-api.com/json/${cleanIp}?fields=status,country,regionName,city,lat,lon,query`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      if (data.status === "success") {
        const city = data.city || "Unknown City";
        const state = data.regionName || "";
        const country = data.country || "United States";
        const address = [city, state, country].filter(Boolean).join(", ");

        const result: GeoResult = {
          address,
          city,
          state,
          country,
          lat: data.lat,
          lng: data.lon,
        };

        ipCache.set(cleanIp, { data: result, timestamp: Date.now() });
        return result;
      }
    }
  } catch (error) {
    console.warn("IP Geo lookup error for", cleanIp, error);
  }

  return {
    address: cleanIp,
    city: "Unknown City",
    state: "Unknown State",
    country: "United States",
  };
}
