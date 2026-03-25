import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Hotel from '@/models/Hotel';
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

        // Get stats for assigned hotels only
        const totalProperties = assignedHotelIds.length;

        const totalBookings = await Booking.countDocuments({
            hotel: { $in: assignedHotelIds }
        });
        const confirmedBookings = await Booking.countDocuments({
            hotel: { $in: assignedHotelIds },
            status: 'confirmed'
        });
        const pendingBookings = await Booking.countDocuments({
            hotel: { $in: assignedHotelIds },
            status: 'pending'
        });

        // Calculate earnings (exclude cancelled)
        const earningsData = await Booking.aggregate([
            {
                $match: {
                    hotel: { $in: assignedHotelIds },
                    paymentStatus: 'paid',
                    status: { $ne: 'cancelled' }
                }
            },
            {
                $group: {
                    _id: null,
                    totalEarnings: { $sum: '$totalPrice' }
                }
            }
        ]);

        // This month earnings
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const thisMonthData = await Booking.aggregate([
            {
                $match: {
                    hotel: { $in: assignedHotelIds },
                    paymentStatus: 'paid',
                    status: { $ne: 'cancelled' },
                    createdAt: { $gte: startOfMonth }
                }
            },
            {
                $group: {
                    _id: null,
                    thisMonthEarnings: { $sum: '$totalPrice' }
                }
            }
        ]);

        // Recent bookings
        const recentBookings = await Booking.find({ hotel: { $in: assignedHotelIds } })
            .populate('hotel', 'name')
            .populate('user', 'name email')
            .sort({ createdAt: -1 })
            .limit(10);

        return NextResponse.json({
            stats: {
                totalProperties,
                totalBookings,
                confirmedBookings,
                pendingBookings,
                totalEarnings: earningsData.length > 0 ? earningsData[0].totalEarnings : 0,
                thisMonthEarnings: thisMonthData.length > 0 ? thisMonthData[0].thisMonthEarnings : 0,
            },
            recentBookings,
        }, { status: 200 });
    } catch (error: any) {
        console.error('Hotel owner stats error:', error);
        return NextResponse.json({ error: error.message || 'Failed to fetch stats' }, { status: 500 });
    }
}
