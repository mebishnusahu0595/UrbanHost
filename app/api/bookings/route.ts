import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Booking from '@/models/Booking';
import Hotel from '@/models/Hotel';
import { sendBookingConfirmation } from '@/lib/mail';
import mongoose from 'mongoose';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please login' },
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
      numberOfRooms,
      guests,
      totalPrice,
      specialRequests,
      guestInfo,
    } = body;

    // Validate required fields
    if (!hotel || !roomType || !checkInDate || !checkOutDate || !numberOfRooms || !guests || !totalPrice || !guestInfo) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get user ID and ensure it's a valid ObjectId
    const userId = (session.user as any).id;
    
    // Check if userId exists
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID not found in session. Please log out and log in again.' },
        { status: 400 }
      );
    }
    
    let userObjectId;
    try {
      userObjectId = new mongoose.Types.ObjectId(userId);
    } catch (err) {
      return NextResponse.json(
        { error: 'Invalid user ID format. Please log out and log in again.' },
        { status: 400 }
      );
    }

    // Create booking
    const booking = await Booking.create({
      hotel,
      user: userObjectId,
      roomType,
      checkInDate: new Date(checkInDate),
      checkOutDate: new Date(checkOutDate),
      numberOfRooms,
      guests,
      totalPrice,
      specialRequests,
      guestInfo,
      status: 'confirmed',
      paymentStatus: 'paid',
    });

    // Send confirmation email asynchronously
    try {
      const hotelData = await Hotel.findById(hotel).select('name');
      if (hotelData && session.user.email) {
        await sendBookingConfirmation(
          guestInfo.email || session.user.email,
          guestInfo.name || session.user.name || 'Guest',
          booking._id.toString(),
          hotelData.name,
          new Date(checkInDate),
          new Date(checkOutDate),
          totalPrice,
          roomType,
          guests
        );
      }
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
      // Continue execution, don't fail the request
    }

    return NextResponse.json(
      {
        message: 'Booking created successfully',
        bookingId: booking._id,
        booking
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Booking creation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create booking' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please login' },
        { status: 401 }
      );
    }

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const userId = (session.user as any).id;

    // Check if userId exists
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID not found in session. Please log out and log in again.' },
        { status: 400 }
      );
    }

    // Convert userId to ObjectId if it's a valid string
    let userObjectId;
    try {
      userObjectId = new mongoose.Types.ObjectId(userId);
    } catch (err) {
      return NextResponse.json(
        { error: 'Invalid user ID format. Please log out and log in again.' },
        { status: 400 }
      );
    }

    let query: any = { user: userObjectId };

    if (status && status !== 'all') {
      query.status = status;
    }

    const bookings = await Booking.find(query)
      .populate('hotel', 'name address images')
      .sort({ createdAt: -1 });

    return NextResponse.json({ bookings }, { status: 200 });
  } catch (error: any) {
    console.error('Get bookings error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}
