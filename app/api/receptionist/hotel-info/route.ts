import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
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

        const receptionist = await User.findById(userId).populate('assignedHotel', 'name address');

        if (!receptionist || !receptionist.assignedHotel) {
            return NextResponse.json({ hotelName: '' });
        }

        const hotel = receptionist.assignedHotel as any;

        return NextResponse.json({
            hotelName: hotel.name,
            hotelId: hotel._id,
            city: hotel.address?.city || ''
        });

    } catch (error: any) {
        console.error('Hotel info error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
