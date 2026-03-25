import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Booking from '@/models/Booking';
import Hotel from '@/models/Hotel';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: hotelId } = await params;
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const sessionRole = (session.user as any).role;
        if (sessionRole !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        await dbConnect();

        // Verify hotel exists
        const hotel = await Hotel.findById(hotelId);
        if (!hotel) {
            return NextResponse.json({ error: 'Hotel not found' }, { status: 404 });
        }

        // Calculate revenue
        const revenueData = await Booking.aggregate([
            { $match: { hotel: hotel._id, paymentStatus: 'paid' } },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$totalPrice' }
                }
            }
        ]);
        const totalRevenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;

        // Total Confirmed Arrivals (Bookings that are confirmed)
        const totalArrivals = await Booking.countDocuments({
            hotel: hotel._id,
            status: 'confirmed'
        });

        // Total Check-ins (Confirmed bookings where check-in date is in the past)
        const now = new Date();
        const totalCheckIns = await Booking.countDocuments({
            hotel: hotel._id,
            status: 'confirmed',
            checkIn: { $lte: now }
        });

        // Current Bookings (Confirmed bookings where now is between check-in and check-out)
        const currentBookings = await Booking.countDocuments({
            hotel: hotel._id,
            status: 'confirmed',
            checkIn: { $lte: now },
            checkOut: { $gte: now }
        });

        // Recent 5 bookings for this hotel
        const recentBookings = await Booking.find({ hotel: hotel._id })
            .populate('user', 'name email')
            .sort({ createdAt: -1 })
            .limit(5);

        return NextResponse.json({
            hotelName: hotel.name,
            stats: {
                totalRevenue,
                totalArrivals,
                totalCheckIns,
                currentBookings,
            },
            recentBookings
        });

    } catch (error: any) {
        console.error('Hotel stats error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch hotel stats' },
            { status: 500 }
        );
    }
}
