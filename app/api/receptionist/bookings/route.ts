import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Booking from '@/models/Booking';
import User from '@/models/User';

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userRole = (session.user as any).role;
        const userId = (session.user as any).id;

        if (userRole !== 'receptionist') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        await dbConnect();

        // Get receptionist's assigned hotel
        const receptionist = await User.findById(userId);

        console.log('=== RECEPTIONIST BOOKINGS DEBUG ===');
        console.log('Receptionist ID:', userId);
        console.log('Receptionist Name:', receptionist?.name);
        console.log('Assigned Hotel ID:', receptionist?.assignedHotel);
        console.log('Assigned Hotel ID Type:', typeof receptionist?.assignedHotel);

        if (!receptionist || !receptionist.assignedHotel) {
            console.log('ERROR: No hotel assigned to receptionist');
            return NextResponse.json({ error: 'No hotel assigned' }, { status: 400 });
        }

        // Fetch bookings for the assigned hotel
        const bookings = await Booking.find({
            hotel: receptionist.assignedHotel,
            status: { $in: ['confirmed', 'completed'] }
        })
            .populate('user', 'name email phone')
            .populate('hotel', 'name')
            .sort({ checkInDate: 1 });

        console.log('Total bookings found:', bookings.length);
        console.log('Bookings:', bookings.map(b => ({
            id: b._id,
            hotel: b.hotel,
            status: b.status,
            checkInDate: b.checkInDate
        })));
        console.log('=== END DEBUG ===');

        return NextResponse.json({ bookings });

    } catch (error: any) {
        console.error('Receptionist bookings error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
