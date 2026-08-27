import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Booking from "@/models/Booking";
import Hotel from "@/models/Hotel";
import { sendBookingConfirmation } from "@/lib/mail";
import mongoose from "mongoose";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized - Please login" },
        { status: 401 }
      );
    }

    await dbConnect();

    const body = await req.json();
    const {
      hotel,
      roomType,
      checkInDate,
      checkOutDate,
      numberOfRooms = 1,
      guests,
      specialRequests,
      guestInfo,
      paymentMethod = "card",
    } = body;

    // Validate required fields
    if (!hotel || !roomType || !checkInDate || !checkOutDate || !guests || !guestInfo) {
      return NextResponse.json(
        { error: "Missing required booking fields" },
        { status: 400 }
      );
    }

    if (!guestInfo.name || !guestInfo.email || !guestInfo.phone) {
      return NextResponse.json(
        { error: "Guest name, email, and phone are required" },
        { status: 400 }
      );
    }

    // Validate dates
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
      return NextResponse.json(
        { error: "Invalid check-in or check-out date format" },
        { status: 400 }
      );
    }

    // Set time to start of day for comparison
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkInCompare = new Date(checkIn);
    checkInCompare.setHours(0, 0, 0, 0);

    if (checkInCompare < today) {
      return NextResponse.json(
        { error: "Check-in date cannot be in the past" },
        { status: 400 }
      );
    }

    if (checkOut <= checkIn) {
      return NextResponse.json(
        { error: "Check-out date must be after check-in date" },
        { status: 400 }
      );
    }

    const nights = Math.max(
      1,
      Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
    );

    const roomsCount = Math.max(1, parseInt(String(numberOfRooms), 10) || 1);

    // Validate hotel existence
    if (!mongoose.Types.ObjectId.isValid(hotel)) {
      return NextResponse.json(
        { error: "Invalid hotel ID format" },
        { status: 400 }
      );
    }

    const hotelDoc = await Hotel.findById(hotel);
    if (!hotelDoc) {
      return NextResponse.json(
        { error: "Hotel not found" },
        { status: 404 }
      );
    }

    // Find the requested room type
    const room = hotelDoc.rooms.find(
      (r) => r.type.toLowerCase() === String(roomType).toLowerCase()
    );

    if (!room) {
      return NextResponse.json(
        { error: `Selected room type (${roomType}) is not available at this hotel.` },
        { status: 400 }
      );
    }

    // Check availability against overlapping bookings
    const overlappingBookingsCount = await Booking.countDocuments({
      hotel: hotelDoc._id,
      roomType: room.type,
      status: { $in: ["confirmed", "pending"] },
      $or: [
        {
          checkInDate: { $lt: checkOut },
          checkOutDate: { $gt: checkIn },
        },
      ],
    });

    if (overlappingBookingsCount + roomsCount > room.available) {
      return NextResponse.json(
        {
          error: "Selected room type is fully booked for these dates. Please select different dates or rooms.",
        },
        { status: 400 }
      );
    }

    // Server-side price calculation
    const baseRoomPrice = room.price * nights * roomsCount;
    const taxes = Math.round(baseRoomPrice * 0.12); // Standard 12% GST
    const calculatedTotalPrice = baseRoomPrice + taxes;

    // Get user ID
    const sessionUser = session.user as { id?: string; email?: string; name?: string };
    const userId = sessionUser.id;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        { error: "Invalid user session. Please log out and log in again." },
        { status: 400 }
      );
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Create booking
    const booking = await Booking.create({
      hotel: hotelDoc._id,
      user: userObjectId,
      roomType: room.type,
      checkInDate: checkIn,
      checkOutDate: checkOut,
      numberOfRooms: roomsCount,
      guests: {
        adults: Math.max(1, parseInt(String(guests.adults || 1), 10)),
        children: Math.max(0, parseInt(String(guests.children || 0), 10)),
      },
      totalPrice: calculatedTotalPrice,
      specialRequests: specialRequests ? String(specialRequests).slice(0, 500) : undefined,
      guestInfo: {
        name: String(guestInfo.name).trim(),
        email: String(guestInfo.email).trim().toLowerCase(),
        phone: String(guestInfo.phone).trim(),
      },
      paymentMethod: String(paymentMethod),
      status: "confirmed",
      paymentStatus: "paid",
    });

    // Send confirmation email asynchronously
    try {
      if (sessionUser.email || guestInfo.email) {
        await sendBookingConfirmation(
          guestInfo.email || sessionUser.email || "",
          guestInfo.name || sessionUser.name || "Guest",
          booking._id.toString(),
          hotelDoc.name,
          checkIn,
          checkOut,
          calculatedTotalPrice,
          room.type,
          guests
        );
      }
    } catch (emailError) {
      console.error("Failed to send confirmation email:", emailError);
    }

    return NextResponse.json(
      {
        message: "Booking created successfully",
        bookingId: booking._id,
        booking,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Booking creation error:", error);
    const message = error instanceof Error ? error.message : "Failed to create booking";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized - Please login" },
        { status: 401 }
      );
    }

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const sessionUser = session.user as { id?: string };
    const userId = sessionUser.id;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        { error: "Invalid user session. Please log out and log in again." },
        { status: 400 }
      );
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);
    const query: Record<string, unknown> = { user: userObjectId };

    if (status && status !== "all") {
      query.status = status;
    }

    const bookings = await Booking.find(query)
      .populate("hotel", "name address images rating")
      .sort({ createdAt: -1 });

    return NextResponse.json({ bookings }, { status: 200 });
  } catch (error: unknown) {
    console.error("Get bookings error:", error);
    const message = error instanceof Error ? error.message : "Failed to fetch bookings";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
