import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Hotel from '@/models/Hotel';

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const sessionRole = (session.user as any).role;
        if (sessionRole !== 'hotelOwner' && sessionRole !== 'propertyOwner') {
            return NextResponse.json({ error: 'Forbidden - Hotel Owner access required' }, { status: 403 });
        }

        await dbConnect();

        // Get user with assigned hotels
        const user = await User.findOne({ email: session.user.email }).populate('assignedHotels');
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Get full hotel details for assigned hotels OR where user is the owner
        const hotels = await Hotel.find({
            $or: [
                { _id: { $in: user.assignedHotels || [] } },
                { owner: user._id }
            ]
        });

        return NextResponse.json({ hotels }, { status: 200 });
    } catch (error: any) {
        console.error('Hotel owner properties error:', error);
        return NextResponse.json({ error: error.message || 'Failed to fetch properties' }, { status: 500 });
    }
}
