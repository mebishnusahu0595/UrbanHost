import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Booking from '@/models/Booking';

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const sessionRole = (session.user as any).role;
        if (sessionRole !== 'hotelOwner') {
            return NextResponse.json({ error: 'Forbidden - Hotel Owner access required' }, { status: 403 });
        }

        await dbConnect();

        // Get user with assigned hotels
        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const assignedHotelIds = user.assignedHotels || [];

        // Get all bookings for assigned hotels
        const bookings = await Booking.find({ hotel: { $in: assignedHotelIds } })
            .populate('hotel', 'name images address')
            .populate('user', 'name email phone')
            .sort({ createdAt: -1 });

        return NextResponse.json({ bookings }, { status: 200 });
    } catch (error: any) {
        console.error('Hotel owner bookings error:', error);
        return NextResponse.json({ error: error.message || 'Failed to fetch bookings' }, { status: 500 });
    }
}
