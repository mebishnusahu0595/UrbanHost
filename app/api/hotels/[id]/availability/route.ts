import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Hotel from "@/models/Hotel";
import Booking from "@/models/Booking";
import mongoose from "mongoose";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid hotel ID" }, { status: 400 });
    }

    const { searchParams } = new URL(req.url);
    const fromStr = searchParams.get("from");
    const toStr = searchParams.get("to");

    await dbConnect();

    const hotel = await Hotel.findById(id).select("name rooms");
    if (!hotel) {
      return NextResponse.json({ error: "Hotel not found" }, { status: 404 });
    }

    if (!fromStr || !toStr) {
      // Default: return static room capacities if dates are not specified
      const roomAvailability = (hotel.rooms || []).map((r: any) => ({
        _id: r._id,
        type: r.type,
        name: r.name || r.type,
        totalCapacity: r.available || 2,
        bookedCount: 0,
        availableCount: r.available || 2,
        isAvailable: (r.available || 2) > 0,
      }));

      return NextResponse.json({
        hotelId: id,
        hasDates: false,
        rooms: roomAvailability,
      });
    }

    const checkIn = new Date(fromStr);
    const checkOut = new Date(toStr);

    if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime()) || checkOut <= checkIn) {
      return NextResponse.json({ error: "Invalid date range" }, { status: 400 });
    }

    // Find all active overlapping bookings for this property
    const overlappingBookings = await Booking.find({
      hotel: new mongoose.Types.ObjectId(id),
      status: { $in: ["confirmed", "pending"] },
      checkInDate: { $lt: checkOut },
      checkOutDate: { $gt: checkIn },
    }).select("roomType numberOfRooms");

    // Aggregate booked counts by room type (case-insensitive)
    const bookedMap: Record<string, number> = {};
    for (const b of overlappingBookings) {
      const key = (b.roomType || "").toLowerCase().trim();
      const count = b.numberOfRooms || 1;
      bookedMap[key] = (bookedMap[key] || 0) + count;
    }

    const roomAvailability = (hotel.rooms || []).map((r: any) => {
      const roomKey = (r.type || r.name || "").toLowerCase().trim();
      const totalCapacity = typeof r.available === "number" && r.available > 0 ? r.available : 2;
      const bookedCount = bookedMap[roomKey] || 0;
      const availableCount = Math.max(0, totalCapacity - bookedCount);

      return {
        _id: r._id,
        type: r.type,
        name: r.name || r.type,
        totalCapacity,
        bookedCount,
        availableCount,
        isAvailable: availableCount > 0,
      };
    });

    return NextResponse.json({
      hotelId: id,
      hasDates: true,
      checkIn: checkIn.toISOString(),
      checkOut: checkOut.toISOString(),
      rooms: roomAvailability,
    });
  } catch (error: any) {
    console.error("Availability Check Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to check room availability" },
      { status: 500 }
    );
  }
}
