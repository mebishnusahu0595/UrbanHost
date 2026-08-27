import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import VisitorLog from "@/models/VisitorLog";
import { reverseGeocode, getIpLocation } from "@/lib/geo";

function extractClientIp(req: NextRequest): string {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  const cfIp = req.headers.get("cf-connecting-ip");
  if (cfIp) return cfIp.trim();

  return "127.0.0.1";
}

export async function POST(req: NextRequest) {
  try {
    const clientIp = extractClientIp(req);
    const userAgent = req.headers.get("user-agent") || "";

    let body: any = {};
    try {
      body = await req.json();
    } catch {
      // Empty body is acceptable
    }

    const { lat, lng, accuracy } = body;

    // 1. Resolve Location (from GPS if provided, else from IP)
    let locationData: {
      address: string;
      city: string;
      state: string;
      country: string;
      lat?: number;
      lng?: number;
    };

    if (typeof lat === "number" && typeof lng === "number" && !isNaN(lat) && !isNaN(lng)) {
      locationData = await reverseGeocode(lat, lng);
    } else {
      locationData = await getIpLocation(clientIp);
    }

    const finalLat = locationData.lat ?? (typeof lat === "number" ? lat : undefined);
    const finalLng = locationData.lng ?? (typeof lng === "number" ? lng : undefined);

    // 2. Connect DB
    await dbConnect();

    // 3. Check Session for Logged in Users / Admins
    const session = await getServerSession(authOptions);
    let userId: string | undefined;
    let userEmail: string | undefined;
    let userRole = "guest";

    if (session?.user?.email) {
      userEmail = session.user.email.toLowerCase();
      userRole = (session.user as any).role || "user";

      // Update User Profile with newest location & IP
      const updateData: any = {
        lastLoginIp: clientIp,
        lastLocationAddress: locationData.address,
        lastCity: locationData.city,
        lastState: locationData.state,
        lastCountry: locationData.country,
      };

      if (finalLat !== undefined && finalLng !== undefined) {
        updateData.lastLocationCoordinates = { lat: finalLat, lng: finalLng };
      }

      const userDoc = await User.findOneAndUpdate(
        { email: userEmail },
        {
          $set: updateData,
          $push: {
            locationHistory: {
              $each: [
                {
                  ip: clientIp,
                  lat: finalLat,
                  lng: finalLng,
                  address: locationData.address,
                  city: locationData.city,
                  state: locationData.state,
                  country: locationData.country,
                  trackedAt: new Date(),
                  userAgent,
                },
              ],
              $slice: -50, // Keep last 50 locations
            },
          },
        },
        { new: true }
      );

      if (userDoc) {
        userId = userDoc._id.toString();
      }
    }

    // 4. Record in VisitorLog (Non-blocking background insert)
    VisitorLog.create({
      userId,
      userEmail,
      userRole,
      ip: clientIp,
      lat: finalLat,
      lng: finalLng,
      accuracy,
      address: locationData.address,
      city: locationData.city,
      state: locationData.state,
      country: locationData.country,
      userAgent,
      visitedAt: new Date(),
    }).catch((err) => console.warn("VisitorLog create warning:", err));

    return NextResponse.json(
      {
        success: true,
        location: {
          ip: clientIp,
          city: locationData.city,
          state: locationData.state,
          country: locationData.country,
          address: locationData.address,
          coordinates: finalLat && finalLng ? { lat: finalLat, lng: finalLng } : null,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Location tracking error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to track location" },
      { status: 500 }
    );
  }
}
