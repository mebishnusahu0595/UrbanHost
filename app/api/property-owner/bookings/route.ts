import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Hotel from '@/models/Hotel';
import Booking from '@/models/Booking';
import User from '@/models/User';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();

    // Check if user is propertyOwner
    const user = await User.findOne({ email: session.user.email });
    if (!user || !['propertyOwner', 'hotelOwner'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Forbidden - Property Owner access required' },
        { status: 403 }
      );
    }

    // Get all property IDs for this owner
    let hotelIds: any[] = [];

    if (user.role === 'hotelOwner' && user.assignedHotels && user.assignedHotels.length > 0) {
      // For hotel owners, use assigned hotels
      hotelIds = user.assignedHotels;
    } else {
      // For property owners, use hotels where they are the owner
      const ownerHotels = await Hotel.find({ owner: user._id }).select('_id');
      hotelIds = ownerHotels.map(h => h._id);
    }

    // Get all bookings for this owner's properties
    const bookings = await Booking.find({ hotel: { $in: hotelIds } })
      .populate('hotel', 'name')
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 });

    return NextResponse.json({
      bookings,
    }, { status: 200 });
  } catch (error: any) {
    console.error('Get bookings error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}
