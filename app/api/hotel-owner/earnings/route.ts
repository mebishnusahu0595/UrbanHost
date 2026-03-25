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

        // Total earnings (exclude cancelled)
        const totalEarningsData = await Booking.aggregate([
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
                    total: { $sum: '$totalPrice' }
                }
            }
        ]);

        // Monthly earnings for last 6 months
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const monthlyEarnings = await Booking.aggregate([
            {
                $match: {
                    hotel: { $in: assignedHotelIds },
                    paymentStatus: 'paid',
                    status: { $ne: 'cancelled' },
                    createdAt: { $gte: sixMonthsAgo }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' }
                    },
                    earnings: { $sum: '$totalPrice' },
                    bookings: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        // Recent transactions (last 20 paid non-cancelled bookings)
        const transactions = await Booking.find({
            hotel: { $in: assignedHotelIds },
            paymentStatus: 'paid',
            status: { $ne: 'cancelled' }
        })
            .populate('hotel', 'name')
            .populate('user', 'name')
            .sort({ createdAt: -1 })
            .limit(20);

        return NextResponse.json({
            totalEarnings: totalEarningsData.length > 0 ? totalEarningsData[0].total : 0,
            monthlyEarnings,
            transactions,
        }, { status: 200 });
    } catch (error: any) {
        console.error('Hotel owner earnings error:', error);
        return NextResponse.json({ error: error.message || 'Failed to fetch earnings' }, { status: 500 });
    }
}
